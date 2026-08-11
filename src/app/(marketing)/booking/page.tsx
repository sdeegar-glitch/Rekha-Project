// Booking Page - Multi-step booking flow
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { services } from '@/lib/constants'
import { useSocket } from '@/hooks/useSocket'

type BookingStep = 'service' | 'datetime' | 'details' | 'payment' | 'confirmation'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  status: string
  serviceId: string
}

interface BookingData {
  serviceId: string
  date: Date | null
  timeSlotId: string | null
  reason: string
  notes: string
  patientInfo: {
    name: string
    email: string
    phone: string
    dateOfBirth: string
    address: string
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
}

const STEPS: { id: BookingStep; title: string; description: string }[] = [
  { id: 'service', title: 'Select Service', description: 'Choose your therapy type' },
  { id: 'datetime', title: 'Date & Time', description: 'Pick a convenient slot' },
  { id: 'details', title: 'Your Details', description: 'Enter your information' },
  { id: 'payment', title: 'Payment', description: 'Secure online payment' },
  { id: 'confirmation', title: 'Confirmation', description: 'Appointment confirmed' },
]

export default function BookingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: '',
    date: null,
    timeSlotId: null,
    reason: '',
    notes: '',
    patientInfo: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
  })
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Real-time slot updates
  const { isConnected, emitLockSlot, emitUnlockSlot } = useSocket({
    channels: bookingData.serviceId && selectedDate 
      ? [`slots:${bookingData.serviceId}:${format(selectedDate, 'yyyy-MM-dd')}`] 
      : [],
    onSlotBooked: (data) => {
      setAvailableSlots((prev) =>
        prev.map((s) => (s.id === data.slotId ? { ...s, status: 'BOOKED' } : s))
      )
    },
    onSlotAvailable: (data) => {
      setAvailableSlots((prev) =>
        prev.map((s) => (s.id === data.slotId ? { ...s, status: 'AVAILABLE' } : s))
      )
    },
    onSlotLocked: (data) => {
      setAvailableSlots((prev) =>
        prev.map((s) => (s.id === data.slotId ? { ...s, status: 'LOCKED', lockedBy: data.userId } : s))
      )
    },
    onSlotUnlocked: (data) => {
      setAvailableSlots((prev) =>
        prev.map((s) => (s.id === data.slotId && s.status === 'LOCKED' ? { ...s, status: 'AVAILABLE' } : s))
      )
    }
  })

  // Fetch available slots when service or date changes
  const fetchSlots = async (dateToFetch?: Date) => {
    const fetchDate = dateToFetch || selectedDate
    if (!bookingData.serviceId || !fetchDate) return

    setLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/availability/slots?serviceId=${bookingData.serviceId}&date=${format(fetchDate, 'yyyy-MM-dd')}`
      )
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])
      } else {
        setAvailableSlots([])
        toast({ title: 'Error', description: 'Failed to load available slots', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load available slots', variant: 'destructive' })
    } finally {
      setLoadingSlots(false)
    }
  }

  // Cleanup lock on unmount
  useEffect(() => {
    return () => {
      if (bookingData.timeSlotId) {
        emitUnlockSlot(bookingData.timeSlotId)
      }
    }
  }, [bookingData.timeSlotId, emitUnlockSlot])

  // Pre-fill patient info if logged in. This intentionally seeds editable
  // form state from the session rather than deriving it during render, since
  // the fields must remain user-editable afterward.
  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBookingData((prev) => ({
        ...prev,
        patientInfo: {
          ...prev.patientInfo,
          name: session.user.name || '',
          email: session.user.email || '',
        },
      }))
    }
  }, [session])

  // Handle step navigation
  const goToStep = (step: BookingStep) => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    const targetIndex = STEPS.findIndex((s) => s.id === step)
    
    // Only allow forward navigation if current step is valid
    if (targetIndex > currentIndex && !canProceed()) return
    
    setCurrentStep(step)
  }

  const nextStep = () => {
    if (!canProceed()) return
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const prevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'service':
        return !!bookingData.serviceId
      case 'datetime':
        return !!bookingData.date && !!bookingData.timeSlotId
      case 'details':
        return (
          bookingData.patientInfo.name.length >= 2 &&
          bookingData.patientInfo.email.includes('@') &&
          bookingData.patientInfo.phone.length >= 10
        )
      case 'payment':
        return true
      default:
        return true
    }
  }

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    if (bookingData.timeSlotId) emitUnlockSlot(bookingData.timeSlotId)
    setBookingData((prev) => ({ ...prev, serviceId, date: null, timeSlotId: null }))
    setSelectedDate(null)
    setAvailableSlots([])
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (bookingData.timeSlotId) emitUnlockSlot(bookingData.timeSlotId)
    setSelectedDate(date)
    setBookingData((prev) => ({ ...prev, date, timeSlotId: null }))
    fetchSlots(date)
  }

  // Handle time slot selection
  const handleSlotSelect = (slotId: string) => {
    if (bookingData.timeSlotId && bookingData.timeSlotId !== slotId) {
      emitUnlockSlot(bookingData.timeSlotId)
    }
    setBookingData((prev) => ({ ...prev, timeSlotId: slotId }))
    emitLockSlot(slotId)
  }

  // Initiate payment
  const initiatePayment = async () => {
    const selectedService = services.find((s) => s.id === bookingData.serviceId)
    const selectedSlot = availableSlots.find((s) => s.id === bookingData.timeSlotId)
    
    if (!selectedService || !selectedSlot) return

    setProcessingPayment(true)
    try {
      // 1. Create the appointment in the database (status PENDING)
      const payload = { ...bookingData }
      if (
        payload.patientInfo?.emergencyContact && 
        !payload.patientInfo.emergencyContact.name && 
        !payload.patientInfo.emergencyContact.phone
      ) {
        // Strip out the empty emergency contact object to prevent validation errors
        delete payload.patientInfo.emergencyContact
      }

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!bookingResponse.ok) throw new Error('Failed to create booking')
      const bookingResult = await bookingResponse.json()
      const appointmentId = bookingResult.appointment.id

      // 2. Create the Razorpay order
      const orderResponse = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          amount: selectedService.price,
          currency: selectedService.currency,
          metadata: {
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            slotId: selectedSlot.id,
            startTime: selectedSlot.startTime,
          },
        }),
      })

      if (!orderResponse.ok) throw new Error('Failed to create payment order')
      const orderData = await orderResponse.json()

      // Load Razorpay script dynamically
      const { loadScript } = await import('@/lib/loadScript')
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      
      if (!res) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load. Are you offline?', variant: 'destructive' })
        setProcessingPayment(false)
        return
      }

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx', // Replace with your key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Rekha Patel Psychology',
        description: `Payment for ${selectedService.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyPayment(response)
        },
        prefill: {
          name: bookingData.patientInfo.name,
          email: bookingData.patientInfo.email,
          contact: bookingData.patientInfo.phone,
        },
        theme: {
          color: '#3B82F6', // brand-600
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' })
      })
      rzp.open()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to initiate payment', variant: 'destructive' })
    } finally {
      setProcessingPayment(false)
    }
  }

  const verifyPayment = async (paymentResponse: any) => {
    setProcessingPayment(true)
    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentResponse),
      })

      if (verifyRes.ok) {
        const data = await verifyRes.json()
        toast({ title: 'Success!', description: 'Your appointment has been booked', variant: 'success' })
        setCurrentStep('confirmation')
        
        setTimeout(() => {
          router.push(`/booking/confirmation/${data.appointmentId}`)
        }, 3000)
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to verify payment. Please contact support.', variant: 'destructive' })
    } finally {
      setProcessingPayment(false)
    }
  }

  // Pre-fill patient info if logged in
  const handlePatientInfoChange = (field: string, value: string) => {
    setBookingData((prev) => ({
      ...prev,
      patientInfo: { ...prev.patientInfo, [field]: value },
    }))
  }

  const handleEmergencyContactChange = (field: string, value: string) => {
    setBookingData((prev) => ({
      ...prev,
      patientInfo: {
        ...prev.patientInfo,
        emergencyContact: {
          name: prev.patientInfo.emergencyContact?.name || '',
          phone: prev.patientInfo.emergencyContact?.phone || '',
          relationship: prev.patientInfo.emergencyContact?.relationship || '',
          [field]: value,
        },
      },
    }))
  }

  const selectedService = services.find((s) => s.id === bookingData.serviceId)
  const selectedSlot = availableSlots.find((s) => s.id === bookingData.timeSlotId)

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8" role="navigation" aria-label="Booking progress">
          <ol className="flex items-center" aria-label="Booking steps">
            {STEPS.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all',
                    currentStep === step.id || index < STEPS.findIndex((s) => s.id === currentStep)
                      ? 'bg-brand-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                  aria-current={currentStep === step.id ? 'step' : undefined}
                >
                  {index < STEPS.findIndex((s) => s.id === currentStep) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-1 w-full max-w-[120px] mx-2 transition-colors',
                      index < STEPS.findIndex((s) => s.id === currentStep)
                        ? 'bg-brand-600'
                        : 'bg-muted'
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Step {STEPS.findIndex((s) => s.id === currentStep) + 1} of {STEPS.length}:{' '}
              <span className="font-medium text-foreground">
                {STEPS.find((s) => s.id === currentStep)?.title}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {STEPS.find((s) => s.id === currentStep)?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in slide-in-from-right-2">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Select Your Service</h2>
                <p className="text-muted-foreground mt-1">Choose the type of therapy that best fits your needs</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={cn(
                      'relative p-6 text-left transition-all border-2 rounded-xl',
                      bookingData.serviceId === service.id
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border hover:border-brand-300 dark:hover:border-brand-700'
                    )}
                  >
                    {bookingData.serviceId === service.id && (
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg mb-4"
                      style={{ backgroundColor: `${service.color}15` }}
                    >
                      <service.icon className="h-6 w-6" style={{ color: service.color }} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.shortDescription}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4 inline" /> {service.duration} min
                      </span>
                      <span className="font-semibold text-brand-600">
                        ₹{service.price.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 'datetime' && selectedService && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Select Date & Time</h2>
                <p className="text-muted-foreground mt-1">
                  Available slots for {selectedService.name} ({selectedService.duration} min)
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Choose a Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus={startOfDay(new Date())}
                      fromDate={startOfDay(new Date())}
                      toDate={addDays(new Date(), 60)}
                      disabled={!bookingData.serviceId}
                      className="w-full"
                    />
                    {!bookingData.serviceId && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Please select a service first
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Available Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                      </div>
                    ) : !selectedDate ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Select a date to see available times
                      </p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No available slots for this date
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot.id)}
                            disabled={slot.status !== 'AVAILABLE' && bookingData.timeSlotId !== slot.id}
                            className={cn(
                              'p-3 rounded-lg border-2 text-left transition-all relative overflow-hidden',
                              bookingData.timeSlotId === slot.id
                                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/40 shadow-xs ring-2 ring-brand-500/20'
                                : slot.status === 'AVAILABLE'
                                ? 'border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-400 dark:border-green-900/50 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:hover:border-green-700'
                                : 'border-red-100 bg-red-50/30 text-red-400 cursor-not-allowed opacity-60 dark:border-red-900/30 dark:bg-red-900/10'
                            )}
                          >
                            <div className={cn(
                              "font-semibold text-lg",
                              slot.status === 'AVAILABLE' ? 'text-green-700 dark:text-green-400' : 'text-red-700/70 dark:text-red-400/70',
                              bookingData.timeSlotId === slot.id && 'text-brand-700 dark:text-brand-300'
                            )}>
                              {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                            </div>
                            <div className={cn(
                              "text-sm font-medium mt-1 flex items-center gap-1.5",
                              slot.status === 'AVAILABLE' ? 'text-green-600 dark:text-green-500' : 'text-red-600/70 dark:text-red-500/70',
                              bookingData.timeSlotId === slot.id && 'text-brand-600 dark:text-brand-400'
                            )}>
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                slot.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500',
                                bookingData.timeSlotId === slot.id && 'bg-brand-500 animate-pulse'
                              )} />
                              {slot.status === 'AVAILABLE' 
                                ? 'Available to Book' 
                                : slot.status === 'LOCKED'
                                  ? (bookingData.timeSlotId === slot.id ? 'Selected (Locked 5m)' : 'Currently Locked')
                                  : 'Not Available'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Patient Details */}
          {currentStep === 'details' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Your Details</h2>
                <p className="text-muted-foreground mt-1">Please provide your information for the appointment</p>
              </div>
              <form className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={bookingData.patientInfo.name}
                          onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.patientInfo.email}
                          onChange={(e) => handlePatientInfoChange('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.patientInfo.phone}
                          onChange={(e) => handlePatientInfoChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={bookingData.patientInfo.dateOfBirth}
                          onChange={(e) => handlePatientInfoChange('dateOfBirth', e.target.value)}
                          required
                          max={format(new Date(), 'yyyy-MM-dd')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={bookingData.patientInfo.address}
                        onChange={(e) => handlePatientInfoChange('address', e.target.value)}
                        placeholder="Your full address"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="ecName">Name</Label>
                        <Input
                          id="ecName"
                          value={bookingData.patientInfo.emergencyContact?.name || ''}
                          onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ecPhone">Phone</Label>
                        <Input
                          id="ecPhone"
                          type="tel"
                          value={bookingData.patientInfo.emergencyContact?.phone || ''}
                          onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ecRelationship">Relationship</Label>
                        <Select
                          value={bookingData.patientInfo.emergencyContact?.relationship || ''}
                          onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Details (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea
                        id="reason"
                        value={bookingData.reason}
                        onChange={(e) => setBookingData((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="Briefly describe why you're seeking therapy"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any other information you'd like to share"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 'payment' && selectedService && selectedSlot && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Secure Payment</h2>
                <p className="text-muted-foreground mt-1">
                  Pay securely with Razorpay. Your payment details are encrypted and never stored on our servers.
                </p>
              </div>

              {/* Order Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>{selectedService.name}</span>
                    <span>₹{selectedService.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{format(new Date(selectedSlot.startTime), 'MMMM d, yyyy \'at\' h:mm a')}</span>
                    <span>{selectedService.duration} minutes</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 font-semibold">
                    <span>Total</span>
                    <span>₹{selectedService.price.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingPayment ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-600 mr-3" />
                      <span>Processing payment...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Click the button below to securely pay with Razorpay.
                      </p>
                      <Button 
                        onClick={initiatePayment} 
                        disabled={processingPayment}
                        className="w-full"
                        size="lg"
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          `Pay ₹${selectedService?.price.toLocaleString()}`
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        By proceeding, you agree to our{' '}
                        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="text-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Booked!</h2>
              <p className="text-muted-foreground mb-8">
                Your appointment has been confirmed. A confirmation email has been sent to{' '}
                <strong>{bookingData.patientInfo.email}</strong>.
              </p>
              {selectedService && selectedSlot && (
                <Card className="max-w-md mx-auto text-left mb-6">
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium">
                        {format(new Date(selectedSlot.startTime), 'MMMM d, yyyy \'at\' h:mm a')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium">₹{selectedService.price.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex flex-col gap-3 sm:flex-row justify-center">
                <Button onClick={() => router.push('/portal')} className="w-full sm:w-auto">
                  View My Appointments
                </Button>
                <Button variant="outline" onClick={() => router.push('/')} className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="mt-8 flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'service'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed() || processingPayment}
              className="ml-auto"
            >
              {currentStep === 'payment' ? (
                'Pay Now'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-4 p-3 text-center text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            ⚠️ Real-time updates unavailable. Please refresh to see latest availability.
          </div>
        )}
      </div>
    </div>
  )
}