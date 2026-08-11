'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Menu,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

const navigation = [
  { name: 'My Appointments', href: '/portal', icon: Calendar },
  { name: 'Settings', href: '/portal/settings', icon: Settings },
]

export function PortalSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const content = (
    <SidebarContent>
      {/* User Profile Section */}
      <div className={cn("p-4 flex items-center gap-3 border-b", collapsed && "justify-center px-2")}>
        <Avatar className="h-10 w-10 border shadow-xs">
          <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
          <AvatarFallback className="bg-brand-100 text-brand-700 font-medium">
            {session?.user?.name ? getInitials(session.user.name) : <UserCircle className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold truncate text-sm">{session?.user?.name || 'Patient'}</span>
            <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
          </div>
        )}
      </div>

      <SidebarGroup className="mt-4">
        <SidebarGroupLabel className={cn('px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase', collapsed && 'hidden')}>
          Dashboard
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'gap-3 mb-1 transition-all',
                    collapsed && 'justify-center px-2'
                  )}
                  isActive={pathname === item.href}
                >
                  <Link href={item.href} onClick={() => setMobileOpen(false)}>
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className={cn('truncate font-medium', collapsed && 'hidden')}>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarFooter className="mt-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="gap-3 justify-center px-2 text-muted-foreground hover:text-foreground hidden md:flex"
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5 shrink-0" />
                      <span className="font-medium">Collapse Menu</span>
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
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 bg-background shadow-md"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop sidebar */}
      <Sidebar className={cn('h-screen border-r hidden md:flex', collapsed && 'w-16')}>
        {content}
      </Sidebar>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <Sidebar className="relative h-screen w-72 border-r z-50">
            <div className="flex justify-end p-2 border-b">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
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
