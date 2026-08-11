// Admin Dashboard Layout
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { signOut } from 'next-auth/react'

// Analytics, Payments, Notifications, and Settings pages don't exist yet -
// only list routes that are actually built until they are.
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Schedule', href: '/admin/schedule', icon: Shield },
  { name: 'Patients', href: '/admin/patients', icon: Users },
]

interface AdminSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const content = (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className={cn('px-4', collapsed && 'hidden')}>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'gap-3',
                    collapsed && 'justify-center px-2'
                  )}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                >
                  <Link href={item.href} onClick={onMobileClose}>
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={cn('truncate', collapsed && 'hidden')}>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="gap-3 justify-center px-2 hidden md:flex"
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5 shrink-0" />
                      <span>Collapse</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </SidebarContent>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <Sidebar className={cn('h-screen border-r hidden md:flex', collapsed && 'w-16')}>
        {content}
      </Sidebar>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <Sidebar className="relative h-screen w-72 border-r z-50">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">{session?.user?.name || 'Admin'}</span>
              <Button variant="ghost" size="icon" onClick={onMobileClose} aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {content}
          </Sidebar>
        </div>
      )}
    </>
  )
}

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback>{getInitials(session?.user?.name || 'Admin')}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-between px-2 py-2">
            <div>
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
