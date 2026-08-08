// Simple Calendar Component for booking flow
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarProps {
  className?: string
  mode?: string
  selected?: Date | null
  onSelect?: (date: Date) => void
  initialFocus?: Date
  fromDate?: Date
  toDate?: Date
  disabled?: boolean
}

export function Calendar({ className, selected, onSelect, disabled }: CalendarProps) {
  return (
    <div className={cn('p-4 border rounded-lg flex flex-col items-center justify-center space-y-4', className)}>
      <div className="flex items-center space-x-2 text-primary font-medium">
        <CalendarIcon className="h-5 w-5" />
        <span>Select Date</span>
      </div>
      <input
        type="date"
        disabled={disabled}
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => e.target.value && onSelect?.(new Date(e.target.value))}
        className="w-full p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}