import { auth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
  const session = await auth()
  
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact details and basic info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={session?.user?.name || ''} disabled aria-describedby="name-hint" />
              <p id="name-hint" className="text-xs text-muted-foreground">Please contact support to change your name.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue={session?.user?.email || ''} disabled aria-describedby="email-hint" />
              <p id="email-hint" className="text-xs text-muted-foreground">Please contact support to change your email.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end flex-col items-end gap-2">
            <Button disabled aria-describedby="save-hint">Save Changes</Button>
            <p id="save-hint" className="text-xs text-muted-foreground">Profile editing isn&apos;t available yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
