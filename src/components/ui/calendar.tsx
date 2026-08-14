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
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
  defaultMonth?: Date
}

export function Calendar({
  className,
  selected,
  onSelect,
  initialFocus,
  fromDate,
  toDate,
  disabled,
  captionLayout = 'label',
  defaultMonth,
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
        defaultMonth={defaultMonth ?? selected ?? undefined}
        captionLayout={captionLayout}
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
          month: 'space-y-2 w-full relative',
          month_caption: 'flex justify-center items-center h-7 relative text-sm font-medium text-foreground',
          dropdowns: 'flex items-center justify-center gap-1.5',
          dropdown_root: 'relative inline-flex items-center',
          dropdown:
            'text-xs font-medium text-foreground bg-background border border-input/60 rounded-md pl-1.5 pr-1 py-0.5 cursor-pointer hover:border-primary/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          caption_label: captionLayout === 'label' ? 'text-sm font-medium text-foreground' : 'hidden',
          nav:
            captionLayout === 'label'
              ? 'flex items-center justify-between absolute inset-x-0 top-0 h-7'
              : 'hidden',
          button_previous:
            'h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
          button_next:
            'h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday: 'text-muted-foreground w-8 font-normal text-[11px]',
          week: 'flex w-full mt-0.5',
          day: 'h-8 w-8 text-center text-xs p-0 relative',
          day_button:
            'h-8 w-8 rounded-md p-0 font-normal inline-flex items-center justify-center transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
          today: 'font-semibold text-primary',
          outside: 'text-muted-foreground opacity-40',
          disabled: 'text-muted-foreground opacity-30 pointer-events-none',
          selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
        }}
      />
    </div>
  )
}
