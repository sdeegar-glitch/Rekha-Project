import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder } from '@/lib/razorpay'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { paymentIntentSchema } from '@/validators'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = paymentIntentSchema.parse(body)

    // Verify appointment exists and is pending
    const appointment = await db.appointment.findUnique({
      where: { id: validated.appointmentId },
      include: { service: true, patient: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.patientId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (appointment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Appointment is not in pending status' }, { status: 400 })
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(
      Number(validated.amount),
      validated.currency,
      appointment.id
    )

    // Create payment record
    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        amount: validated.amount,
        currency: validated.currency,
        status: 'PENDING',
        razorpayOrderId: order.id,
        method: validated.method,
        metadata: validated.metadata,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
