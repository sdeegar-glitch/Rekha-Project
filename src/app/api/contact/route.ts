import { NextRequest, NextResponse } from 'next/server'
import { contactFormSchema } from '@/validators'
import { sendAdminNotification } from '@/lib/email'

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  services: 'Questions about Services',
  booking: 'Help with Booking',
  other: 'Other',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactFormSchema.parse(body)

    const result = await sendAdminNotification(
      `Contact form: ${SUBJECT_LABELS[validated.subject]}`,
      `
        <p><strong>From:</strong> ${validated.firstName} ${validated.lastName} (${validated.email})</p>
        <p><strong>Subject:</strong> ${SUBJECT_LABELS[validated.subject]}</p>
        <p><strong>Message:</strong></p>
        <p>${validated.message.replace(/\n/g, '<br/>')}</p>
      `
    )

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    console.error('Error handling contact form submission:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
