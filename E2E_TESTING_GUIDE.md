# 🎭 E2E Testing Guide - Register Page

## ✅ **Test Setup Complete**

Your register page now has comprehensive E2E testing with Playwright covering:
- **Form functionality** across languages
- **Performance validation** 
- **Network simulation** (Slow 3G)
- **Mobile responsiveness**
- **Accessibility checks**
- **Console error detection**

---

## 🚀 **Running Tests**

### **Basic Test Commands:**
```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run register page tests only
npm run test:e2e:register

# Run network performance tests
npm run test:e2e:network

# View test reports
npm run test:e2e:report
```

### **Specialized Test Runs:**
```bash
# Test mobile devices
npm run test:e2e:mobile

# Test slow 3G network
npm run test:e2e:slow

# Run with browser visible
npm run test:e2e:headed
```

---

## 📋 **Test Coverage**

### **📝 Main Registration Tests (`auth-register.spec.ts`):**

#### ✅ **Internationalization Tests:**
- Loads Polish `/pl/auth/register` page
- Verifies Polish translations ("Witamy!", "Jestem", etc.)
- Tests language switching (PL ↔ EN)
- Validates URL changes on language switch

#### ✅ **Form Validation Tests:**
- Tests empty form submission
- Validates email format
- Validates password strength
- Validates password confirmation matching
- Tests role selection (Creator/Brand)

#### ✅ **User Flow Tests:**
- Complete creator registration flow
- Complete brand registration flow
- Form submission and loading states
- Success redirect handling

#### ✅ **Performance Tests:**
- Lazy component loading verification
- Layout shift detection
- Console error monitoring
- Accessibility validation

### **🌐 Network Performance Tests (`network-performance.spec.ts`):**

#### ✅ **Slow 3G Testing:**
- **Network throttling:** 500kb/s download, 400ms latency
- **Performance budgets:** Form interaction < 500ms
- **Content loading:** Critical content < 8 seconds
- **Functionality:** All features work on slow network

#### ✅ **Core Web Vitals:**
- **TTFB:** < 600ms
- **FCP:** Measured and logged
- **DOM Complete:** < 3 seconds
- **Load metrics:** Full timing analysis

#### ✅ **Mobile + Slow Network:**
- **Viewport:** 375x667 (iPhone size)
- **Touch interactions:** Tap events
- **Responsive design:** Mobile layout validation

---

## 📊 **Test Results & Metrics**

### **What Gets Measured:**
```typescript
// Performance Metrics Collected:
{
  "TTFB": "150ms",           // Time to First Byte
  "FCP": "800ms",            // First Contentful Paint  
  "LCP": "1200ms",           // Largest Contentful Paint
  "DOM Complete": "2100ms",   // DOM parsing complete
  "Form Interaction": "45ms"  // Input responsiveness
}
```

### **Performance Budgets Enforced:**
- ⏱️ **TTFB:** < 600ms (Edge Runtime target)
- 🎨 **FCP:** < 2000ms (Good user experience)
- ⚡ **Form Response:** < 500ms (Even on slow 3G)
- 📱 **Mobile Load:** < 10 seconds (Acceptable on slow network)

---

## 🎯 **Test Scenarios Covered**

### **✅ Core Functionality:**
1. **Page loads** in Polish with correct translations
2. **Form validation** works for all fields
3. **Role selection** (Creator/Brand) functions
4. **Language switching** preserves form state
5. **Form submission** shows loading states
6. **No JavaScript errors** in console

### **✅ Performance & UX:**
1. **Lazy components** load without blocking
2. **Skeleton loaders** appear appropriately
3. **Layout doesn't shift** during interactions
4. **Form remains responsive** on slow networks
5. **Mobile touch** interactions work smoothly

### **✅ Edge Cases:**
1. **Very slow network** (100kb/s) still usable
2. **Mobile viewport** maintains functionality
3. **Console errors** are caught and fail tests
4. **Accessibility** labels and roles verified

---

## 🔧 **Test Configuration**

### **Browser Matrix:**
- ✅ **Desktop:** Chrome, Firefox, Safari
- ✅ **Mobile:** Pixel 5, iPhone 12
- ✅ **Network:** Slow 3G simulation
- ✅ **Performance:** Metrics collection enabled

### **Test Environment:**
- **Base URL:** `http://localhost:3000`
- **Auto-start:** Development server starts automatically
- **Retries:** 2 retries on CI, 0 locally
- **Screenshots:** Only on failure
- **Videos:** Retained on failure

---

## 🐛 **Debugging Failed Tests**

### **View Test Results:**
```bash
# Open interactive test report
npm run test:e2e:report

# Run specific test with UI
npx playwright test auth-register.spec.ts --ui

# Run with browser visible
npm run test:e2e:headed
```

### **Common Issues:**

#### **Slow Loading:**
```typescript
// Increase timeout for slow environments
await expect(element).toBeVisible({ timeout: 10000 });
```

#### **Network Issues:**
```typescript
// Check if dev server is running
// Tests require localhost:3000 to be available
```

#### **Translation Issues:**
```typescript
// Verify translation files exist:
// locales/pl/auth.json
// locales/en/auth.json
```

---

## 📈 **Performance Validation**

### **Expected Results:**
- ✅ **Page loads** in < 2 seconds on normal network
- ✅ **Form responds** in < 100ms on desktop
- ✅ **Lazy components** load in < 3 seconds
- ✅ **Slow 3G usable** with < 8 second initial load
- ✅ **No console errors** during normal usage

### **Actual vs Expected:**
Tests will log actual performance metrics and compare against budgets:

```bash
📊 Performance Metrics:
TTFB: 145.23ms ✅ (< 600ms target)
FCP: 890.45ms ✅ (< 2000ms target)  
Form Interaction: 23.12ms ✅ (< 500ms target)
```

---

## 🎉 **Ready to Test!**

Your register page has **enterprise-level E2E testing** covering:

- **✅ Functionality:** Complete user flows
- **✅ Performance:** Core Web Vitals validation
- **✅ Network:** Slow 3G simulation
- **✅ Mobile:** Touch interactions
- **✅ Accessibility:** Label validation
- **✅ Internationalization:** Polish/English switching

**Run your first test:**
```bash
npm run test:e2e:register
```

**View results interactively:**
```bash
npm run test:e2e:ui
``` 