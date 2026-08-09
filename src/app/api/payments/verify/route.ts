import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AppointmentStatus, PaymentStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay parameters' }, { status: 400 })
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Find the payment record
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { appointment: { include: { timeSlot: true, service: true, patient: true } } },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Ensure it belongs to the user or an admin, if logged in
    if (session?.user && session.user.role !== 'ADMIN' && payment.patientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      return NextResponse.json({ success: true, message: 'Already verified' })
    }

    // Update payment status
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
    })

    // Update appointment status
    await db.appointment.update({
      where: { id: payment.appointmentId },
      data: {
        status: AppointmentStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    })

    // Mark time slot as booked
    if (payment.appointment.timeSlot) {
      await db.timeSlot.update({
        where: { id: payment.appointment.timeSlotId },
        data: { status: 'BOOKED' },
      })
    }

    // Create notifications
    await db.notification.createMany({
      data: [
        {
          userId: payment.patientId,
          type: 'PAYMENT_SUCCEEDED',
          title: 'Payment Successful',
          message: `Your payment of ${payment.currency} ${Number(payment.amount).toLocaleString()} for ${payment.appointment.service.name} has been processed.`,
          data: { paymentId: payment.id, appointmentId: payment.appointmentId },
        },
        {
          userId: payment.appointment.adminId || '',
          type: 'PAYMENT_SUCCEEDED',
          title: 'Payment Received',
          message: `Payment of ${payment.currency} ${Number(payment.amount).toLocaleString()} received for ${payment.appointment.service.name} with ${payment.appointment.patient.name}.`,
          data: { paymentId: payment.id, appointmentId: payment.appointmentId },
        },
      ],
    })

    return NextResponse.json({ success: true, appointmentId: payment.appointmentId })
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
