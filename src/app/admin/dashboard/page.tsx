// Admin Dashboard Page
'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Loader2,
} from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns'
import { useSocket, useAdminStats } from '@/hooks/useSocket'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  revenueThisMonth: number
  pendingPayments: number
}

interface TodaysAppointment {
  id: string
  status: string
  time: string
  service: { name: string }
  patient: { name: string | null }
  admin: { name: string | null } | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    revenueThisMonth: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [todaysAppointments, setTodaysAppointments] = useState<TodaysAppointment[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const { stats: socketStats, isConnected } = useAdminStats()
  const { toast } = useToast()
  const displayStats = (socketStats as DashboardStats | undefined) ?? stats

  useEffect(() => {
    // Fetch dashboard stats as fallback
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    // Fetch as a fallback when socket stats aren't available yet
    if (socketStats) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading tracks socket availability, not a value derivable from render
      setLoading(false)
    } else {
      fetchStats()
    }

    // Optional: set up interval for real-time updates as fallback
    const interval = setInterval(fetchStats, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [socketStats, isConnected, toast])

  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const res = await fetch(
          `/api/admin/appointments?dateFrom=${today}T00:00:00.000Z&dateTo=${today}T23:59:59.999Z&pageSize=5&sortBy=startTime&sortOrder=asc`
        )
        if (!res.ok) throw new Error('Failed to fetch appointments')
        const data = await res.json()
        setTodaysAppointments(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setAppointmentsLoading(false)
      }
    }

    fetchTodaysAppointments()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="View patients">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-x-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Patients
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    {displayStats.totalPatients}
                  </p>
                </div>
                <Users className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Total registered patients
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-x-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Appointments Today
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    {displayStats.todayAppointments}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-x-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue This Month
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    ${displayStats.revenueThisMonth.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Collected this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-x-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    {displayStats.pendingPayments}
                  </p>
                </div>
                <CreditCard className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients">
              Patients
            </TabsTrigger>
            <TabsTrigger value="billing">
              Billing
            </TabsTrigger>
          </TabsList>
          <TabsContent value="appointments">
            {/* Appointments list placeholder */}
            <Card className="bg-background">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg font-semibold">Today&apos;s Appointments</CardTitle>
                  <Button variant="outline" size="sm">
                    New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {appointmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : todaysAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No appointments scheduled for today
                  </p>
                ) : (
                  <div className="space-y-4">
                    {todaysAppointments.map((apt) => (
                      <div key={apt.id} className="border rounded-lg p-4 bg-muted">
                        <div className="flex items-start space-x-4">
                          <Clock className="h-5 w-5 text-brand-600 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {apt.patient.name || 'Unknown Patient'}
                              </h3>
                              <Badge variant="secondary">{apt.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {apt.service.name} • {apt.time}
                            </p>
                            {apt.admin?.name && (
                              <p className="text-xs text-muted-foreground">
                                With {apt.admin.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="patients">
            {/* Patients list placeholder */}
            <Card className="bg-background">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg font-semibold">Patient List</CardTitle>
                  <Button variant="outline" size="sm">
                    Add Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-center text-muted-foreground py-8">
                  No patients found
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="billing">
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Billing Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-center text-muted-foreground py-8">
                  Invoicing isn&apos;t built yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}