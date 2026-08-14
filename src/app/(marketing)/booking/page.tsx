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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, User, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parse, subYears, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { services, validationRules } from '@/lib/constants'

type BookingStep = 'service' | 'date' | 'time' | 'details' | 'payment' | 'confirmation'

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
  bookedForSelf: boolean
  bookedForName: string
  bookedForRelationship: string
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

const STEPS: { id: BookingStep; title: string }[] = [
  { id: 'service', title: 'Select Service' },
  { id: 'date', title: 'Choose Date' },
  { id: 'time', title: 'Available Times' },
  { id: 'details', title: 'Your Details' },
  { id: 'payment', title: 'Payment' },
  { id: 'confirmation', title: 'Confirmation' },
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
    bookedForSelf: true,
    bookedForName: '',
    bookedForRelationship: '',
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
  const [dobPickerOpen, setDobPickerOpen] = useState(false)

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
      case 'date':
        return !!bookingData.date
      case 'time':
        return !!bookingData.timeSlotId
      case 'details':
        return (
          bookingData.patientInfo.name.length >= 2 &&
          validationRules.email.pattern.test(bookingData.patientInfo.email) &&
          bookingData.patientInfo.phone.length >= 10 &&
          /^\d{4}-\d{2}-\d{2}$/.test(bookingData.patientInfo.dateOfBirth) &&
          (bookingData.bookedForSelf ||
            (bookingData.bookedForName.length >= 2 && bookingData.bookedForRelationship.length > 0))
        )
      case 'payment':
        return true
      default:
        return true
    }
  }

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setBookingData((prev) => ({ ...prev, serviceId, date: null, timeSlotId: null }))
    setSelectedDate(null)
    setAvailableSlots([])
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setBookingData((prev) => ({ ...prev, date, timeSlotId: null }))
    fetchSlots(date)
  }

  // Handle time slot selection
  const handleSlotSelect = (slotId: string) => {
    setBookingData((prev) => ({ ...prev, timeSlotId: slotId }))
  }

  // Initiate payment
  const initiatePayment = async () => {
    const selectedService = services.find((s) => s.id === bookingData.serviceId)
    const selectedSlot = availableSlots.find((s) => s.id === bookingData.timeSlotId)
    
    if (!selectedService || !selectedSlot) return

    setProcessingPayment(true)
    try {
      // 1. Create the appointment in the database (status PENDING)
      const payload: any = { ...bookingData }
      if (
        payload.patientInfo?.emergencyContact &&
        !payload.patientInfo.emergencyContact.name &&
        !payload.patientInfo.emergencyContact.phone
      ) {
        // Strip out the empty emergency contact object to prevent validation errors
        delete payload.patientInfo.emergencyContact
      }
      if (!payload.bookedForSelf && payload.bookedForName && payload.bookedForRelationship) {
        // keep bookedForName/bookedForRelationship as-is
      } else {
        delete payload.bookedForName
        delete payload.bookedForRelationship
      }
      delete payload.bookedForSelf

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!bookingResponse.ok) {
        if (bookingResponse.status === 409) {
          const errorData = await bookingResponse.json().catch(() => null)
          toast({
            title: 'Slot no longer available',
            description: errorData?.error || 'Someone else just booked this time. Please choose another slot.',
            variant: 'destructive',
          })
          setBookingData((prev) => ({ ...prev, timeSlotId: null }))
          setCurrentStep('time')
          if (selectedDate) fetchSlots(selectedDate)
          setProcessingPayment(false)
          return
        }
        throw new Error('Failed to create booking')
      }
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

      if (!orderResponse.ok || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        toast({
          title: 'Payments unavailable',
          description:
            "Your appointment is saved and pending — online payment isn't configured yet. Please contact us to complete your booking.",
          variant: 'destructive',
        })
        setProcessingPayment(false)
        return
      }
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
          color: '#392f79', // --primary
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
        toast({ title: 'Success!', description: 'Your appointment has been booked', variant: 'success' })
        setCurrentStep('confirmation')
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
    <div className="py-6 sm:h-[calc(100vh-4rem)] sm:py-4 sm:overflow-hidden sm:flex sm:flex-col">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full sm:flex sm:flex-1 sm:flex-col sm:min-h-0">
        {/* Progress Indicator */}
        <div className="mb-6 sm:shrink-0" role="navigation" aria-label="Booking progress">
          <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${(STEPS.findIndex((s) => s.id === currentStep) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>
          <ol className="mt-4 flex items-start justify-between gap-2 sm:gap-4" aria-label="Booking steps">
            {STEPS.map((step, index) => {
              const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
              const isCurrent = step.id === currentStep
              const isDone = index < currentIndex
              return (
                <li key={step.id} className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={index > currentIndex}
                    className={cn(
                      'w-full text-left group',
                      index > currentIndex ? 'cursor-default' : 'cursor-pointer'
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={cn(
                        'flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase',
                        isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {isDone ? <CheckCircle className="h-3 w-3" /> : String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'mt-1 hidden sm:block font-display text-base truncate transition-colors',
                        isCurrent
                          ? 'text-foreground font-medium'
                          : isDone
                            ? 'text-muted-foreground group-hover:text-foreground'
                            : 'text-muted-foreground/60'
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Step Content — fills whatever space remains between the progress
            indicator and the nav buttons within the viewport-locked wizard
            below sm, so the whole booking flow (header, steps, buttons)
            fits on screen without scrolling; only the footer past it needs
            a deliberate scroll. Content that still doesn't fit the
            available space scrolls within this box as a safety net rather
            than growing the page. Left as natural page flow on mobile. */}
        <div className="sm:flex-1 sm:min-h-0 sm:overflow-y-auto sm:pr-2">
        <div className="animate-in fade-in slide-in-from-right-2">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Select Your Service</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose the type of therapy that best fits your needs</p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={cn(
                      'relative p-2.5 text-left transition-all border-2 rounded-lg',
                      bookingData.serviceId === service.id
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border hover:border-brand-300 dark:hover:border-brand-700'
                    )}
                  >
                    {bookingData.serviceId === service.id && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                        <CheckCircle className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        <service.icon className="h-3.5 w-3.5" style={{ color: service.color }} />
                      </div>
                      <h3 className="font-semibold text-xs text-foreground leading-tight">{service.name}</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1.5 line-clamp-2">{service.shortDescription}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3 inline" /> {service.duration} min
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

          {/* Step 2: Date Selection */}
          {currentStep === 'date' && selectedService && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Choose a Date</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick a date for your {selectedService.name} session ({selectedService.duration} min)
                </p>
              </div>
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarIcon className="h-4 w-4" />
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
            </div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 'time' && selectedService && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Available Times</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDate
                    ? `${format(selectedDate, 'EEEE, MMMM d, yyyy')} · ${selectedService.duration} min`
                    : `Available slots for ${selectedService.name} (${selectedService.duration} min)`}
                </p>
              </div>
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Available Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((slot) => {
                        const isSelected = bookingData.timeSlotId === slot.id
                        const isTaken = slot.status !== 'AVAILABLE' && !isSelected
                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotSelect(slot.id)}
                            disabled={isTaken}
                            className={cn(
                              'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                : isTaken
                                  ? 'border-input/30 text-muted-foreground/50 line-through cursor-not-allowed'
                                  : 'border-input/60 bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                            )}
                          >
                            {format(new Date(slot.startTime), 'h:mm a')}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Patient Details */}
          {currentStep === 'details' && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Your Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {bookingData.bookedForSelf
                    ? 'Please provide your information for the appointment'
                    : "We'll use your contact details to manage the booking, plus a few details about who the appointment is for"}
                </p>
              </div>
              <form className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Who is this appointment for?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="inline-flex rounded-lg border border-input/60 bg-muted/30 p-1">
                      <button
                        type="button"
                        onClick={() => setBookingData((prev) => ({ ...prev, bookedForSelf: true }))}
                        className={cn(
                          'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
                          bookingData.bookedForSelf
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        Myself
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingData((prev) => ({ ...prev, bookedForSelf: false }))}
                        className={cn(
                          'rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150',
                          !bookingData.bookedForSelf
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        Someone else
                      </button>
                    </div>

                    {!bookingData.bookedForSelf && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="bookedForName">Their full name *</Label>
                          <Input
                            id="bookedForName"
                            value={bookingData.bookedForName}
                            onChange={(e) =>
                              setBookingData((prev) => ({ ...prev, bookedForName: e.target.value }))
                            }
                            placeholder="Who is this appointment for?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bookedForRelationship">Their relationship to you *</Label>
                          <Select
                            value={bookingData.bookedForRelationship}
                            onValueChange={(value) =>
                              setBookingData((prev) => ({ ...prev, bookedForRelationship: value }))
                            }
                          >
                            <SelectTrigger id="bookedForRelationship">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Spouse/Partner">Spouse/Partner</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      {bookingData.bookedForSelf ? 'Personal Information' : 'Your Contact Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="name">{bookingData.bookedForSelf ? 'Full Name *' : 'Your Full Name *'}</Label>
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
                        <Popover open={dobPickerOpen} onOpenChange={setDobPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="dateOfBirth"
                              type="button"
                              variant="outline"
                              className="w-full justify-start font-normal text-sm"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {bookingData.patientInfo.dateOfBirth ? (
                                format(
                                  parse(bookingData.patientInfo.dateOfBirth, 'yyyy-MM-dd', new Date()),
                                  'MMMM d, yyyy'
                                )
                              ) : (
                                <span className="text-muted-foreground">Select your date of birth</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <Calendar
                              captionLayout="dropdown"
                              selected={
                                bookingData.patientInfo.dateOfBirth
                                  ? parse(bookingData.patientInfo.dateOfBirth, 'yyyy-MM-dd', new Date())
                                  : null
                              }
                              defaultMonth={
                                bookingData.patientInfo.dateOfBirth
                                  ? parse(bookingData.patientInfo.dateOfBirth, 'yyyy-MM-dd', new Date())
                                  : subYears(new Date(), 30)
                              }
                              onSelect={(date) => {
                                handlePatientInfoChange('dateOfBirth', format(date, 'yyyy-MM-dd'))
                                setDobPickerOpen(false)
                              }}
                              fromDate={subYears(new Date(), 120)}
                              toDate={new Date()}
                            />
                          </PopoverContent>
                        </Popover>
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
                  <CardContent className="py-0">
                    <Accordion type="multiple" className="[&>*:last-child]:border-b-0">
                      <AccordionItem value="emergency-contact">
                        <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                          Emergency Contact <span className="ml-2 font-normal text-muted-foreground">(Optional)</span>
                        </AccordionTrigger>
                        <AccordionContent>
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
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="appointment-details">
                        <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                          Appointment Details <span className="ml-2 font-normal text-muted-foreground">(Optional)</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
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
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </form>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 'payment' && selectedService && selectedSlot && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Secure Payment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay securely with Razorpay. Your payment details are encrypted and never stored on our servers.
                </p>
              </div>

              {/* Order Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
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
                  {!bookingData.bookedForSelf && bookingData.bookedForName && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>For</span>
                      <span>
                        {bookingData.bookedForName} ({bookingData.bookedForRelationship})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-3 font-semibold">
                    <span>Total</span>
                    <span>₹{selectedService.price.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
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

          {/* Step 6: Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="text-center py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Appointment Booked!</h2>
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
                    {!bookingData.bookedForSelf && bookingData.bookedForName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">For</span>
                        <span className="font-medium">
                          {bookingData.bookedForName} ({bookingData.bookedForRelationship})
                        </span>
                      </div>
                    )}
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
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="mt-8 flex justify-between pt-6 border-t sm:shrink-0">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'service'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep !== 'payment' && (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || processingPayment}
                className="ml-auto"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}