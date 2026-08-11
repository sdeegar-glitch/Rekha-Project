// Constants and Configuration
import { LucideIcon } from 'lucide-react'

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  duration: number // minutes
  price: number
  currency: string
  color: string
  icon: LucideIcon
  features: string[]
  isActive: boolean
  sortOrder: number
}

export interface ServiceWithPrice extends Service {
  priceFormatted: string
}

import { User, Heart, Users, Brain, Shield, Video } from 'lucide-react'

export const services: Service[] = [
  {
    id: 'individual-therapy',
    name: 'Individual Therapy',
    slug: 'individual-therapy',
    description: 'One-on-one psychotherapy sessions for anxiety, depression, trauma, and personal growth. Using evidence-based approaches including CBT, ACT, and psychodynamic therapy tailored to your unique needs.',
    shortDescription: 'Personalized one-on-one therapy for anxiety, depression, and personal growth',
    duration: 50,
    price: 2500,
    currency: 'INR',
    color: '#3B82F6',
    icon: User,
    features: [
      'Anxiety & stress management',
      'Depression treatment',
      'Trauma & PTSD recovery',
      'Personal growth & self-discovery',
      'Emotional regulation skills',
      'Coping strategy development',
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'couples-therapy',
    name: 'Couples Therapy',
    slug: 'couples-therapy',
    description: 'Relationship counseling for couples dealing with communication issues, conflict, trust issues, intimacy concerns, or navigating major life transitions. Using Gottman Method and Emotionally Focused Therapy.',
    shortDescription: 'Relationship counseling using Gottman Method and EFT',
    duration: 75,
    price: 3500,
    currency: 'INR',
    color: '#EC4899',
    icon: Heart,
    features: [
      'Communication improvement',
      'Conflict resolution skills',
      'Trust rebuilding',
      'Intimacy enhancement',
      'Pre-marital counseling',
      'Separation/divorce counseling',
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'family-therapy',
    name: 'Family Therapy',
    slug: 'family-therapy',
    description: 'Systemic family therapy to improve communication, resolve conflicts, and strengthen family bonds. Addressing parenting challenges, blended family dynamics, and intergenerational patterns.',
    shortDescription: 'Systemic therapy for family communication and conflict resolution',
    duration: 90,
    price: 4500,
    currency: 'INR',
    color: '#10B981',
    icon: Users,
    features: [
      'Family communication patterns',
      'Parenting support',
      'Blended family dynamics',
      'Child/adolescent behavioral issues',
      'Grief & loss processing',
      'Life transition support',
    ],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'cbt',
    name: 'Cognitive Behavioral Therapy (CBT)',
    slug: 'cbt',
    description: 'Evidence-based CBT for anxiety disorders, depression, OCD, panic attacks, and stress management. Learn practical tools to change unhelpful thought patterns and behaviors.',
    shortDescription: 'Evidence-based CBT for anxiety, depression, and OCD',
    duration: 50,
    price: 2500,
    currency: 'INR',
    color: '#F59E0B',
    icon: Brain,
    features: [
      'Anxiety disorders (GAD, social, panic)',
      'Depression & mood disorders',
      'OCD & intrusive thoughts',
      'Stress management',
      'Insomnia (CBT-I)',
      'Perfectionism & procrastination',
    ],
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'emdr',
    name: 'Trauma Therapy (EMDR)',
    slug: 'emdr',
    description: 'Eye Movement Desensitization and Reprocessing for PTSD, complex trauma, and adverse life experiences. A structured, evidence-based approach to trauma recovery.',
    shortDescription: 'EMDR for PTSD and trauma recovery',
    duration: 90,
    price: 4000,
    currency: 'INR',
    color: '#8B5CF6',
    icon: Shield,
    features: [
      'PTSD & complex trauma',
      'Childhood trauma',
      'Accident & medical trauma',
      'Abuse recovery',
      'Phobias & fears',
      'Performance anxiety',
    ],
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'online-consultation',
    name: 'Online Consultation',
    slug: 'online-consultation',
    description: 'Secure video consultation for follow-ups, medication review, initial assessments, or ongoing therapy. HIPAA-compliant platform with end-to-end encryption.',
    shortDescription: 'Secure video sessions for therapy and follow-ups',
    duration: 30,
    price: 1500,
    currency: 'INR',
    color: '#06B6D4',
    icon: Video,
    features: [
      'Follow-up sessions',
      'Medication review',
      'Initial assessments',
      'Crisis check-ins',
      'Psychoeducation',
      'Treatment planning',
    ],
    isActive: true,
    sortOrder: 6,
  },
]

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

export function getActiveServices(): Service[] {
  return services.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
}

// Clinic Information
export const clinicInfo = {
  name: 'Rekha Patel Psychology Clinic',
  tagline: 'Compassionate Care for Your Mental Wellbeing',
  email: 'hello@rekhapatelpsychology.com',
  phone: '+91 98765 43210',
  address: {
    line1: '12 MG Road',
    line2: '3rd Floor',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
  },
  hours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '14:00' },
    sunday: { closed: true },
  },
  timezone: 'Asia/Kolkata',
  qualifications: [
    'M.Phil in Clinical Psychology, Central Institute of Psychiatry (CIP), Ranchi (2016)',
    'Post Graduate Diploma in Guidance, Counselling and Psychological Intervention, Banaras Hindu University (BHU) (2013)',
    'MA in Psychology, Banaras Hindu University (BHU) (2012)',
    'Trained in Cognitive Behaviour Therapy for depression, anxiety, and suicide prevention, Beck Institute for CBT',
  ],
  specializations: [
    'Depression',
    'Anxiety Disorders (Panic Attacks, Phobias, OCD)',
    'Personality Disorders',
    'Schizophrenia',
    'Bipolar Disorder',
    'Stress Management',
  ],
}

// Payment Configuration
export const paymentConfig = {
  currency: 'INR',
  supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
  upiApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
  cards: ['Visa', 'Mastercard', 'RuPay', 'American Express'],
  minAmount: 100,
  maxAmount: 50000,
  gstRate: 0.18,
}

// Notification Templates
export const notificationTemplates = {
  appointmentCreated: {
    email: {
      subject: 'Appointment Confirmed - {serviceName} on {date}',
      template: 'appointment-created-email',
    },
    sms: 'Your {serviceName} appointment is confirmed for {date} at {time}. Clinic: {clinicName}',
    push: 'Appointment confirmed for {date} at {time}',
  },
  appointmentReminder: {
    email: {
      subject: 'Reminder: Your appointment tomorrow at {time}',
      template: 'appointment-reminder-email',
    },
    sms: 'Reminder: {serviceName} tomorrow at {time} with Rekha Patel. Reply STOP to opt out.',
    push: 'Appointment tomorrow at {time}',
  },
  appointmentCancelled: {
    email: {
      subject: 'Appointment Cancelled - {serviceName}',
      template: 'appointment-cancelled-email',
    },
    sms: 'Your {serviceName} appointment on {date} has been cancelled. Refund: {refundAmount}',
    push: 'Appointment cancelled',
  },
  paymentSuccess: {
    email: {
      subject: 'Payment Received - {amount} for {serviceName}',
      template: 'payment-success-email',
    },
    sms: 'Payment of {amount} received for {serviceName}. Receipt: {receiptUrl}',
    push: 'Payment successful',
  },
  paymentFailed: {
    email: {
      subject: 'Payment Failed - {serviceName} Appointment',
      template: 'payment-failed-email',
    },
    sms: 'Payment failed for {serviceName} appointment. Please retry or contact us.',
    push: 'Payment failed - please retry',
  },
}

// SEO Configuration
export const seoConfig = {
  defaultTitle: 'Rekha Patel Psychology | Clinical Psychologist',
  defaultDescription: 'Rekha Patel - Clinical Psychologist specializing in depression, anxiety disorders (panic attacks, phobias, OCD), personality disorders, schizophrenia, and bipolar disorder. Book online appointments with secure payments.',
  defaultImage: '/og-image.jpg',
  siteUrl: 'https://rekhapatel.com',
  twitterHandle: '@rekhapatelpsych',
  facebookAppId: '123456789',
}

// Validation Constants
export const validationRules = {
  name: { min: 2, max: 100 },
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/ },
  password: { min: 8, max: 100 },
  reason: { max: 1000 },
  notes: { max: 2000 },
  address: { max: 500 },
}

// Date/Time Formats
export const dateFormats = {
  display: 'MMMM d, yyyy',
  displayWithTime: 'MMMM d, yyyy \'at\' h:mm a',
  api: 'yyyy-MM-dd',
  time: 'HH:mm',
  timeDisplay: 'h:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
}

// Pagination Defaults
export const paginationDefaults = {
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
}

// Cache Durations (in seconds)
export const cacheDurations = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 1 day
}

// Error Messages
export const errorMessages = {
  unauthorized: 'Please sign in to access this page',
  forbidden: 'You do not have permission to perform this action',
  notFound: 'The requested resource was not found',
  validationError: 'Please check your input and try again',
  serverError: 'Something went wrong. Please try again later',
  paymentError: 'Payment processing failed. Please try again',
  slotUnavailable: 'This time slot is no longer available',
  appointmentConflict: 'You already have an appointment at this time',
}