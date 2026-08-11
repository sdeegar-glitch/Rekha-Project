// Root Layout
import type { Metadata, Viewport } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

import { Toaster } from '@/components/ui/toaster'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Rekha Patel Psychology | Clinical Psychologist',
    template: '%s | Rekha Patel Psychology',
  },
  description: 'Dr. Rekha Patel - Clinical Psychologist specializing in anxiety, depression, trauma, and relationship counseling. Book online appointments with secure payments.',
  keywords: ['clinical psychologist', 'therapy', 'counseling', 'mental health', 'anxiety', 'depression', 'trauma', 'CBT', 'EMDR', 'online therapy'],
  authors: [{ name: 'Rekha Patel Psychology' }],
  creator: 'Rekha Patel Psychology',
  publisher: 'Rekha Patel Psychology',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://rekhapatel.com',
    siteName: 'Rekha Patel Psychology',
    title: 'Rekha Patel Psychology | Clinical Psychologist',
    description: 'Dr. Rekha Patel - Clinical Psychologist specializing in anxiety, depression, trauma, and relationship counseling.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rekha Patel Psychology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rekha Patel Psychology',
    description: 'Clinical Psychologist - Book online appointments',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  // Add metadataBase to resolve the warning
  metadataBase: new URL('http://localhost:3000'),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}