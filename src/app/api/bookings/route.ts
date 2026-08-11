// API Route: Create Booking
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointmentCreateSchema } from '@/validators'
import { AppointmentStatus, SlotStatus } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const validated = appointmentCreateSchema.parse(body)

    // Verify time slot exists and is available
    const timeSlot = await db.timeSlot.findUnique({
      where: { id: validated.timeSlotId },
      include: { availability: true },
    })

    if (!timeSlot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
    }

    if (timeSlot.status !== SlotStatus.AVAILABLE) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
    }

    // Verify service exists
    const service = await db.service.findUnique({
      where: { id: validated.serviceId, isActive: true },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Determine patient (logged in user or new patient)
    let patientId: string
    let patientEmail: string

    if (session?.user) {
      // Check if user exists, create if not
      let user = await db.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        user = await db.user.create({
          data: {
            email: session.user.email,
            name: session.user.name,
            role: 'PATIENT',
          },
        })
      }
      patientId = user.id
      patientEmail = user.email
    } else {
      // Create new patient from provided info
      if (!validated.patientInfo) {
        return NextResponse.json({ error: 'Patient information required for guest booking' }, { status: 400 })
      }

      let user = await db.user.findUnique({
        where: { email: validated.patientInfo.email },
      })

      if (user) {
        // This email already belongs to a registered account — require sign-in
        // rather than silently attaching a guest booking to it.
        return NextResponse.json(
          { error: 'An account already exists for this email. Please sign in to book.' },
          { status: 409 }
        )
      }

      user = await db.user.create({
        data: {
          email: validated.patientInfo.email,
          name: validated.patientInfo.name,
          phone: validated.patientInfo.phone,
          dateOfBirth: new Date(validated.patientInfo.dateOfBirth),
          address: validated.patientInfo.address,
          emergencyContact: validated.patientInfo.emergencyContact,
          role: 'PATIENT',
        },
      })
      patientId = user.id
      patientEmail = user.email
    }

    // Use Prisma Transaction to ensure atomic booking creation
    const appointment = await db.$transaction(async (tx) => {
      // 1. Mark time slot as booked (Optimistic Locking)
      const updatedSlot = await tx.timeSlot.updateMany({
        where: { id: validated.timeSlotId, status: SlotStatus.AVAILABLE },
        data: { status: SlotStatus.BOOKED },
      })

      if (updatedSlot.count === 0) {
        throw new Error('SLOT_UNAVAILABLE')
      }

      // 2. Check for conflicting appointments
      const existingAppointment = await tx.appointment.findFirst({
        where: {
          patientId,
          timeSlot: {
            startTime: { lt: timeSlot.endTime },
            endTime: { gt: timeSlot.startTime },
          },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      })

      if (existingAppointment) {
        throw new Error('CONFLICT')
      }

      // 3. Create appointment
      const newAppointment = await tx.appointment.create({
        data: {
          patientId,
          adminId: timeSlot.availability.userId,
          serviceId: validated.serviceId,
          timeSlotId: validated.timeSlotId,
          status: AppointmentStatus.PENDING,
          reason: validated.reason,
          notes: validated.notes,
          bookedForName: validated.bookedForName,
          bookedForRelationship: validated.bookedForRelationship,
        },
        include: {
          service: true,
          timeSlot: true,
          patient: { select: { id: true, name: true, email: true, phone: true } },
        },
      })

      // 4. Create notification for patient
      await tx.notification.create({
        data: {
          userId: patientId,
          type: 'APPOINTMENT_CREATED',
          title: 'Appointment Requested',
          message: `Your ${service.name} appointment has been requested for ${format(new Date(timeSlot.startTime), 'MMMM d, yyyy \'at\' h:mm a')}. Awaiting confirmation.`,
          data: { appointmentId: newAppointment.id },
        },
      })

      // 5. Create notification for admin
      await tx.notification.create({
        data: {
          userId: newAppointment.adminId!,
          type: 'APPOINTMENT_CREATED',
          title: 'New Appointment Request',
          message: validated.bookedForName
            ? `${newAppointment.patient.name} requested ${service.name} for ${validated.bookedForName} (${validated.bookedForRelationship}) on ${format(new Date(timeSlot.startTime), 'MMMM d, yyyy \'at\' h:mm a')}.`
            : `${newAppointment.patient.name} requested ${service.name} for ${format(new Date(timeSlot.startTime), 'MMMM d, yyyy \'at\' h:mm a')}.`,
          data: { appointmentId: newAppointment.id, patientName: newAppointment.patient.name },
        },
      })

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          userId: patientId,
          action: 'APPOINTMENT_CREATED',
          entity: 'Appointment',
          entityId: newAppointment.id,
          newData: {
            serviceId: newAppointment.serviceId,
            timeSlotId: newAppointment.timeSlotId,
            status: newAppointment.status,
          },
        },
      })

      return newAppointment
    })

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        serviceName: appointment.service.name,
        date: format(new Date(timeSlot.startTime), 'yyyy-MM-dd'),
        time: format(new Date(timeSlot.startTime), 'h:mm a'),
        status: appointment.status,
      },
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        console.error('Zod Validation Error:', (error as any).issues)
        return NextResponse.json({ error: 'Invalid request data', issues: (error as any).issues }, { status: 400 })
      }
      if (error.message === 'SLOT_UNAVAILABLE') {
        return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 })
      }
      if (error.message === 'CONFLICT') {
        return NextResponse.json({ error: 'You already have an appointment at this time' }, { status: 409 })
      }
    }
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

function format(date: Date, pattern: string): string {
  // Simple format implementation - in production use date-fns format
  return date.toLocaleString('en-IN', {
    year: pattern.includes('yyyy') ? 'numeric' : undefined,
    month: pattern.includes('MMMM') ? 'long' : pattern.includes('MMM') ? 'short' : '2-digit',
    day: pattern.includes('dd') ? '2-digit' : undefined,
    hour: pattern.includes('h') ? 'numeric' : undefined,
    minute: pattern.includes('mm') ? '2-digit' : undefined,
    hour12: pattern.includes('a'),
  })
}