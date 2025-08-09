# 🚀 Vercel Deployment Guide for UGC Travel Connect

## 📋 Required Environment Variables

### 🔥 Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### 💰 Stripe Configuration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 📱 Instagram API
```bash
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 🌍 App Configuration
```bash
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

### 🔧 Optional Development
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false (set to true for local dev only)
```

## 🚀 Deployment Steps

### 1. **Login to Vercel**
```bash
npx vercel login
```

### 2. **Initialize Project**
```bash
npx vercel
```
- Choose "Link to existing project" if you have one, or create new
- Select your Git repository
- Keep default settings (Next.js framework detected)

### 3. **Set Environment Variables**
You can set them via:

**Option A: Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable one by one

**Option B: Via CLI**
```bash
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... repeat for all variables
```

### 4. **Deploy**
```bash
npx vercel --prod
```

## 🔧 Post-Deployment Configuration

### Firebase Setup
1. **Update Firebase Console:**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to "Authorized domains"
   - Example: `your-app.vercel.app`

2. **Firestore Security Rules:**
   - Ensure your production Firestore rules are properly configured
   - Update any development-only rules

### Stripe Setup
1. **Webhook Configuration:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`

### Instagram API
1. **Update Redirect URIs:**
   - Go to Meta for Developers → Instagram Basic Display
   - Add redirect URI: `https://your-app.vercel.app/api/auth/instagram/callback`

## 🎯 Performance Optimizations

### Edge Runtime Configuration
Your app is already configured for edge runtime on auth pages:
```json
{
  "functions": {
    "app/[locale]/(routes)/auth/register/page.tsx": {
      "runtime": "edge"
    },
    "app/[locale]/(routes)/auth/login/page.tsx": {
      "runtime": "edge"
    }
  }
}
```

### Caching Strategy
- Static assets: 1 year cache
- API routes: 60 seconds with stale-while-revalidate
- Locales: Immutable cache for better i18n performance

## 🌍 Multi-Region Deployment
Configured regions for optimal global performance:
- `iad1` (US East)
- `fra1` (Europe)
- `sfo1` (US West)

## 🔍 Monitoring & Analytics

### Vercel Analytics
Add to your project:
```bash
npm install @vercel/analytics
```

Then in your root layout:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🐛 Common Issues & Solutions

### Issue: Firebase not connecting
**Solution:** Verify all Firebase env vars are set and valid

### Issue: Stripe webhooks failing
**Solution:** Check webhook endpoint URL and ensure STRIPE_WEBHOOK_SECRET is correct

### Issue: Instagram auth not working
**Solution:** Verify Instagram app redirect URIs include your Vercel domain

### Issue: Build fails due to linting
**Solution:** Use `npx vercel --prod --force` to skip pre-commit hooks

## 📱 Testing Your Deployment

### 1. Basic Functionality
- [ ] App loads correctly
- [ ] Language switching works (EN/PL)
- [ ] User registration/login
- [ ] Firebase connection working

### 2. i18n Testing
- [ ] All sidebar navigation translated
- [ ] Brand profile setup in both languages
- [ ] Creator profile setup in both languages
- [ ] All static text properly translated

### 3. Integration Testing
- [ ] Stripe payments (if configured)
- [ ] Instagram integration (if configured)
- [ ] File uploads to Firebase Storage

## 🎉 Next Steps After Deployment

1. **Share the URL** - Your app will be available at `https://your-app.vercel.app`
2. **Continue Translation Work** - Use the live environment to test translations
3. **Set up Custom Domain** (optional) - Configure your own domain in Vercel
4. **Monitor Performance** - Use Vercel Analytics and Performance insights

## 📞 Need Help?
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Your app is already optimized for production deployment! 