// End-to-End Tests for Booking Flow
import { test, expect } from '@playwright/test'

test.describe('Booking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should allow user to book an appointment', async ({ page }) => {
    // Click on Book Appointment button
    await page.click('text=Book Appointment')
    
    // Select service
    await page.click('text=Individual Therapy')
    
    // Select date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateStr)
    
    // Wait for time slots to load
    await page.waitForSelector('text=Available')
    
    // Select first available time slot
    await page.click('text=Available', { timeout: 5000 })
    
    // Fill patient details
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="phone"]', '+919876543210')
    await page.fill('input[name="dateOfBirth"]', '1990-01-01')
    await page.fill('textarea[name="address"]', '123 Test Street, Test City')
    await page.fill('input[name="ecName"]', 'Jane Doe')
    await page.fill('input[name="ecPhone"]', '+919876543211')
    await page.selectOption('select', 'spouse')
    
    // Fill appointment details
    await page.fill('textarea[name="reason"]', 'Initial consultation for anxiety')
    await page.fill('textarea[name="notes"]', 'Prefer morning appointments')
    
    // Click next to payment
    await page.click('text=Next')
    
    // Wait for payment section
    await page.waitForSelector('text=Secure Payment')
    
    // In test mode, we'll mock the payment or skip actual payment
    // For demonstration, we'll just verify the UI elements
    await expect(page.locator('text=Individual Therapy')).toBeVisible()
    await expect(page.locator('text=�₹2,500')).toBeVisible()
    
    // Click confirm button (would trigger payment in real app)
    await page.click('text=Confirm & Pay')
    
    // Wait for confirmation
    await page.waitForSelector('text=Appointment Booked!')
    
    // Verify confirmation details
    await expect(page.locator('text=Appointment Booked!')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
    await expect(page.locator('text=Individual Therapy')).toBeVisible()
    await expect(page.locator('text=�₹2,500')).toBeVisible()
    
    // Test navigation links
    await page.click('text=View My Appointments')
    await expect(page.locator('text=My Appointments')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    await page.click('text=Book Appointment')
    await page.click('text=Individual Therapy')
    
    // Try to proceed without selecting date
    await page.click('text=Next')
    
    // Should show validation error
    await expect(page.locator('text=Please select a date')).toBeVisible()
    
    // Try to proceed without time slot
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateStr)
    await page.click('text=Next')
    
    await expect(page.locator('text=Please select a time slot')).toBeVisible()
    
    // Try to proceed without patient details
    await page.click('text=Next')
    await expect(page.locator('text=Full Name is required')).toBeVisible()
    await expect(page.locator('text=Email Address is required')).toBeVisible()
    await expect(page.locator('text=Phone Number is required')).toBeVisible()
  })
})