// API Route: Get Appointments (Admin)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { appointmentFiltersSchema } from '@/validators'
import { AppointmentStatus } from '@prisma/client'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const filters = appointmentFiltersSchema.parse({
      status: searchParams.getAll('status'),
      serviceId: searchParams.get('serviceId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    // Build where clause
    const where: any = {}

    if (filters.status?.length) {
      where.status = { in: filters.status }
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId
    }

    if (filters.patientId) {
      where.patientId = filters.patientId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.timeSlot = {}
      if (filters.dateFrom) where.timeSlot.startTime = { gte: filters.dateFrom }
      if (filters.dateTo) where.timeSlot.endTime = { lte: filters.dateTo }
    }

    if (filters.search) {
      where.OR = [
        { patient: { name: { contains: filters.search, mode: 'insensitive' } } },
        { patient: { email: { contains: filters.search, mode: 'insensitive' } } },
        { service: { name: { contains: filters.search, mode: 'insensitive' } } },
      ]
    }

    // Get total count
    const total = await db.appointment.count({ where })

    // Get appointments
    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true, image: true } },
        service: { select: { id: true, name: true, duration: true, price: true, color: true } },
        timeSlot: { select: { id: true, startTime: true, endTime: true } },
        payment: { select: { id: true, amount: true, currency: true, status: true, method: true } },
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: filters.sortBy === 'startTime'
        ? { timeSlot: { startTime: filters.sortOrder } }
        : filters.sortBy
          ? ({ [filters.sortBy]: filters.sortOrder } as any)
          : { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    })

    // Format response
    const formattedAppointments = appointments.map((apt) => ({
      ...apt,
      startTime: apt.timeSlot.startTime.toISOString(),
      endTime: apt.timeSlot.endTime.toISOString(),
      time: format(new Date(apt.timeSlot.startTime), 'h:mm a'),
      date: format(new Date(apt.timeSlot.startTime), 'yyyy-MM-dd'),
    }))

    return NextResponse.json({
      data: formattedAppointments,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 })
    }

    // Get existing appointment
    const existing = await db.appointment.findUnique({
      where: { id },
      include: { timeSlot: true, service: true, patient: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Update appointment
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        cancellationReason: data.cancellationReason,
        cancelledAt: data.status === 'CANCELLED' ? new Date() : undefined,
        cancelledBy: data.status === 'CANCELLED' ? session.user.id : undefined,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        service: true,
        timeSlot: true,
      },
    })

    // Handle status changes
    if (data.status && data.status !== existing.status) {
      // Update time slot status
      if (data.status === 'CANCELLED' || data.status === 'NO_SHOW') {
        await db.timeSlot.update({
          where: { id: existing.timeSlotId },
          data: { status: 'AVAILABLE' },
        })
      }

      // Create notification for patient
      await db.notification.create({
        data: {
          userId: existing.patientId,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Updated',
          message: `Your ${existing.service.name} appointment status has been updated to ${data.status}.`,
          data: { appointmentId: appointment.id, status: data.status },
        },
      })

      // Audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'APPOINTMENT_UPDATED',
          entity: 'Appointment',
          entityId: id,
          oldData: { status: existing.status },
          newData: { status: data.status },
        },
      })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}