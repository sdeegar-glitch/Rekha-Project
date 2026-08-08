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

    const timeSlots = await db.timeSlot.findMany({
      where: {
        OR: [
          { serviceId },
          { serviceId: null, availability: { serviceId } }
        ],
        status: 'AVAILABLE',
        startTime: { gte: startOfDay, lte: endOfDay },
        availability: {
          isActive: true
        }
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
      serviceId: slot.serviceId || slot.availability.serviceId,
      availabilityId: slot.availabilityId,
    }))

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    )
  }
}