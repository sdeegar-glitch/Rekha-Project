import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PortalSidebar } from '@/components/layout/portal-sidebar'

export const metadata = {
  title: 'Patient Portal - Rekha Patel Psychology',
  description: 'Manage your appointments and settings.',
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/portal')
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <PortalSidebar />
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
