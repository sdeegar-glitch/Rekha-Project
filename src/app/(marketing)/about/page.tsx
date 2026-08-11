import Link from 'next/link'
import { Award, BookOpen, Heart, Shield, GraduationCap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About Us | Rekha Patel Psychology',
  description: 'Learn about Rekha Patel, our clinic\'s philosophy, and our commitment to providing compassionate, evidence-based psychological care.',
}

export default function AboutPage() {
  const values = [
    {
      title: 'Compassionate Care',
      description: 'We believe in creating a safe, non-judgmental space where you can explore your thoughts and feelings openly.',
      icon: Heart,
    },
    {
      title: 'Evidence-Based',
      description: 'Our treatments are grounded in the latest psychological research to ensure the highest quality of care.',
      icon: BookOpen,
    },
    {
      title: 'Confidentiality',
      description: 'Your privacy is our utmost priority. We maintain strict confidentiality protocols to protect your personal information.',
      icon: Shield,
    },
  ]

  const credentials = [
    'M.Phil in Clinical Psychology, Central Institute of Psychiatry (CIP), Ranchi (2016)',
    'Post Graduate Diploma in Guidance, Counselling & Psychological Intervention, BHU (2013)',
    'MA in Psychology, Banaras Hindu University (2012)',
    'Trained in CBT for depression, anxiety & suicide prevention, Beck Institute for CBT',
    '7+ Years of Clinical Experience across Adolescents, Adults & Geriatrics',
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pb-16 pt-8 md:pt-16">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 w-72 h-72 bg-sage-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 space-y-6 animate-slide-in-from-left">
              <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                <Award className="mr-2 h-4 w-4" />
                Trusted Professional Care
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
                Empowering your journey to mental wellness
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Rekha Patel is a licensed clinical psychologist trained at the Central Institute
                of Psychiatry (CIP), Ranchi, with over 7 years of clinical experience across
                adolescents, adults, and geriatrics. She has worked as a clinical psychologist
                and researcher on global health projects at AIIMS, New Delhi, and specializes in
                assessment and therapy for depression, anxiety disorders, personality disorders,
                schizophrenia, and bipolar disorder.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link href="/booking">
                  <Button size="lg" className="rounded-full w-full sm:w-auto h-12 px-8 font-semibold">
                    Schedule a Consultation
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 relative animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative aspect-4/5 md:aspect-square lg:aspect-4/3 rounded-3xl overflow-hidden shadow-elevation-3 border border-border bg-brand-50 dark:bg-brand-950/30">
                {/* Fallback image placeholder with modern gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-brand-200 via-brand-100 to-sage-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <GraduationCap className="w-20 h-20 text-brand-600 mx-auto mb-4 opacity-50" />
                    <p className="text-brand-800 font-display text-xl font-medium">Rekha Patel</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-elevation-4 border border-border animate-slide-in-from-bottom" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-4">
                  <div className="bg-sage-100 p-3 rounded-full text-sage-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">7+</p>
                    <p className="text-sm font-medium text-muted-foreground">Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & Values */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Our Philosophy</h2>
            <p className="text-lg text-muted-foreground">
              We believe that everyone has the capacity for growth and healing. Our approach is collaborative, 
              respectful, and tailored to the unique circumstances of each individual who walks through our doors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="bg-card p-8 rounded-3xl shadow-xs border border-border hover:shadow-md transition-shadow">
                  <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="bg-brand-900 rounded-3xl p-8 md:p-16 overflow-hidden relative shadow-elevation-3">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-800 rounded-full blur-[100px] opacity-50 -mr-40 -mt-40"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Professional Credentials</h2>
                <p className="text-brand-100 text-lg mb-8 leading-relaxed">
                  Rekha has expertise in conducting psychological assessments and providing
                  therapy for a range of psychiatric disorders, and dealing with stressful
                  life situations.
                </p>
                <Link href="/services">
                  <Button variant="outline" className="rounded-full border-white text-white hover:bg-white/10 bg-transparent h-12 px-8">
                    View Our Services
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <ul className="space-y-4">
                  {credentials.map((cred, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-sage-400 shrink-0 mt-0.5" />
                      <span className="text-white font-medium text-lg">{cred}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
