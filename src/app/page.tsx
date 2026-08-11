// Home Page
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle, Shield, Clock, Users, Heart, Brain, Video, Star } from 'lucide-react'
import { services } from '@/lib/constants'

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Licensed Professional',
      description: 'Dr. Rekha Patel is a licensed clinical psychologist with 15+ years of experience.',
    },
    {
      icon: Heart,
      title: 'Evidence-Based Therapy',
      description: 'Using proven therapeutic approaches like CBT, EMDR, and mindfulness-based techniques.',
    },
    {
      icon: Brain,
      title: 'Personalized Care',
      description: 'Tailored treatment plans designed for your unique needs and goals.',
    },
    {
      icon: Video,
      title: 'Flexible Options',
      description: 'In-person and secure online sessions to fit your schedule and comfort.',
    },
    {
      icon: Clock,
      title: 'Convenient Booking',
      description: 'Easy online scheduling with real-time availability and instant confirmation.',
    },
    {
      icon: Users,
      title: 'Confidential & Secure',
      description: 'Your privacy is paramount. All sessions are confidential and HIPAA-compliant.',
    },
  ]

  const stats = [
    { value: '15+', label: 'Years Experience' },
    { value: '2000+', label: 'Patients Helped' },
    { value: '6', label: 'Specializations' },
    { value: '4.9', label: 'Patient Rating' },
  ]

  const testimonials = [
    {
      quote: "Dr. Patel's approach to CBT completely transformed how I handle anxiety. I feel equipped with tools I'll use for life.",
      author: 'Sarah M.',
      role: 'Software Engineer',
      rating: 5,
    },
    {
      quote: 'The couples therapy sessions saved our marriage. Dr. Patel created a safe space for us to communicate honestly.',
      author: 'Raj & Priya K.',
      role: 'Married 12 years',
      rating: 5,
    },
    {
      quote: 'EMDR therapy with Dr. Patel helped me process trauma I\'d carried for decades. I finally feel free.',
      author: 'Anonymous',
      role: 'Trauma Survivor',
      rating: 5,
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-linear-to-br from-brand-50 via-background to-sage-50 dark:from-brand-950/20 dark:via-background dark:to-sage-950/20" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="success" className="mb-6 animate-in">
              <CheckCircle className="mr-1 h-3 w-3" />
              Now Accepting New Patients - Book Online
            </Badge>
            <h1 id="hero-heading" className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-in">
              Compassionate{' '}
              <span className="text-brand-600">Psychological Care</span>{' '}
              for Your Wellbeing
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-in">
              Dr. Rekha Patel provides evidence-based therapy for anxiety, depression, trauma, 
              and relationship challenges. Book your appointment online with secure payments and 
              real-time availability.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in">
              <Link href="/booking">
                <Button size="xl" className="w-full sm:w-auto group">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Explore Services
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-in">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Licensed & Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Practice Statistics</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl font-bold text-brand-600 sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="services-heading" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Therapeutic Services
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Specialized evidence-based treatments tailored to your unique journey
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`} className="group">
                <Card className="h-full transition-all hover:shadow-card-hover border-l-4" style={{ borderLeftColor: service.color }}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-lg" 
                        style={{ backgroundColor: `${service.color}15` }}
                      >
                        <service.icon className="h-6 w-6" style={{ color: service.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min • ₹{service.price}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-600 group-hover:underline">
                        Learn more
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand-600 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="outline" size="lg">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="features-heading" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Dr. Rekha Patel
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Experience, expertise, and empathy combined for your healing journey
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full border-l-4 border-brand-500">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30 mb-4">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="testimonials-heading" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Our Patients
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real stories from people who found their path to healing
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-600" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            Take the first step towards better mental health. Book your initial consultation today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/booking">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto group">
                Book Your Appointment
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}