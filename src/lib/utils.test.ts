// Unit Tests for Utility Functions
import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatPhoneNumber,
  generateSlug,
  truncate,
  getInitials,
  calculateAge,
  isPast,
  isFuture,
  addMinutes,
  subtractMinutes,
  startOfDay,
  endOfDay,
  isSameDay,
  getTimeSlots,
  debounce,
  throttle,
  sleep,
  retry,
  parseJsonSafe,
  omit,
  pick,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('Date Formatting', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toContain('January')
      expect(formatDate(date)).toContain('15')
      expect(formatDate(date)).toContain('2024')
    })

    it('formats time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date)).toMatch(/\d{1,2}:\d{2} [AP]M/)
    })

    it('formats date time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatDateTime(date)).toContain('January')
      expect(formatDateTime(date)).toContain('2024')
      expect(formatDateTime(date)).toContain(':')
    })
  })

  describe('Currency Formatting', () => {
    it('formats INR correctly', () => {
      expect(formatCurrency(2500, 'INR')).toContain('₹')
      expect(formatCurrency(2500, 'INR')).toContain('2,500')
    })

    it('formats USD correctly', () => {
      expect(formatCurrency(25, 'USD')).toContain('$')
      expect(formatCurrency(25, 'USD')).toContain('25')
    })
  })

  describe('Phone Number Formatting', () => {
    it('formats 10-digit Indian numbers', () => {
      expect(formatPhoneNumber('9876543210')).toBe('+91 98765 43210')
    })

    it('formats 12-digit numbers with country code', () => {
      expect(formatPhoneNumber('919876543210')).toBe('+91 98765 43210')
    })
  })

  describe('Slug Generation', () => {
    it('generates slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Test@#$%')).toBe('test')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })
  })

  describe('Truncate', () => {
    it('truncates long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...')
    })

    it('returns original if shorter', () => {
      expect(truncate('Hi', 10)).toBe('Hi')
    })
  })

  describe('Initials', () => {
    it('gets initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Single')).toBe('S')
      expect(getInitials('Three Word Name')).toBe('TW')
    })
  })

  describe('Age Calculation', () => {
    it('calculates age correctly', () => {
      const dob = new Date()
      dob.setFullYear(dob.getFullYear() - 25)
      expect(calculateAge(dob)).toBe(25)
    })
  })

  describe('Date Comparisons', () => {
    it('identifies past dates', () => {
      expect(isPast(new Date(Date.now() - 86400000))).toBe(true)
      expect(isPast(new Date(Date.now() + 86400000))).toBe(false)
    })

    it('identifies future dates', () => {
      expect(isFuture(new Date(Date.now() + 86400000))).toBe(true)
      expect(isFuture(new Date(Date.now() - 86400000))).toBe(false)
    })
  })

  describe('Time Manipulation', () => {
    it('adds minutes correctly', () => {
      const date = new Date('2024-01-15T10:00:00')
      const result = addMinutes(date, 30)
      expect(result.getMinutes()).toBe(30)
    })

    it('subtracts minutes correctly', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = subtractMinutes(date, 30)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('Day Boundaries', () => {
    it('gets start of day', () => {
      const date = new Date('2024-01-15T14:30:00')
      const start = startOfDay(date)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
    })

    it('gets end of day', () => {
      const date = new Date('2024-01-15T14:30:00')
      const end = endOfDay(date)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
    })

    it('checks same day', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T20:00:00')
      const date3 = new Date('2024-01-16T10:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
      expect(isSameDay(date1, date3)).toBe(false)
    })
  })

  describe('Time Slots Generation', () => {
    it('generates correct time slots', () => {
      // A slot starting at 11:30 would run until 12:30, past the 12:00 window
      // close, so it must be excluded — only 2 slots fit.
      const slots = getTimeSlots('09:00', '12:00', 60, 15)
      expect(slots.length).toBe(2)
      expect(slots[0]).toEqual({ start: '09:00', end: '10:00' })
      expect(slots[1]).toEqual({ start: '10:15', end: '11:15' })
    })
  })

  describe('Debounce', () => {
    it('delays function execution', async () => {
      let count = 0
      const fn = debounce(() => count++, 100)
      fn()
      fn()
      fn()
      expect(count).toBe(0)
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(count).toBe(1)
    })
  })

  describe('Throttle', () => {
    it('limits function execution', async () => {
      let count = 0
      const fn = throttle(() => count++, 100)
      fn()
      fn()
      fn()
      expect(count).toBe(1)
      await new Promise(resolve => setTimeout(resolve, 150))
      fn()
      expect(count).toBe(2)
    })
  })

  describe('Sleep', () => {
    it('delays execution', async () => {
      const start = Date.now()
      await sleep(100)
      expect(Date.now() - start).toBeGreaterThanOrEqual(90)
    })
  })

  describe('Retry', () => {
    it('retries on failure', async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 3) throw new Error('Fail')
        return 'success'
      }
      const result = await retry(fn, 3, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('throws after max retries', async () => {
      const fn = async () => { throw new Error('Fail') }
      await expect(retry(fn, 2, 10)).rejects.toThrow('Fail')
    })
  })

  describe('JSON Parsing', () => {
    it('parses valid JSON', () => {
      expect(parseJsonSafe('{"a":1}', {})).toEqual({ a: 1 })
    })

    it('returns fallback for invalid JSON', () => {
      expect(parseJsonSafe('invalid', { b: 2 })).toEqual({ b: 2 })
    })
  })

  describe('Object Manipulation', () => {
    it('omits keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 })
    })

    it('picks keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
    })
  })
})