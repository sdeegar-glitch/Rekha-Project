import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { db } from '@/lib/db'
import { AppointmentStatus, PaymentStatus } from '@prisma/client'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('x-razorpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 })
  }

  try {
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'payment.captured': {
        const paymentData = event.payload.payment.entity
        await handlePaymentCaptured(paymentData)
        break
      }
      case 'payment.failed': {
        const paymentData = event.payload.payment.entity
        await handlePaymentFailed(paymentData)
        break
      }
      case 'refund.processed': {
        const refundData = event.payload.refund.entity
        await handleRefund(refundData)
        break
      }
      default:
        console.log(`Unhandled Razorpay event type: ${event.event}`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentCaptured(paymentData: any) {
  const payment = await db.payment.findFirst({
    where: { razorpayOrderId: paymentData.order_id },
    include: { appointment: { include: { timeSlot: true, service: true, patient: true } } },
  })

  if (!payment) {
    console.error('Payment not found for order:', paymentData.order_id)
    return
  }

  // Only update if it's not already marked as succeeded by the frontend verification
  if (payment.status !== PaymentStatus.SUCCEEDED) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        razorpayPaymentId: paymentData.id,
        paidAt: new Date(),
        method: paymentData.method,
      },
    })

    await db.appointment.update({
      where: { id: payment.appointmentId },
      data: {
        status: AppointmentStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    })

    if (payment.appointment.timeSlot) {
      await db.timeSlot.update({
        where: { id: payment.appointment.timeSlotId },
        data: { status: 'BOOKED' },
      })
    }
  }
}

async function handlePaymentFailed(paymentData: any) {
  const payment = await db.payment.findFirst({
    where: { razorpayOrderId: paymentData.order_id },
    include: { appointment: { include: { service: true, patient: true } } },
  })

  if (!payment) return

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      failedReason: paymentData.error_description || 'Payment failed',
    },
  })

  await db.appointment.update({
    where: { id: payment.appointmentId },
    data: { status: AppointmentStatus.CANCELLED },
  })
  
  if (payment.appointment.timeSlotId) {
    await db.timeSlot.update({
      where: { id: payment.appointment.timeSlotId },
      data: { status: 'AVAILABLE' },
    })
  }

  await db.notification.create({
    data: {
      userId: payment.patientId,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: `Your payment for ${payment.appointment.service.name} could not be processed. Please try again or contact us.`,
      data: { paymentId: payment.id, appointmentId: payment.appointmentId },
    },
  })
}

async function handleRefund(refundData: any) {
  const paymentId = refundData.payment_id
  
  const payment = await db.payment.findFirst({
    where: { razorpayPaymentId: paymentId },
    include: { appointment: { include: { service: true, patient: true } } },
  })

  if (!payment) return

  const refundAmount = refundData.amount / 100 // Convert from paise

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: refundAmount >= Number(payment.amount) 
        ? PaymentStatus.REFUNDED 
        : PaymentStatus.PARTIALLY_REFUNDED,
      refundedAmount: { increment: refundAmount },
      refundedAt: new Date(),
    },
  })

  await db.notification.create({
    data: {
      userId: payment.patientId,
      type: 'PAYMENT_SUCCEEDED', // Reuse for refund notification
      title: 'Refund Processed',
      message: `A refund of ${payment.currency} ${refundAmount.toLocaleString()} has been processed for ${payment.appointment.service.name}.`,
      data: { paymentId: payment.id, appointmentId: payment.appointmentId },
    },
  })
}