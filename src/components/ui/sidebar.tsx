// Sidebar Components
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-64 flex-col border-r bg-sidebar',
      className
    )}
    {...props}
  />
))
Sidebar.displayName = 'Sidebar'

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex p-4', className)}
    {...props}
  />
))
SidebarFooter.displayName = 'SidebarFooter'

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex w-full min-w-0 flex-col p-4', className)} {...props} />
))
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-2 text-xs font-medium text-muted-foreground', className)}
    {...props}
  />
))
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex w-full min-w-0', className)} {...props} />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm outline-hidden ring-sidebar-ring transition-all focus-visible:ring-2 active:ring-2 disabled:pointer-events-none disabled:opacity-50 group/hocus',
  {
    variants: {
      variant: {
        default: 'text-sidebar-foreground',
        outline: 'bg-sidebar-accent text-sidebar-accent-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2',
        lg: 'h-11 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild = false, isActive, variant = 'default', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ variant }), isActive && 'bg-sidebar-accent text-sidebar-accent-foreground', className)}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('mx-3.5 flex w-[calc(100%-1.75rem)] min-w-0 flex-col gap-1 border-l border-sidebar-border pl-3.5 py-2', className)}
    {...props}
  />
))
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-sm outline-hidden ring-sidebar-ring transition-all focus-visible:ring-2 active:ring-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
}