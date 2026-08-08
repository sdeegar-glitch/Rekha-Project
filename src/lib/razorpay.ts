import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
})

export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string
) {
  return razorpay.orders.create({
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
