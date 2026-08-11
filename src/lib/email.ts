import { Resend } from 'resend'

// Initialize Resend with API key from env
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key')

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@rekhapatelpsychology.com'
// Default sender
const FROM_EMAIL = 'Rekha Patel Psychology <noreply@rekhapatelpsychology.com>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  try {
    // If no API key is provided, log the email in development
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY is not set. Email was not sent:')
      console.log(`To: ${to}\nSubject: ${subject}\nBody: ${html}`)
      return { success: true, simulated: true }
    }

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendAppointmentConfirmation(patientEmail: string, patientName: string, date: Date, serviceName: string) {
  const formattedDate = date.toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
  const html = `
    <h1>Appointment Confirmed</h1>
    <p>Dear ${patientName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> has been confirmed.</p>
    <p><strong>Date & Time:</strong> ${formattedDate}</p>
    <br/>
    <p>If you need to reschedule or cancel, please log in to your account.</p>
    <p>Best regards,</p>
    <p>Rekha Patel</p>
  `
  return sendEmail({ to: patientEmail, subject: 'Your Appointment is Confirmed', html })
}

export async function sendAdminNotification(subject: string, message: string) {
  const html = `
    <h2>Admin Notification</h2>
    <p>${message}</p>
  `
  return sendEmail({ to: ADMIN_EMAIL, subject, html })
}