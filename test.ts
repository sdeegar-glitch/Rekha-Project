import { db } from './src/lib/db'
import { parseISO } from 'date-fns'

async function main() {
  const serviceId = 'individual-therapy'
  const dateStr = '2026-08-10'

  const date = parseISO(dateStr)
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
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
    console.log(timeSlots)
  } catch (error) {
    console.error("ERROR:", error)
  }
}

main().then(() => process.exit(0))
