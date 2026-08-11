import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Admin - Rekha Patel Psychology',
  description: 'Practice administration.',
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/portal')
  }

  return <>{children}</>
}
