'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { contactFormSchema, type ContactForm } from '@/validators'

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactFormSchema) })

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to send message')

      setIsSuccess(true)
      reset()
      setTimeout(() => setIsSuccess(false), 5000)
    } catch {
      toast({
        title: 'Something went wrong',
        description: "Your message couldn't be sent. Please try again.",
        variant: 'destructive',
      })
    }
  }

  const contactInfo = [
    {
      title: 'Visit Us',
      details: '12 MG Road, 3rd Floor, Bengaluru, Karnataka 560001',
      icon: MapPin,
      color: 'bg-brand-100 text-brand-600',
    },
    {
      title: 'Call Us',
      details: '+91 98765 43210',
      icon: Phone,
      color: 'bg-sage-100 text-sage-600',
    },
    {
      title: 'Email Us',
      details: 'hello@rekhapatelpsychology.com',
      icon: Mail,
      color: 'bg-brand-100 text-brand-600',
    },
    {
      title: 'Working Hours',
      details: 'Mon - Fri: 9:00 AM - 6:00 PM',
      icon: Clock,
      color: 'bg-sage-100 text-sage-600',
    },
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground">
            Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8 animate-slide-in-from-left">
            <div className="bg-card rounded-3xl p-8 shadow-soft border border-border">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, idx) => {
                  const Icon = info.icon
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${info.color} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                        <p className="text-muted-foreground">{info.details}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Aesthetic decorative element */}
            <div className="bg-brand-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-elevation-2 hidden md:block">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
              <h3 className="text-xl font-bold mb-2 relative z-10">In Crisis?</h3>
              <p className="text-brand-100 relative z-10 text-sm">
                If this is a medical emergency or if you are in immediate danger of harming yourself or others, please call 911 or go to the nearest emergency room.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 animate-slide-in-from-right">
            <div className="bg-card rounded-3xl p-8 md:p-10 shadow-elevation-2 border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-400 via-brand-500 to-sage-400"></div>
              
              <h2 className="text-2xl font-bold mb-8">Send a Message</h2>
              
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-sage-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We will get back to you as soon as possible.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-full"
                    onClick={() => setIsSuccess(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-transparent shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="John"
                        {...register('firstName')}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-destructive">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-transparent shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                        placeholder="Doe"
                        {...register('lastName')}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-destructive">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-transparent shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                      placeholder="john.doe@example.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                    <select
                      id="subject"
                      defaultValue=""
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-transparent shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                      {...register('subject')}
                    >
                      <option value="" disabled>Select a subject...</option>
                      <option value="general">General Inquiry</option>
                      <option value="services">Questions about Services</option>
                      <option value="booking">Help with Booking</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p id="subject-error" className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-transparent shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 resize-none"
                      placeholder="How can we help you today?"
                      {...register('message')}
                    ></textarea>
                    {errors.message && (
                      <p id="message-error" className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  )
}
