import { User, Users, Home, Brain, Sparkles, Monitor, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Our Services | Rekha Patel Psychology',
  description: 'Explore the comprehensive psychological services offered by Dr. Rekha Patel, including Individual Therapy, CBT, EMDR, and more.',
}

export default function ServicesPage() {
  const services = [
    {
      title: 'Individual Therapy',
      description: 'One-on-one sessions tailored to your unique needs, focusing on personal growth, overcoming challenges, and improving mental well-being.',
      icon: User,
      color: 'bg-brand-100 text-brand-600',
    },
    {
      title: 'Couples Therapy',
      description: 'Navigate relationship challenges, improve communication, and strengthen your bond with evidence-based couples counseling.',
      icon: Users,
      color: 'bg-sage-100 text-sage-600',
    },
    {
      title: 'Family Therapy',
      description: 'Resolve conflicts and foster healthier family dynamics through guided sessions that give everyone a voice.',
      icon: Home,
      color: 'bg-brand-100 text-brand-600',
    },
    {
      title: 'Cognitive Behavioral Therapy (CBT)',
      description: 'A structured approach to identify and change negative thought patterns, highly effective for anxiety and depression.',
      icon: Brain,
      color: 'bg-sage-100 text-sage-600',
    },
    {
      title: 'EMDR Therapy',
      description: 'Eye Movement Desensitization and Reprocessing to help you heal from trauma and distressing life experiences.',
      icon: Sparkles,
      color: 'bg-brand-100 text-brand-600',
    },
    {
      title: 'Online Consultations',
      description: 'Flexible, secure telehealth appointments that bring professional psychological support directly to your home.',
      icon: Monitor,
      color: 'bg-sage-100 text-sage-600',
    },
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-brand-50 to-white">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16 animate-fade-in">
          <div className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700 font-medium mb-2">
            Our Expertise
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
            Comprehensive Psychological Services
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground mt-4">
            Evidence-based therapeutic approaches designed to support your journey toward mental wellness and personal growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div 
                key={service.title}
                className="group relative flex flex-col items-start p-8 bg-white rounded-3xl shadow-soft hover:shadow-card-hover transition-all duration-300 border border-slate-100 animate-slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-4 rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110 ${service.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {service.description}
                </p>
                <Link href="/booking" className="inline-flex items-center text-brand-600 font-semibold group-hover:text-brand-700 transition-colors mt-auto">
                  Book a session
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-brand-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-elevation-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your journey?</h2>
            <p className="text-brand-100 text-lg mb-8">
              Take the first step toward better mental health. Schedule a consultation to discuss how we can work together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold">
                  Book an Appointment
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto h-12 px-8 rounded-full text-base font-semibold bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
