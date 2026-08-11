// Layout Components - Footer
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Facebook, Twitter, Instagram, Linkedin } from '@/components/icons/social'

export function Footer() {
  const footerLinks = {
    quickLinks: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Rekha Patel' },
      { href: '/services', label: 'Services' },
      { href: '/booking', label: 'Book Appointment' },
      { href: '/contact', label: 'Contact' },
    ],
    services: [
      { href: '/services/individual-therapy', label: 'Individual Therapy' },
      { href: '/services/couples-therapy', label: 'Couples Therapy' },
      { href: '/services/family-therapy', label: 'Family Therapy' },
      { href: '/services/cbt', label: 'CBT' },
      { href: '/services/emdr', label: 'EMDR Trauma Therapy' },
      { href: '/services/online-consultation', label: 'Online Consultation' },
    ],
    resources: [
      { href: '/resources/faq', label: 'FAQ' },
      { href: '/resources/blog', label: 'Blog' },
      { href: '/resources/mental-health-tips', label: 'Mental Health Tips' },
      { href: '/resources/crisis-resources', label: 'Crisis Resources' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  }

  const contactInfo = {
    address: '123 Wellness Avenue, Suite 200, Metropolis, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'hello@rekhapatelpsychology.com',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 2:00 PM\nSun: Closed',
  }

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  ]

  return (
    <footer className="border-t bg-muted/50" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Rekha Patel Psychology - Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600">
                <span className="text-lg font-semibold text-white">RP</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">Rekha Patel Psychology</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Providing compassionate, evidence-based psychological care to help you thrive.
              Rekha Patel specializes in depression, anxiety disorders, personality disorders,
              schizophrenia, and bipolar disorder.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services">
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
            <address className="mt-4 not-italic text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${contactInfo.phone}`} className="transition-colors hover:text-foreground">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${contactInfo.email}`} className="transition-colors hover:text-foreground">
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <span className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">🕐</span>
                <pre className="whitespace-pre-wrap font-sans">{contactInfo.hours}</pre>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rekha Patel Psychology. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-foreground">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}