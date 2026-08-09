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
  TrendingUp,
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
import { AppointmentStatus } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardStats {
  patients: number
  appointmentsToday: number
  revenueToday: number
  growth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    patients: 0,
    appointmentsToday: 0,
    revenueToday: 0,
    growth: 0,
  })
  const [loading, setLoading] = useState(true)
  const { stats: socketStats, isConnected } = useAdminStats()
  const { toast } = useToast()

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

    // Use socket stats if available, otherwise fetch
    if (socketStats) {
      setStats(socketStats as DashboardStats)
      setLoading(false)
    } else {
      fetchStats()
    }

    // Optional: set up interval for real-time updates as fallback
    const interval = setInterval(fetchStats, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [socketStats, isConnected, toast])

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
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
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
                    {stats.patients}
                  </p>
                </div>
                <Users className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Active patients in the system
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
                    {stats.appointmentsToday}
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
                    Revenue Today
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    ${stats.revenueToday.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Collected today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader className="pb-4">
              <div className="flex flex-col space-x-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Growth
                  </CardTitle>
                  <p className="text-2xl font-semibold text-foreground">
                    {stats.growth >= 0 ? '+' : ''}{stats.growth}%
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Month over month
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
                  <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
                  <Button variant="outline" size="sm">
                    New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Sample appointment card - replace with actual data */}
                  <div className="border rounded-lg p-4 bg-muted">
                    <div className="flex items-start space-x-4">
                      <Clock className="h-5 w-5 text-brand-600 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline">
                          <h3 className="text-lg font-semibold text-foreground">
                            John Doe
                          </h3>
                          <Badge variant="secondary">
                            {AppointmentStatus.CONFIRMED}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Initial Consultation • 10:00 AM
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Room 101 • Dr. Smith
                        </p>
                      </div>
                      <div className="flex items-baseline space-x-2 text-xs">
                        <Button variant="ghost" size="sm">
                          Check In
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
            {/* Billing overview placeholder */}
            <Card className="bg-background">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg font-semibold">Billing Overview</CardTitle>
                  <Button variant="outline" size="sm">
                    Add Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">
                        Total Invoices
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        124
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">
                        Paid This Month
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        $8,450
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">
                        Pending
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        $2,100
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">
                        Overdue
                      </div>
                      <div className="text-2xl font-semibold mt-1">
                        $350
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}