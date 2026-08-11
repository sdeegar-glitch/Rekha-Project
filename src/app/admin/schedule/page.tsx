'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react'

export default function AdminSchedule() {
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/admin/availability')
      if (!res.ok) throw new Error('Failed to fetch availability')
      const data = await res.json()
      setAvailabilities(data.data || [])
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load schedule', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens async after the fetch resolves, not synchronously
    fetchAvailability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteAvailability = async (id: string) => {
    // Basic implementation for deleting. Ideally we'd have a DELETE endpoint in the API.
    toast({ title: 'Not Implemented', description: 'Delete endpoint needs to be implemented', variant: 'destructive' })
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Schedule</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Availability
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Availability Rules</CardTitle>
            <CardDescription>Rules defining your recurring weekly schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : availabilities.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                No availability rules found. Click &quot;Add Availability&quot; to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availabilities.map((avail) => (
                  <Card key={avail.id} className="bg-muted/30">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-brand-600" />
                          {avail.dayOfWeek !== null ? daysOfWeek[avail.dayOfWeek] : 'Specific Date'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {avail.startTime} - {avail.endTime}
                        </div>
                        {avail.service && (
                          <div className="text-xs mt-2 inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-brand-800">
                            {avail.service.name}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteAvailability(avail.id)} aria-label="Delete availability">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
