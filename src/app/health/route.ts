import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Touches the database (not just the app process) so a single external
// keep-alive ping resets both Render's inactivity timer and Supabase's.
// Always returns 200 if the app itself is up, even when the DB check
// fails, so an external monitor's ping still counts as inbound traffic
// and keeps Render awake regardless of transient DB hiccups.
export async function GET() {
  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    await db.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }
  return NextResponse.json({ status: 'ok', db: dbStatus })
}
