// API Route: Get Available Slots
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { format, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceId = searchParams.get('serviceId')
    const dateStr = searchParams.get('date')

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: 'serviceId and date are required' },
        { status: 400 }
      )
    }

    const date = parseISO(dateStr)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // 1. Fetch the service to get its duration
    const service = await db.service.findUnique({
      where: { id: serviceId }
    })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 2. Ensure an availability profile exists
    let availability = await db.availability.findFirst({
      where: { serviceId }
    })

    if (!availability) {
      const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
      if (!admin) throw new Error('No admin user found to assign availability to')
      
      availability = await db.availability.create({
        data: {
          userId: admin.id,
          serviceId,
          startTime: '09:00',
          endTime: '18:00',
          slotDuration: service.duration,
        }
      })
    }

    // 3. Fetch existing slots for the day
    const existingSlots = await db.timeSlot.findMany({
      where: {
        OR: [
          { serviceId },
          { serviceId: null, availability: { serviceId } }
        ],
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
    })

    // 4. Generate expected slots from 9 AM to 6 PM
    const expectedSlots = []
    let currentTime = new Date(date)
    currentTime.setHours(9, 0, 0, 0)
    
    const maxEndTime = new Date(date)
    maxEndTime.setHours(18, 0, 0, 0)

    while (currentTime < maxEndTime) {
      const slotEndTime = new Date(currentTime.getTime() + service.duration * 60000)
      if (slotEndTime > maxEndTime) break
      
      expectedSlots.push({
        availabilityId: availability.id,
        serviceId,
        startTime: new Date(currentTime),
        endTime: new Date(slotEndTime),
        status: 'AVAILABLE' as const,
      })
      
      currentTime = slotEndTime
    }

    // 5. Find missing slots
    const missingSlots = expectedSlots.filter(expected => 
      !existingSlots.some(existing => existing.startTime.getTime() === expected.startTime.getTime())
    )

    // 6. Insert missing slots. skipDuplicates guards the race where a
    // concurrent request (or a slight timestamp mismatch) already inserted
    // the same (availabilityId, startTime) slot - the unique constraint
    // would otherwise turn that into a hard 500 for every viewer of this date.
    if (missingSlots.length > 0) {
      await db.timeSlot.createMany({
        data: missingSlots,
        skipDuplicates: true,
      })
    }

    // 7. Refetch all slots to get their real DB IDs
    const timeSlots = await db.timeSlot.findMany({
      where: {
        OR: [
          { serviceId },
          { serviceId: null, availability: { serviceId } }
        ],
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        availability: {
          select: { serviceId: true }
        }
      },
      orderBy: { startTime: 'asc' },
    })

    const slots = timeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      status: slot.status,
      serviceId: slot.serviceId || slot.availability?.serviceId,
      availabilityId: slot.availabilityId,
    }))

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}