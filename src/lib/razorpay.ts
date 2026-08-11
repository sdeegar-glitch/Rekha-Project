import Razorpay from 'razorpay'
import crypto from 'crypto'

// Instantiated lazily so a missing key only fails the request that actually
// needs Razorpay, not module load (e.g. `next build`'s page-data collection,
// which imports this file for every route regardless of whether it's called).
let razorpayClient: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set')
    }
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayClient
}

export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string
) {
  return getRazorpay().orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency: currency.toUpperCase(),
    receipt,
  })
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET || ''
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return generatedSignature === signature
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
) {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return generatedSignature === signature
}

export const RAZORPAY_WEBHOOK_EVENTS = [
  'payment.captured',
  'payment.failed',
  'refund.processed',
] as const

export type RazorpayWebhookEventType = typeof RAZORPAY_WEBHOOK_EVENTS[number]
