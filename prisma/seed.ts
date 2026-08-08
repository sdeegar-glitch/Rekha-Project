import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // 2. Create Default Services
  const initialConsultation = await prisma.service.upsert({
    where: { id: 'service_initial_consult' },
    update: {},
    create: {
      id: 'service_initial_consult',
      name: 'Initial Consultation',
      description: 'A 60-minute initial evaluation and discussion of your needs.',
      duration: 60,
      price: 1500,
      color: '#3B82F6', // Blue
      sortOrder: 1,
    },
  })

  const therapySession = await prisma.service.upsert({
    where: { id: 'service_therapy' },
    update: {},
    create: {
      id: 'service_therapy',
      name: 'Therapy Session',
      description: 'Standard 45-minute psychotherapy session.',
      duration: 45,
      price: 1200,
      color: '#10B981', // Green
      sortOrder: 2,
    },
  })
  console.log('Services created.')

  // 3. Create Availability Rules and TimeSlots for the next 30 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Example: Available Monday to Friday, 9:00 AM to 5:00 PM for Initial Consultation
  const availability = await prisma.availability.create({
    data: {
      userId: admin.id,
      serviceId: initialConsultation.id,
      dayOfWeek: 1, // Monday (dummy, since we are generating specific dates below anyway, but it satisfies schema if needed)
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60,
      bufferTime: 10,
    },
  })

  // Generate some slots for the next 7 days to ensure booking calendar works immediately
  const slotsToCreate: Prisma.TimeSlotCreateManyInput[] = []
  for (let i = 1; i <= 7; i++) {
    const slotDate = new Date(today)
    slotDate.setDate(today.getDate() + i)
    // Only weekdays
    if (slotDate.getDay() !== 0 && slotDate.getDay() !== 6) {
      // 10:00 AM Slot
      const start1 = new Date(slotDate)
      start1.setHours(10, 0, 0, 0)
      const end1 = new Date(start1)
      end1.setMinutes(start1.getMinutes() + 60)

      // 2:00 PM Slot
      const start2 = new Date(slotDate)
      start2.setHours(14, 0, 0, 0)
      const end2 = new Date(start2)
      end2.setMinutes(start2.getMinutes() + 60)

      slotsToCreate.push({
        availabilityId: availability.id,
        serviceId: initialConsultation.id,
        startTime: start1,
        endTime: end1,
        status: 'AVAILABLE',
      })
      slotsToCreate.push({
        availabilityId: availability.id,
        serviceId: therapySession.id,
        startTime: start2,
        endTime: end2,
        status: 'AVAILABLE',
      })
    }
  }

  // Use createMany for slots
  // We can't use upsert with createMany easily, so we just clear and create if none exist
  const existingSlots = await prisma.timeSlot.count()
  if (existingSlots === 0) {
    await prisma.timeSlot.createMany({
      data: slotsToCreate,
    })
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
