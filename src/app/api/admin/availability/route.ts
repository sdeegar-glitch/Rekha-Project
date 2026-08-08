// API Route: Manage Availability (Admin)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { availabilityCreateSchema, availabilityFiltersSchema } from '@/validators'
import { RecurrencePattern, SlotStatus } from '@prisma/client'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const filters = availabilityFiltersSchema.parse({
      serviceId: searchParams.get('serviceId') || undefined,
      dayOfWeek: searchParams.get('dayOfWeek') ? parseInt(searchParams.get('dayOfWeek')!) : undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    })

    const where: any = { userId: session.user.id }

    if (filters.serviceId) where.serviceId = filters.serviceId
    if (filters.dayOfWeek !== undefined) where.dayOfWeek = filters.dayOfWeek
    if (filters.isActive !== undefined) where.isActive = filters.isActive

    if (filters.dateFrom || filters.dateTo) {
      where.OR = [
        { dayOfWeek: { not: null } },
        { specificDate: {} },
      ]
      if (filters.dateFrom) where.OR[1].specificDate.gte = filters.dateFrom
      if (filters.dateTo) where.OR[1].specificDate.lte = filters.dateTo
    }

    const [total, availabilities] = await Promise.all([
      db.availability.count({ where }),
      db.availability.findMany({
        where,
        include: {
          service: { select: { id: true, name: true, color: true } },
          timeSlots: {
            where: filters.dateFrom || filters.dateTo ? {
              startTime: {
                gte: filters.dateFrom || new Date(0),
                lte: filters.dateTo || new Date('2099-12-31'),
              },
            } : undefined,
            orderBy: { startTime: 'asc' },
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { specificDate: 'asc' },
          { startTime: 'asc' },
        ],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ])

    return NextResponse.json({
      data: availabilities,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = availabilityCreateSchema.parse(body)

    // Create availability
    const availability = await db.availability.create({
      data: {
        userId: session.user.id,
        serviceId: validated.serviceId,
        dayOfWeek: validated.dayOfWeek,
        specificDate: validated.specificDate,
        startTime: validated.startTime,
        endTime: validated.endTime,
        slotDuration: validated.slotDuration,
        bufferTime: validated.bufferTime,
        recurrence: validated.recurrence,
        recurrenceEnd: validated.recurrenceEnd,
        notes: validated.notes,
      },
    })

    // Generate time slots
    await generateTimeSlots(availability)

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'AVAILABILITY_CREATED',
        entity: 'Availability',
        entityId: availability.id,
        newData: validated,
      },
    })

    return NextResponse.json({ availability }, { status: 201 })
  } catch (error) {
    console.error('Error creating availability:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}

async function generateTimeSlots(availability: any) {
  const slotsToCreate = []
  const now = new Date()
  const endDate = availability.recurrenceEnd || addDays(now, 60)

  if (availability.dayOfWeek !== null && availability.dayOfWeek !== undefined) {
    // Recurring weekly schedule
    for (let d = new Date(now); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === availability.dayOfWeek) {
        const slots = generateSlotsForDay(d, availability)
        slotsToCreate.push(...slots)
      }
    }
  } else if (availability.specificDate) {
    // One-time availability
    const date = new Date(availability.specificDate)
    const slots = generateSlotsForDay(date, availability)
    slotsToCreate.push(...slots)
  }

  if (slotsToCreate.length > 0) {
    await db.timeSlot.createMany({
      data: slotsToCreate.map((slot) => ({
        ...slot,
        availabilityId: availability.id,
        isRecurring: availability.recurrence !== RecurrencePattern.NONE,
      })),
      skipDuplicates: true,
    })
  }
}

function generateSlotsForDay(date: Date, availability: any) {
  const slots = []
  const [startHour, startMin] = availability.startTime.split(':').map(Number)
  const [endHour, endMin] = availability.endTime.split(':').map(Number)

  const slotStart = new Date(date)
  slotStart.setHours(startHour, startMin, 0, 0)

  const slotEnd = new Date(date)
  slotEnd.setHours(endHour, endMin, 0, 0)

  const totalMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60)
  const slotCount = Math.floor(totalMinutes / (availability.slotDuration + availability.bufferTime))

  for (let i = 0; i < slotCount; i++) {
    const start = new Date(slotStart)
    start.setMinutes(start.getMinutes() + i * (availability.slotDuration + availability.bufferTime))

    const end = new Date(start)
    end.setMinutes(end.getMinutes() + availability.slotDuration)

    if (end > slotEnd) break

    slots.push({
      startTime: start,
      endTime: end,
      status: SlotStatus.AVAILABLE,
      serviceId: availability.serviceId,
    })
  }

  return slots
}