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

    // Find availabilities for this service and day of week
    const dayOfWeek = date.getDay()
    
    const availabilities = await db.availability.findMany({
      where: {
        serviceId,
        isActive: true,
        OR: [
          { dayOfWeek, recurrence: { not: 'NONE' } },
          { specificDate: { gte: startOfDay, lte: endOfDay } },
        ],
      },
      include: {
        timeSlots: {
          where: {
            startTime: { gte: startOfDay, lte: endOfDay },
            status: 'AVAILABLE',
          },
          orderBy: { startTime: 'asc' },
        },
      },
    })

    // Flatten and format slots
    const slots = availabilities.flatMap((avail) =>
      avail.timeSlots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        status: slot.status,
        serviceId: slot.serviceId || avail.serviceId,
        availabilityId: avail.id,
      }))
    )

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}