import { getServiceBySlug, servicesData } from '@/data/services'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, IndianRupee, ArrowLeft } from 'lucide-react'

// Generate static params for all known services
export function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug)
  if (!service) {
    return { title: 'Service Not Found' }
  }
  return {
    title: `${service.title} | Rekha Patel Psychology`,
    description: service.shortDescription,
  }
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug)

  if (!service) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand-50 pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/services" className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Services
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-brand-100 mb-8 text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sage-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-900 mb-4 relative z-10">{service.title}</h1>
          <p className="text-lg text-brand-700 max-w-2xl relative z-10">{service.shortDescription}</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-brand-100">
              <h2 className="text-2xl font-display font-semibold text-brand-900 mb-4">About this Service</h2>
              <p className="text-brand-700 leading-relaxed whitespace-pre-line">{service.fullDescription}</p>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-sm border border-brand-100">
              <h2 className="text-2xl font-display font-semibold text-brand-900 mb-4">Key Benefits</h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-sage-600 shrink-0 mt-0.5" />
                    <span className="text-brand-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar / CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <h3 className="text-lg font-semibold text-brand-900 mb-4">Session Details</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-brand-700">
                  <Clock className="h-5 w-5 text-brand-500" />
                  <span>Duration: <strong>{service.duration}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-brand-700">
                  <IndianRupee className="h-5 w-5 text-brand-500" />
                  <span>Fee: <strong>{service.price}</strong> / session</span>
                </div>
              </div>

              <div className="border-t border-brand-100 pt-6">
                <p className="text-sm text-brand-600 mb-4 text-center">Ready to take the next step?</p>
                <Button asChild className="w-full bg-brand-600 hover:bg-brand-700 text-white" size="lg">
                  <Link href="/booking">Book an Appointment</Link>
                </Button>
              </div>
            </div>
            
            {/* Contact Help */}
            <div className="bg-sage-50 rounded-2xl p-6 text-center">
              <p className="text-sm text-sage-800 mb-2">Not sure if this is right for you?</p>
              <Link href="/contact" className="text-brand-600 font-medium hover:underline text-sm">Contact us for a brief consultation</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
