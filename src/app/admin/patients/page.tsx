'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Users, Search, Mail, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

export default function AdminPatients() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchPatients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPatients = async () => {
    try {
      // In a real app, you would have an endpoint for this.
      // We will simulate fetching users with role PATIENT
      const res = await fetch('/api/admin/stats') // Using stats as a placeholder for now, or just an empty list until the API is built
      setLoading(false)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load patients', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Patient Directory</h1>
            <p className="text-muted-foreground">Manage and view patient information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle>All Patients</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                <Users className="mx-auto h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-1">No patients found</h3>
                <p className="text-sm">As patients register and book appointments, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of patients would go here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
