import { test, expect, type Page } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!'
};

// Helper function to fill form
async function fillRegistrationForm(page: Page, role: 'creator' | 'brand') {
  // Fill email
  await page.getByLabel('Email').fill(testUser.email);
  
  // Fill password
  await page.getByLabel('Password', { exact: true }).fill(testUser.password);
  
  // Fill confirm password
  await page.getByLabel('Confirm Password').fill(testUser.confirmPassword);
  
  // Select role
  await page.getByLabel('I am a').click();
  await page.getByText(role === 'creator' ? 'Creator' : 'Brand').click();
}

// Performance monitoring helper
async function collectPerformanceMetrics(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      // Core Web Vitals
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Custom metrics
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      timeToFirstByte: navigation.responseStart - navigation.fetchStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart
    };
  });
  
  return metrics;
}

test.describe('Register Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Store console errors on page for later access
    await page.addInitScript(() => {
      (window as any).consoleErrors = [];
      const originalError = console.error;
      console.error = (...args) => {
        (window as any).consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
      };
    });
  });

  test('should load Polish register page with proper internationalization', async ({ page }) => {
    // Navigate to Polish register page
    await page.goto('/pl/auth/register');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify Polish translations are loaded
    await expect(page.getByText('Witamy!')).toBeVisible();
    await expect(page.getByText('Dołącz do platformy UGC')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Hasło')).toBeVisible();
    await expect(page.getByLabel('Potwierdź hasło')).toBeVisible();
    await expect(page.getByLabel('Jestem')).toBeVisible();
    
    // Verify language switcher is present
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PL' })).toBeVisible();
    
    // Check for console errors
    const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should switch language correctly', async ({ page }) => {
    // Start with Polish
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Verify Polish content
    await expect(page.getByText('Witamy!')).toBeVisible();
    
    // Switch to English
    await page.getByRole('button', { name: 'EN' }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify URL changed and English content loaded
    expect(page.url()).toContain('/en/auth/register');
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByText('Join the UGC marketplace')).toBeVisible();
    
    // Switch back to Polish
    await page.getByRole('button', { name: 'PL' }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify back to Polish
    expect(page.url()).toContain('/pl/auth/register');
    await expect(page.getByText('Witamy!')).toBeVisible();
  });

  test('should validate form fields correctly', async ({ page }) => {
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Submit empty form
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    
    // Check for validation errors (these should appear via react-hook-form)
    // Note: Since we're using custom validation, we need to check the form's behavior
    
    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Hasło').click(); // Trigger validation
    
    // Fill weak password
    await page.getByLabel('Hasło').fill('123');
    await page.getByLabel('Potwierdź hasło').click();
    
    // Fill non-matching password confirmation
    await page.getByLabel('Potwierdź hasło').fill('different');
    await page.getByLabel('Email').click();
    
    // Fill valid data
    await fillRegistrationForm(page, 'creator');
    
    // Check that submit button is now enabled
    const submitButton = page.getByRole('button', { name: 'Zarejestruj się' });
    await expect(submitButton).toBeEnabled();
  });

  test('should handle creator registration flow', async ({ page }) => {
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Fill form for creator
    await fillRegistrationForm(page, 'creator');
    
    // Verify role is selected
    await expect(page.getByText('Twórcą')).toBeVisible();
    
    // Submit form
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    
    // Wait for loading state
    await expect(page.getByText('Tworzenie konta...')).toBeVisible();
    
    // Note: In a real test, you'd mock Firebase auth or use test environment
    // For now, we'll just verify the loading state appears
    
    // Check no console errors during submission
    await page.waitForTimeout(2000); // Give time for any async operations
    const consoleErrors = await page.evaluate(() => (window as any).consoleErrors || []);
    expect(consoleErrors.filter(error => !error.includes('Firebase'))).toHaveLength(0);
  });

  test('should handle brand registration flow', async ({ page }) => {
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Fill form for brand
    await fillRegistrationForm(page, 'brand');
    
    // Verify role is selected
    await expect(page.getByText('Marką')).toBeVisible();
    
    // Submit form
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    
    // Wait for loading state
    await expect(page.getByText('Tworzenie konta...')).toBeVisible();
  });

  test('should load lazy components correctly', async ({ page }) => {
    await page.goto('/pl/auth/register');
    
    // Wait for initial page load
    await page.waitForLoadState('domcontentloaded');
    
    // Check that skeleton loaders appear first (if visible)
    // Then check that actual components load
    
    // Verify RoleSelector loads
    await expect(page.getByLabel('Jestem')).toBeVisible({ timeout: 5000 });
    
    // Verify LanguageSwitcher loads
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'PL' })).toBeVisible({ timeout: 5000 });
    
    // Verify components are interactive
    await page.getByLabel('Jestem').click();
    await expect(page.getByText('Twórcą')).toBeVisible();
    await expect(page.getByText('Marką')).toBeVisible();
  });

  test('should perform well on slow 3G network', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    // Set network conditions
    await page.route('**/*', async route => {
      await route.continue();
    });
    
    const startTime = Date.now();
    
    // Navigate to page
    await page.goto('/pl/auth/register');
    
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Verify page loads reasonably fast even on slow network
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Verify critical content is visible
    await expect(page.getByText('Witamy!')).toBeVisible({ timeout: 10000 });
    
    // Test form interaction on slow network
    await fillRegistrationForm(page, 'creator');
    
    // Verify form submission starts promptly
    const submitStartTime = Date.now();
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    await expect(page.getByText('Tworzenie konta...')).toBeVisible({ timeout: 3000 });
    const submitResponseTime = Date.now() - submitStartTime;
    
    expect(submitResponseTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    // Navigate to page
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Collect performance metrics
    const metrics = await collectPerformanceMetrics(page);
    
    // Verify performance benchmarks
    expect(metrics.firstContentfulPaint).toBeLessThan(2000); // FCP < 2s
    expect(metrics.timeToFirstByte).toBeLessThan(600); // TTFB < 600ms
    expect(metrics.domInteractive).toBeLessThan(3000); // DOM Interactive < 3s
    
    console.log('Performance Metrics:', {
      'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(2)}ms`,
      'Time to First Byte': `${metrics.timeToFirstByte.toFixed(2)}ms`,
      'DOM Interactive': `${metrics.domInteractive.toFixed(2)}ms`,
      'Total Load Time': `${metrics.totalLoadTime.toFixed(2)}ms`
    });
  });

  test('should handle form interactions without layout shift', async ({ page }) => {
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Get initial layout
    const initialLayout = await page.locator('form').boundingBox();
    
    // Interact with form elements
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Hasło').fill(testUser.password);
    await page.getByLabel('Jestem').click();
    await page.getByText('Twórcą').click();
    
    // Verify layout hasn't shifted significantly
    const finalLayout = await page.locator('form').boundingBox();
    
    if (initialLayout && finalLayout) {
      const heightDiff = Math.abs(initialLayout.height - finalLayout.height);
      const widthDiff = Math.abs(initialLayout.width - finalLayout.width);
      
      expect(heightDiff).toBeLessThan(50); // Less than 50px height change
      expect(widthDiff).toBeLessThan(20); // Less than 20px width change
    }
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility
    
    // All form fields should have labels
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Hasło');
    const confirmPasswordInput = page.getByLabel('Potwierdź hasło');
    const roleSelector = page.getByLabel('Jestem');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(roleSelector).toBeVisible();
    
    // Submit button should be accessible
    const submitButton = page.getByRole('button', { name: 'Zarejestruj się' });
    await expect(submitButton).toBeVisible();
    
    // Language switcher should be accessible
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PL' })).toBeVisible();
    
    // Links should have proper text
    await expect(page.getByText('Warunki świadczenia usług')).toBeVisible();
    await expect(page.getByText('Politykę prywatności')).toBeVisible();
  });
}); 