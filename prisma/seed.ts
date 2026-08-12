import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { services as frontendServices } from '../src/lib/constants'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rekhapatel.com' },
    update: {},
    create: {
      email: 'admin@rekhapatel.com',
      name: 'Rekha Patel Admin',
      role: 'ADMIN',
      passwordHash: adminPassword,
    },
  })
  console.log('Admin user created:', admin.email)

  // Remove stray Service rows left over from earlier seed iterations that
  // don't correspond to anything in the frontend's services list.
  const validIds = frontendServices.map((s) => s.id)
  await prisma.service.deleteMany({ where: { id: { notIn: validIds } } })

  // Clean up old slots/availability so they regenerate against the full
  // service list below.
  await prisma.timeSlot.deleteMany()
  await prisma.availability.deleteMany()

  // 2. Create every service the frontend actually offers, so slot loading
  // never 404s for a service that's selectable in the UI but missing here.
  const dbServices = []
  for (const svc of frontendServices) {
    const created = await prisma.service.upsert({
      where: { id: svc.id },
      update: {},
      create: {
        id: svc.id,
        name: svc.name,
        description: svc.description,
        duration: svc.duration,
        price: svc.price,
        currency: svc.currency,
        color: svc.color,
        sortOrder: svc.sortOrder,
      },
    })
    dbServices.push(created)
  }
  console.log(`${dbServices.length} services created.`)

  // 3. Create an Availability rule per service and generate slots for the
  // next 7 weekdays (10:00 AM and 2:00 PM), so the booking calendar has
  // something to show immediately for every service.
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slotsToCreate: Prisma.TimeSlotCreateManyInput[] = []
  for (const service of dbServices) {
    const availability = await prisma.availability.create({
      data: {
        userId: admin.id,
        serviceId: service.id,
        dayOfWeek: 1, // dummy — specific dates are generated explicitly below
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: service.duration,
        bufferTime: 10,
      },
    })

    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(today)
      slotDate.setDate(today.getDate() + i)
      if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue // weekdays only

      for (const hour of [10, 14]) {
        const start = new Date(slotDate)
        start.setHours(hour, 0, 0, 0)
        const end = new Date(start)
        end.setMinutes(start.getMinutes() + service.duration)

        slotsToCreate.push({
          availabilityId: availability.id,
          serviceId: service.id,
          startTime: start,
          endTime: end,
          status: 'AVAILABLE',
        })
      }
    }
  }

  const existingSlots = await prisma.timeSlot.count()
  if (existingSlots === 0) {
    await prisma.timeSlot.createMany({ data: slotsToCreate })
    console.log(`Created ${slotsToCreate.length} time slots.`)
  } else {
    console.log('Time slots already exist, skipping generation.')
  }

  // 4. Create Default Clinic Settings
  const existingSettings = await prisma.clinicSettings.count()
  if (existingSettings === 0) {
    await prisma.clinicSettings.create({
      data: {
        clinicName: 'Rekha Patel Psychology Clinic',
        clinicEmail: 'admin@rekhapatel.com',
        clinicPhone: '+91 9876543210',
        clinicAddress: '123 Health Ave, Wellness City',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        cancellationPolicy: 'Please cancel at least 24 hours in advance.',
      },
    })
    console.log('Default clinic settings created.')
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
