// Zod Validation Schemas
import { z } from 'zod'
import {
  UserRole,
  AppointmentStatus,
  PaymentStatus,
  SlotStatus,
  RecurrencePattern,
  NotificationType,
} from '@prisma/client'

// Common schemas
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email()
export const phoneSchema = z.string().regex(/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/)
export const dateSchema = z.coerce.date()
export const dateTimeSchema = z.coerce.date()
export const positiveIntSchema = z.number().int().positive()
export const nonNegativeIntSchema = z.number().int().nonnegative()
export const decimalSchema = z.number().multipleOf(0.01)
export const currencySchema = z.enum(['INR', 'USD', 'EUR', 'GBP'])

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// User schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(8).max(100),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  address: z.string().max(500).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.PATIENT),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  address: z.string().max(500).optional(),
  image: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
})

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(true),
    push: z.boolean().default(true),
  }).default({}),
  calendar: z.object({
    view: z.enum(['day', 'week', 'month']).default('week'),
    startHour: z.number().int().min(0).max(23).default(9),
    endHour: z.number().int().min(1).max(24).default(18),
  }).default({}),
})

// Auth schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
  name: z.string().min(2).max(100),
  phone: phoneSchema.optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
  token: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Service schemas
export const serviceCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  duration: positiveIntSchema.min(15).max(240),
  price: decimalSchema.positive(),
  currency: currencySchema.default('INR'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  icon: z.string().optional(),
  sortOrder: nonNegativeIntSchema.default(0),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

// Appointment schemas
export const appointmentCreateSchema = z.object({
  serviceId: z.string(),
  timeSlotId: idSchema,
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  patientInfo: z.object({
    name: z.string().min(2).max(100),
    email: emailSchema,
    phone: phoneSchema,
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    address: z.string().max(500).optional(),
    emergencyContact: z.object({
      name: z.string().min(2).max(100),
      phone: phoneSchema,
      relationship: z.string().min(2).max(50),
    }).optional(),
  }).optional(),
})

export const appointmentUpdateSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  adminNotes: z.string().max(2000).optional(),
  diagnosis: z.string().max(2000).optional(),
  treatmentPlan: z.string().max(2000).optional(),
  cancellationReason: z.string().max(500).optional(),
})

export const appointmentRescheduleSchema = z.object({
  newTimeSlotId: idSchema,
  reason: z.string().max(500).optional(),
})

export const appointmentFiltersSchema = z.object({
  status: z.array(z.nativeEnum(AppointmentStatus)).optional(),
  serviceId: idSchema.optional(),
  patientId: idSchema.optional(),
  adminId: idSchema.optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  search: z.string().optional(),
}).merge(paginationSchema)

// Availability schemas
export const availabilityBaseSchema = z.object({
  serviceId: idSchema.optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  specificDate: dateSchema.optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  slotDuration: positiveIntSchema.min(15).max(240),
  bufferTime: nonNegativeIntSchema.default(0),
  recurrence: z.nativeEnum(RecurrencePattern).default(RecurrencePattern.NONE),
  recurrenceEnd: dateSchema.optional(),
  notes: z.string().max(500).optional(),
})

export const availabilityCreateSchema = availabilityBaseSchema.refine(data => data.dayOfWeek !== undefined || data.specificDate !== undefined, {
  message: 'Either dayOfWeek or specificDate must be provided',
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime
  }
  return true
}, {
  message: 'Start time must be before end time',
  path: ['endTime'],
})

export const availabilityUpdateSchema = availabilityBaseSchema.partial()

export const availabilityFiltersSchema = z.object({
  serviceId: idSchema.optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  isActive: z.boolean().optional(),
}).merge(paginationSchema)

// Time slot schemas
export const timeSlotCreateSchema = z.object({
  availabilityId: idSchema,
  serviceId: idSchema.optional(),
  startTime: dateTimeSchema,
  endTime: dateTimeSchema,
  status: z.nativeEnum(SlotStatus).default(SlotStatus.AVAILABLE),
})

export const timeSlotBulkCreateSchema = z.object({
  availabilityId: idSchema,
  serviceId: idSchema.optional(),
  slots: z.array(z.object({
    startTime: dateTimeSchema,
    endTime: dateTimeSchema,
    status: z.nativeEnum(SlotStatus).default(SlotStatus.AVAILABLE),
  })).min(1).max(500),
})

// Payment schemas
export const paymentIntentSchema = z.object({
  appointmentId: idSchema,
  amount: decimalSchema.positive(),
  currency: currencySchema.default('INR'),
  method: z.enum(['card', 'upi', 'netbanking', 'wallet']).optional(),
  metadata: z.record(z.string()).optional(),
})

export const paymentConfirmSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string().optional(),
})

export const refundSchema = z.object({
  paymentIntentId: z.string(),
  amount: decimalSchema.positive().optional(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
})

// Notification schemas
export const notificationCreateSchema = z.object({
  userId: idSchema,
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  data: z.record(z.any()).optional(),
})

export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(idSchema).min(1),
})

// Clinic settings schemas
export const clinicSettingsUpdateSchema = z.object({
  clinicName: z.string().min(2).max(200).optional(),
  clinicEmail: emailSchema.optional(),
  clinicPhone: phoneSchema.optional(),
  clinicAddress: z.string().max(500).optional(),
  timezone: z.string().optional(),
  currency: currencySchema.optional(),
  defaultSlotDuration: positiveIntSchema.min(15).max(240).optional(),
  bufferTime: nonNegativeIntSchema.default(0).optional(),
  advanceBookingDays: positiveIntSchema.max(365).optional(),
  cancellationPolicy: z.string().max(5000).optional(),
  reminderHours: positiveIntSchema.max(168).optional(),
  allowOnlinePayment: z.boolean().optional(),
  stripeAccountId: z.string().optional(),
})

// Search schemas
export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['patients', 'appointments', 'services', 'all']).default('all'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(20),
})

// Export all schemas
export const validators = {
  id: idSchema,
  email: emailSchema,
  phone: phoneSchema,
  date: dateSchema,
  pagination: paginationSchema,
  user: {
    create: userCreateSchema,
    update: userUpdateSchema,
    preferences: userPreferencesSchema,
  },
  auth: {
    signIn: signInSchema,
    signUp: signUpSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
  },
  service: {
    create: serviceCreateSchema,
    update: serviceUpdateSchema,
  },
  appointment: {
    create: appointmentCreateSchema,
    update: appointmentUpdateSchema,
    reschedule: appointmentRescheduleSchema,
    filters: appointmentFiltersSchema,
  },
  availability: {
    create: availabilityCreateSchema,
    update: availabilityUpdateSchema,
    filters: availabilityFiltersSchema,
  },
  timeSlot: {
    create: timeSlotCreateSchema,
    bulkCreate: timeSlotBulkCreateSchema,
  },
  payment: {
    intent: paymentIntentSchema,
    confirm: paymentConfirmSchema,
    refund: refundSchema,
  },
  notification: {
    create: notificationCreateSchema,
    markRead: notificationMarkReadSchema,
  },
  clinicSettings: {
    update: clinicSettingsUpdateSchema,
  },
  search: searchSchema,
}

// Type inference helpers
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>

export type UserCreate = InferSchema<typeof userCreateSchema>
export type UserUpdate = InferSchema<typeof userUpdateSchema>
export type UserPreferences = InferSchema<typeof userPreferencesSchema>
export type SignIn = InferSchema<typeof signInSchema>
export type SignUp = InferSchema<typeof signUpSchema>
export type ServiceCreate = InferSchema<typeof serviceCreateSchema>
export type ServiceUpdate = InferSchema<typeof serviceUpdateSchema>
export type AppointmentCreate = InferSchema<typeof appointmentCreateSchema>
export type AppointmentUpdate = InferSchema<typeof appointmentUpdateSchema>
export type AppointmentReschedule = InferSchema<typeof appointmentRescheduleSchema>
export type AppointmentFilters = InferSchema<typeof appointmentFiltersSchema>
export type AvailabilityCreate = InferSchema<typeof availabilityCreateSchema>
export type AvailabilityUpdate = InferSchema<typeof availabilityUpdateSchema>
export type AvailabilityFilters = InferSchema<typeof availabilityFiltersSchema>
export type TimeSlotCreate = InferSchema<typeof timeSlotCreateSchema>
export type TimeSlotBulkCreate = InferSchema<typeof timeSlotBulkCreateSchema>
export type PaymentIntent = InferSchema<typeof paymentIntentSchema>
export type PaymentConfirm = InferSchema<typeof paymentConfirmSchema>
export type Refund = InferSchema<typeof refundSchema>
export type NotificationCreate = InferSchema<typeof notificationCreateSchema>
export type ClinicSettingsUpdate = InferSchema<typeof clinicSettingsUpdateSchema>
export type Search = InferSchema<typeof searchSchema>