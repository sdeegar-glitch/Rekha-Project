// Layout Components - Header
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, Calendar, Settings, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { useNotifications } from '@/hooks/useSocket'
import { formatDistanceToNow } from 'date-fns'

function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="text-xs text-muted-foreground h-auto p-0">
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            notifications.map((notif: any) => (
              <div 
                key={notif.id || notif.notificationId} 
                className={cn("p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors", !notif.read && "bg-muted/20")}
                onClick={() => !notif.read && markAsRead(notif.id || notif.notificationId)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={cn("text-sm", !notif.read && "font-semibold")}>{notif.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/booking', label: 'Book Appointment' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Calendar },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/schedule', label: 'Schedule', icon: Settings },
    { href: '/admin/patients', label: 'Patients', icon: User },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" aria-label="Rekha Patel Psychology - Home">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-50 border border-brand-200">
              <Image src="/logo.png" alt="Rekha Patel Psychology Logo" width={40} height={40} className="object-cover" priority />
            </div>
            <span className="hidden font-display text-xl font-bold text-foreground sm:block">
              Rekha Patel Psychology
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <>
              <NotificationsDropdown />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback>{getInitials(session.user?.name || 'User')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-between px-2 py-2">
                  <div>
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN' ? (
                  <>
                    {adminLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href} className="flex items-center gap-2 w-full">
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/portal" className="flex items-center gap-2 w-full">
                        <Calendar className="h-4 w-4" />
                        My Appointments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/portal/settings" className="flex items-center gap-2 w-full">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  asChild
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <button className="flex items-center gap-2 w-full text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/booking">
                <Button size="sm">Book Appointment</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t bg-background py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <hr className="my-2" />
                {session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN' ? (
                  adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))
                ) : (
                  <Link
                    href="/portal"
                    className="px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Appointments
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="mt-2 w-full justify-start"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">Sign In</Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">Book Appointment</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}