'use client'

import { DayPicker, type Matcher } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CalendarProps {
  className?: string
  mode?: 'single'
  selected?: Date | null
  onSelect?: (date: Date) => void
  initialFocus?: unknown
  fromDate?: Date
  toDate?: Date
  disabled?: boolean
}

export function Calendar({
  className,
  selected,
  onSelect,
  initialFocus,
  fromDate,
  toDate,
  disabled,
}: CalendarProps) {
  const dateMatchers: Matcher[] = []
  if (fromDate) dateMatchers.push({ before: fromDate })
  if (toDate) dateMatchers.push({ after: toDate })

  return (
    <div className={cn(disabled && 'pointer-events-none opacity-50', className)} aria-disabled={disabled}>
      <DayPicker
        mode="single"
        selected={selected ?? undefined}
        onSelect={(date) => date && onSelect?.(date)}
        disabled={dateMatchers}
        startMonth={fromDate}
        endMonth={toDate}
        autoFocus={!!initialFocus}
        showOutsideDays
        className="w-full"
        components={{
          Chevron: ({ orientation }) =>
            orientation === 'left' ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ),
        }}
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-4 w-full',
          month_caption: 'flex justify-center items-center h-9 relative font-medium text-foreground',
          nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-9',
          button_previous:
            'h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
          button_next:
            'h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday: 'text-muted-foreground w-9 font-normal text-xs',
          week: 'flex w-full mt-1',
          day: 'h-9 w-9 text-center text-sm p-0 relative',
          day_button:
            'h-9 w-9 rounded-md p-0 font-normal inline-flex items-center justify-center transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          today: 'font-semibold text-primary',
          outside: 'text-muted-foreground opacity-40',
          disabled: 'text-muted-foreground opacity-30 pointer-events-none',
          selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
        }}
      />
    </div>
  )
}
