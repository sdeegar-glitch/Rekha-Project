'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CheckCircle, XCircle, Clock, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/admin/appointments?pageSize=50')
      if (!res.ok) throw new Error('Failed to fetch appointments')
      const data = await res.json()
      setAppointments(data.data)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens async after the fetch resolves, not synchronously
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      
      toast({ title: 'Success', description: `Appointment marked as ${status}`, variant: 'success' })
      fetchAppointments()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' })
    }
  }

  const filtered = appointments.filter(a => 
    a.patient.name.toLowerCase().includes(search.toLowerCase()) ||
    a.service.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'CONFIRMED': return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'COMPLETED': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Appointments</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search patients or services..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No appointments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((apt) => (
                      <tr key={apt.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-4">
                          <p className="font-medium">{apt.patient.name}</p>
                          <p className="text-xs text-muted-foreground">{apt.patient.email}</p>
                        </td>
                        <td className="px-4 py-4">{apt.service.name}</td>
                        <td className="px-4 py-4">
                          <p className="font-medium">{apt.date}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {apt.time}
                          </p>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(apt.status)}</td>
                        <td className="px-4 py-4 text-right space-x-2">
                          {apt.status === 'PENDING' && (
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => updateStatus(apt.id, 'CONFIRMED')}>
                              Confirm
                            </Button>
                          )}
                          {apt.status === 'CONFIRMED' && (
                            <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => updateStatus(apt.id, 'COMPLETED')}>
                              Complete
                            </Button>
                          )}
                          {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(apt.id, 'CANCELLED')}>
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
