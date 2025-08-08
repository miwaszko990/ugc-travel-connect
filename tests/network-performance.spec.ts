import { test, expect, type Page } from '@playwright/test';

// Network simulation utilities
const networkConditions = {
  slow3G: {
    downloadThroughput: 500 * 1024 / 8, // 500kb/s
    uploadThroughput: 500 * 1024 / 8,
    latency: 400
  },
  fast3G: {
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6Mb/s  
    uploadThroughput: 750 * 1024 / 8,
    latency: 150
  }
};

test.describe('Network Performance Tests', () => {
  test('should load and work on Slow 3G', async ({ page, context }) => {
    // Apply slow 3G throttling
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      ...networkConditions.slow3G
    });

    console.log('🌐 Testing on Slow 3G network...');
    
    const startTime = performance.now();
    
    // Navigate to Polish register page
    await page.goto('/pl/auth/register');
    
    // Wait for critical content (should be fast due to SSR)
    await expect(page.getByText('Witamy!')).toBeVisible({ timeout: 8000 });
    
    const firstContentfulPaint = performance.now() - startTime;
    console.log(`📊 First content visible in: ${firstContentfulPaint.toFixed(2)}ms`);
    
    // Verify skeleton loaders appear for lazy components
    // (They should be visible while components load)
    
    // Wait for interactive elements
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Hasło')).toBeVisible({ timeout: 5000 });
    
    // Test form interaction responsiveness
    const interactionStart = performance.now();
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('TestPassword123!');
    
    const interactionTime = performance.now() - interactionStart;
    console.log(`⚡ Form interaction time: ${interactionTime.toFixed(2)}ms`);
    
    // Should be responsive even on slow network
    expect(interactionTime).toBeLessThan(500);
    
    // Test role selector (lazy-loaded component)
    await page.getByLabel('Jestem').click();
    await expect(page.getByText('Twórcą')).toBeVisible({ timeout: 3000 });
    
    // Verify language switcher works
    await page.getByRole('button', { name: 'EN' }).click();
    await expect(page.getByText('Welcome!')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Slow 3G test completed successfully');
  });

  test('should show appropriate loading states', async ({ page, context }) => {
    // Simulate very slow network for testing loading states
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 100 * 1024 / 8, // Very slow: 100kb/s
      uploadThroughput: 100 * 1024 / 8,
      latency: 1000
    });

    console.log('🐌 Testing loading states on very slow network...');
    
    await page.goto('/pl/auth/register');
    
    // Should show skeleton loaders for lazy components
    // (These tests depend on your skeleton implementation)
    
    // Eventually all content should load
    await expect(page.getByText('Witamy!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15000 });
    
    // Test form submission loading state
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Hasło').fill('TestPassword123!');
    await page.getByLabel('Potwierdź hasło').fill('TestPassword123!');
    await page.getByLabel('Jestem').click();
    await page.getByText('Twórcą').click();
    
    // Submit and verify loading state appears
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    await expect(page.getByText('Tworzenie konta...')).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Loading states test completed');
  });

  test('should maintain usability on mobile with slow network', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Apply slow network
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      ...networkConditions.slow3G
    });

    console.log('📱 Testing mobile usability on slow network...');
    
    await page.goto('/pl/auth/register');
    
    // Verify mobile layout loads properly
    await expect(page.getByText('Witamy!')).toBeVisible({ timeout: 10000 });
    
    // Test mobile-specific interactions
    await page.getByLabel('Email').tap();
    await page.getByLabel('Email').fill('mobile@test.com');
    
    // Test role selector on mobile
    await page.getByLabel('Jestem').tap();
    await expect(page.getByText('Twórcą')).toBeVisible({ timeout: 5000 });
    await page.getByText('Twórcą').tap();
    
    // Test language switcher on mobile
    await page.getByRole('button', { name: 'EN' }).tap();
    await expect(page.getByText('Welcome!')).toBeVisible({ timeout: 8000 });
    
    console.log('✅ Mobile usability test completed');
  });

  test('should measure and validate Core Web Vitals', async ({ page }) => {
    console.log('📊 Measuring Core Web Vitals...');
    
    // Navigate and collect metrics
    await page.goto('/pl/auth/register');
    await page.waitForLoadState('networkidle');
    
    // Measure performance
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          resolve({
            // Core Web Vitals approximations
            ttfb: navigation.responseStart - navigation.fetchStart,
            fcp: entries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
            lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime || 0,
            
            // Other metrics
            domComplete: navigation.domComplete - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart
          });
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          resolve({
            ttfb: navigation.responseStart - navigation.fetchStart,
            fcp: 0,
            lcp: 0,
            domComplete: navigation.domComplete - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart
          });
        }, 5000);
      });
    });
    
    console.log('📈 Performance Metrics:', {
      'TTFB': `${(metrics as any).ttfb.toFixed(2)}ms`,
      'FCP': `${(metrics as any).fcp.toFixed(2)}ms`,
      'LCP': `${(metrics as any).lcp.toFixed(2)}ms`,
      'DOM Complete': `${(metrics as any).domComplete.toFixed(2)}ms`,
      'Load Complete': `${(metrics as any).loadComplete.toFixed(2)}ms`
    });
    
    // Validate against performance budgets
    expect((metrics as any).ttfb).toBeLessThan(600); // TTFB < 600ms
    expect((metrics as any).domComplete).toBeLessThan(3000); // DOM < 3s
    
    console.log('✅ Core Web Vitals validation completed');
  });
}); 