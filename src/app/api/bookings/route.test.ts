import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/db', () => ({
  db: {
    timeSlot: { findUnique: vi.fn() },
    service: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

function makeRequest(body: unknown) {
  return { json: async () => body } as any
}

const VALID_SLOT_ID = 'ckv0a1b2c3d4e5f6g7h8i9j0k'

const availableSlot = {
  id: VALID_SLOT_ID,
  status: 'AVAILABLE',
  startTime: new Date('2026-09-01T09:00:00Z'),
  endTime: new Date('2026-09-01T09:50:00Z'),
  availability: { userId: 'admin_1' },
}

const activeService = { id: 'svc_1', isActive: true, name: 'Individual Therapy' }

const guestPatientInfo = {
  name: 'Test Patient',
  email: 'newpatient@example.com',
  phone: '+919876543210',
  dateOfBirth: '1990-01-01',
  address: 'Test Address',
}

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when the time slot does not exist', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue(null as any)

    const res = await POST(makeRequest({ serviceId: 'svc_1', timeSlotId: 'ckv9z8y7x6w5v4u3t2s1r0q9p' }))
    expect(res.status).toBe(404)
  })

  it('returns 409 when the time slot is no longer available', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue({ ...availableSlot, status: 'BOOKED' } as any)

    const res = await POST(makeRequest({ serviceId: 'svc_1', timeSlotId: VALID_SLOT_ID }))
    expect(res.status).toBe(409)
  })

  it('returns 400 for a guest booking with no patient info', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue(availableSlot as any)
    vi.mocked(db.service.findUnique).mockResolvedValue(activeService as any)

    const res = await POST(makeRequest({ serviceId: 'svc_1', timeSlotId: VALID_SLOT_ID }))
    expect(res.status).toBe(400)
  })

  it('returns 409 for a guest booking whose email already has an account (no silent impersonation)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue(availableSlot as any)
    vi.mocked(db.service.findUnique).mockResolvedValue(activeService as any)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'existing_user', email: guestPatientInfo.email } as any)

    const res = await POST(
      makeRequest({ serviceId: 'svc_1', timeSlotId: VALID_SLOT_ID, patientInfo: guestPatientInfo })
    )
    expect(res.status).toBe(409)
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('creates the appointment for a brand-new guest email', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue(availableSlot as any)
    vi.mocked(db.service.findUnique).mockResolvedValue(activeService as any)
    vi.mocked(db.user.findUnique).mockResolvedValue(null as any)
    vi.mocked(db.user.create).mockResolvedValue({ id: 'new_user', email: guestPatientInfo.email } as any)

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) =>
      cb({
        timeSlot: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        appointment: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'appt_1',
            adminId: 'admin_1',
            status: 'PENDING',
            service: activeService,
            timeSlot: availableSlot,
            patient: { id: 'new_user', name: guestPatientInfo.name, email: guestPatientInfo.email, phone: guestPatientInfo.phone },
          }),
        },
        notification: { create: vi.fn().mockResolvedValue({}) },
        auditLog: { create: vi.fn().mockResolvedValue({}) },
      })
    )

    const res = await POST(
      makeRequest({ serviceId: 'svc_1', timeSlotId: VALID_SLOT_ID, patientInfo: guestPatientInfo })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.appointment.status).toBe('PENDING')
  })

  it('returns 409 when two requests race for the same slot (optimistic lock loses)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(db.timeSlot.findUnique).mockResolvedValue(availableSlot as any)
    vi.mocked(db.service.findUnique).mockResolvedValue(activeService as any)
    vi.mocked(db.user.findUnique).mockResolvedValue(null as any)
    vi.mocked(db.user.create).mockResolvedValue({ id: 'new_user', email: guestPatientInfo.email } as any)

    vi.mocked(db.$transaction).mockImplementation(async (cb: any) =>
      cb({
        timeSlot: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
        appointment: { findFirst: vi.fn(), create: vi.fn() },
        notification: { create: vi.fn() },
        auditLog: { create: vi.fn() },
      })
    )

    const res = await POST(
      makeRequest({ serviceId: 'svc_1', timeSlotId: VALID_SLOT_ID, patientInfo: guestPatientInfo })
    )
    expect(res.status).toBe(409)
  })
})
