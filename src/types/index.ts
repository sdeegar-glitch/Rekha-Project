// TypeScript Types
import { UserRole, AppointmentStatus, PaymentStatus, SlotStatus, RecurrencePattern, NotificationType } from '@prisma/client'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Appointment types
export interface AppointmentWithRelations {
  id: string
  patientId: string
  adminId: string | null
  serviceId: string
  timeSlotId: string
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  adminNotes: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  cancelledAt: Date | null
  cancelledBy: string | null
  cancellationReason: string | null
  rescheduledFrom: string | null
  rescheduledTo: string | null
  reminderSent: boolean
  reminderSentAt: Date | null
  confirmedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  patient: {
    id: string
    name: string | null
    email: string
    phone: string | null
    image: string | null
  }
  admin: {
    id: string
    name: string | null
    email: string
  } | null
  service: {
    id: string
    name: string
    duration: number
    price: number
    currency: string
    color: string
  }
  timeSlot: {
    id: string
    startTime: Date
    endTime: Date
    status: SlotStatus
  }
  payment: {
    id: string
    amount: number
    currency: string
    status: PaymentStatus
    method: string | null
    paidAt: Date | null
  } | null
}

// Time slot with availability info
export interface TimeSlotWithAvailability {
  id: string
  startTime: Date
  endTime: Date
  status: SlotStatus
  service: {
    id: string
    name: string
    duration: number
    price: number
    currency: string
    color: string
  }
  availability: {
    id: string
    bufferTime: number
  }
}

// Availability with slots
export interface AvailabilityWithSlots {
  id: string
  dayOfWeek: number | null
  specificDate: Date | null
  startTime: string
  endTime: string
  slotDuration: number
  bufferTime: number
  recurrence: RecurrencePattern
  recurrenceEnd: Date | null
  isActive: boolean
  service: {
    id: string
    name: string
    duration: number
    price: number
    color: string
  } | null
  slots: TimeSlotWithAvailability[]
}

// Service type
export interface ServiceWithStats {
  id: string
  name: string
  description: string
  duration: number
  price: number
  currency: string
  color: string
  icon: string | null
  isActive: boolean
  sortOrder: number
  _count?: {
    appointments: number
  }
}

// User type
export interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  phone: string | null
  dateOfBirth: Date | null
  address: string | null
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  } | null
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    calendar: {
      view: 'day' | 'week' | 'month'
      startHour: number
      endHour: number
    }
  }
  createdAt: Date
}

// Dashboard stats
export interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  pendingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalPatients: number
  newPatientsThisMonth: number
  totalRevenue: number
  revenueThisMonth: number
  pendingPayments: number
  averageRating: number
}

// Chart data
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface RevenueChartData {
  daily: ChartDataPoint[]
  weekly: ChartDataPoint[]
  monthly: ChartDataPoint[]
}

export interface AppointmentChartData {
  byStatus: { status: string; count: number }[]
  byService: { service: string; count: number }[]
  byDay: { day: string; count: number }[]
  byHour: { hour: number; count: number }[]
}

// Notification type
export interface NotificationWithUser {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: any
  read: boolean
  readAt: Date | null
  createdAt: Date
}

// Booking form data
export interface BookingFormData {
  serviceId: string
  date: Date
  timeSlotId: string
  reason: string
  notes: string
  patientInfo: {
    name: string
    email: string
    phone: string
    dateOfBirth: string
    address: string
    emergencyContact: {
      name: string
      phone: string
      relationship: string
    }
  }
}

// Admin appointment filters
export interface AdminAppointmentFilters {
  status?: AppointmentStatus[]
  serviceId?: string
  patientId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'startTime' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// Availability form data
export interface AvailabilityFormData {
  serviceId?: string
  dayOfWeek?: number
  specificDate?: Date
  startTime: string
  endTime: string
  slotDuration: number
  bufferTime: number
  recurrence: RecurrencePattern
  recurrenceEnd?: Date
  notes?: string
}

// Payment intent response
export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

// Audit log entry
export interface AuditLogEntry {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string
  oldData: any
  newData: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

// Settings types
export interface ClinicSettingsType {
  id: string
  clinicName: string
  clinicEmail: string
  clinicPhone: string
  clinicAddress: string
  timezone: string
  currency: string
  defaultSlotDuration: number
  bufferTime: number
  advanceBookingDays: number
  cancellationPolicy: string
  reminderHours: number
  allowOnlinePayment: boolean
  razorpayAccountId: string | null
}

// Re-export Prisma enums
export {
  UserRole,
  AppointmentStatus,
  PaymentStatus,
  SlotStatus,
  RecurrencePattern,
  NotificationType,
}