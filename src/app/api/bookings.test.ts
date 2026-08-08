// @ts-nocheck
// Integration Tests for Booking Flow
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { request } from 'undici'
import { execSync } from 'child_process'
import { prisma } from '@/prisma/client'

describe('Booking Flow Integration', () => {
  let server: any
  const BASE_URL = 'http://localhost:3000'

  beforeAll(async () => {
    // Start test server
    server = await startTestServer()
  })

  afterAll(async () => {
    await server.close()
  })

  beforeEach(async () => {
    // Clear test data
    await prisma.appointment.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.timeSlot.deleteMany({ where: { status: 'BOOKED' } })
    await prisma.notification.deleteMany()
    await prisma.auditLog.deleteMany()
    
    // Create test service and availability
    const service = await prisma.service.create({
      data: {
        name: 'Test Therapy',
        description: 'Test service',
        duration: 50,
        price: 1000,
        color: '#3B82F6',
        isActive: true,
      },
    })

    const availability = await prisma.availability.create({
      data: {
        userId: 'admin-test-id', // Would be created in real test
        serviceId: service.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 50,
        bufferTime: 10,
        recurrence: 'WEEKLY',
        isActive: true,
      },
    })

    // Create time slots for today
    const today = new Date()
    today.setHours(9, 0, 0, 0)
    const endTime = new Date(today)
    endTime.setHours(17, 0, 0, 0)

    const slots = []
    let currentTime = new Date(today)
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime)
      slotEnd.setMinutes(currentTime.getMinutes() + 50)
      
      slots.push({
        availabilityId: availability.id,
        serviceId: service.id,
        startTime: currentTime,
        endTime: slotEnd,
        status: 'AVAILABLE',
        isRecurring: true,
      })
      
      currentTime = new Date(slotEnd.getTime() + 10 * 60000) // Add buffer
    }

    await prisma.timeSlot.createMany({ data: slots })
  })

  it('should allow booking an appointment', async () => {
    // Get available slots for today
    const todayStr = new Date().toISOString().split('T')[0]
    const slotsResponse = await request(
      `${BASE_URL}/api/availability/slots?serviceId=test-service-id&date=${todayStr}`
    )
    expect(slotsResponse.statusCode).toBe(200)
    const slotsData = await slotsResponse.body.json()
    expect(slotsData.slots.length).toBeGreaterThan(0)
    
    const slot = slotsData.slots[0]
    
    // Create booking
    const bookingResponse = await request(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'test-service-id',
        timeSlotId: slot.id,
        reason: 'Test appointment',
        notes: 'Integration test',
        patientInfo: {
          name: 'Test Patient',
          email: 'test@example.com',
          phone: '+919876543210',
          dateOfBirth: '1990-01-01',
          address: 'Test Address',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+919876543211',
            relationship: 'Friend'
          }
        }
      })
    })
    
    expect(bookingResponse.statusCode).toBe(200)
    const bookingData = await bookingResponse.body.json()
    expect(bookingData.appointment).toBeDefined()
    expect(bookingData.appointment.status).toBe('PENDING')
    
    // Verify slot is now booked
    const updatedSlot = await prisma.timeSlot.findUnique({
      where: { id: slot.id }
    })
    expect(updatedSlot.status).toBe('BOOKED')
  })

  it('should prevent double booking', async () => {
    // Get available slot
    const todayStr = new Date().toISOString().split('T')[0]
    const slotsResponse = await request(
      `${BASE_URL}/api/availability/slots?serviceId=test-service-id&date=${todayStr}`
    )
    const slotsData = await slotsResponse.body.json()
    const slot = slotsData.slots[0]
    
    // First booking
    await request(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'test-service-id',
        timeSlotId: slot.id,
        reason: 'First booking',
        patientInfo: {
          name: 'Test Patient 1',
          email: 'test1@example.com',
          phone: '+919876543210',
          dateOfBirth: '1990-01-01',
          address: 'Test Address',
          emergencyContact: {
            name: 'Emergency Contact 1',
            phone: '+919876543211',
            relationship: 'Friend'
          }
        }
      })
    })
    
    // Second booking attempt should fail
    const secondResponse = await request(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'test-service-id',
        timeSlotId: slot.id,
        reason: 'Second booking',
        patientInfo: {
          name: 'Test Patient 2',
          email: 'test2@example.com',
          phone: '+919876543212',
          dateOfBirth: '1990-01-01',
          address: 'Test Address',
          emergencyContact: {
            name: 'Emergency Contact 2',
            phone: '+919876543213',
            relationship: 'Friend'
          }
        }
      })
    })
    
    expect(secondResponse.statusCode).toBe(409) // Conflict
  })
})

// Helper function to start test server
async function startTestServer() {
  // In a real test, you'd start your Next.js server in test mode
  // For this example, we'll return a mock
  return {
    close: async () => {}
  }
}