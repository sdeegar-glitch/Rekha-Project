import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { Calendar, Clock, Video, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PortalPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const appointments = await db.appointment.findMany({
    where: { patientId: session.user.id },
    include: {
      service: true,
      timeSlot: true,
    },
    orderBy: {
      timeSlot: {
        startTime: 'desc',
      },
    },
  })

  const now = new Date()
  
  const upcoming = appointments.filter(a => new Date(a.timeSlot.startTime) >= now && a.status !== 'CANCELLED')
  const past = appointments.filter(a => new Date(a.timeSlot.startTime) < now || a.status === 'CANCELLED')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200">Confirmed</Badge>
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200">Pending</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const AppointmentCard = ({ appointment, isUpcoming }: { appointment: any, isUpcoming: boolean }) => (
    <Card className={`relative overflow-hidden transition-all ${isUpcoming ? 'border-brand-200 shadow-xs hover:shadow-md' : 'border-muted bg-muted/20 opacity-80'}`}>
      {isUpcoming && <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />}
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-bold">{appointment.service.name}</CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1.5 text-foreground/80">
            <Calendar className="h-4 w-4 text-brand-600" />
            {format(new Date(appointment.timeSlot.startTime), 'EEEE, MMMM do yyyy')}
          </CardDescription>
        </div>
        {getStatusBadge(appointment.status)}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(appointment.timeSlot.startTime), 'h:mm a')} - {format(new Date(appointment.timeSlot.endTime), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Rekha Patel</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
        <p className="text-muted-foreground mt-2">View and manage your upcoming therapy sessions.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-500" />
            Upcoming Sessions
          </h2>
          {upcoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map(app => <AppointmentCard key={app.id} appointment={app} isUpcoming={true} />)}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No upcoming appointments</h3>
                <p className="text-muted-foreground mt-1 max-w-sm mb-6">You don&apos;t have any therapy sessions scheduled at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {past.length > 0 && (
          <div className="pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              Past Sessions
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map(app => <AppointmentCard key={app.id} appointment={app} isUpcoming={false} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
