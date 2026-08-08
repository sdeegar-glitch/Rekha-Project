// Admin Stats API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekAgo = subDays(now, 7)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Parallel queries for better performance
    const [
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPatients,
      newPatientsThisMonth,
      revenueData,
      pendingPaymentsCount,
    ] = await Promise.all([
      // Total appointments
      db.appointment.count(),
      
      // Today's appointments
      db.appointment.count({
        where: {
          timeSlot: {
            startTime: { gte: todayStart, lte: todayEnd },
          },
        },
      }),
      
      // Upcoming appointments (next 7 days)
      db.appointment.count({
        where: {
          timeSlot: {
            startTime: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      
      // Pending appointments
      db.appointment.count({ where: { status: 'PENDING' } }),
      
      // Completed appointments
      db.appointment.count({ where: { status: 'COMPLETED' } }),
      
      // Cancelled appointments
      db.appointment.count({ where: { status: 'CANCELLED' } }),
      
      // Total patients
      db.user.count({ where: { role: 'PATIENT' } }),
      
      // New patients this month
      db.user.count({
        where: {
          role: 'PATIENT',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      
      // Revenue data
      db.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          paidAt: { not: null },
        },
        _sum: { amount: true },
      }),
      
      // Pending payments
      db.payment.count({ where: { status: 'PENDING' } }),
    ])

    // Monthly revenue
    const monthlyRevenue = await db.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    })

    return NextResponse.json({
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPatients,
      newPatientsThisMonth,
      totalRevenue: Number(revenueData._sum.amount || 0),
      revenueThisMonth: Number(monthlyRevenue._sum.amount || 0),
      pendingPayments: pendingPaymentsCount,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}