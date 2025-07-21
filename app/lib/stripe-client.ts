import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from './firebase';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutSessionData {
  offerId: string;
  creatorId: string;
  brandId: string;
  amount: number;
  tripDestination: string;
  tripCountry?: string;
}

/**
 * Ensure user is authenticated and token is fresh
 */
async function ensureAuthenticated() {
  // Wait for auth to be ready if it's still initializing
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!auth.currentUser && attempts < maxAttempts) {
    console.log(`🔄 Waiting for auth state (attempt ${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  if (!auth.currentUser) {
    throw new Error('You must be logged in to initiate payment');
  }
  
  // Force token refresh to ensure we have a valid token
  console.log('🔄 Refreshing authentication token...');
  try {
    const token = await auth.currentUser.getIdToken(true);
    console.log('🔑 User authenticated, fresh token available');
    return token;
  } catch (error) {
    console.error('❌ Failed to get authentication token:', error);
    throw new Error('Authentication expired. Please try again.');
  }
}

/**
 * Client-side function to create Stripe checkout session via Firebase Function
 */
export async function createCheckoutSession(data: CheckoutSessionData) {
  console.log('🔥 Calling Firebase Function for checkout session:', data);
  
  // Ensure user is authenticated first
  await ensureAuthenticated();
  
  try {
    // Call the Firebase function
    const createCheckoutSessionV2 = httpsCallable(functions, 'createCheckoutSessionV2');
    console.log('📞 Calling createCheckoutSessionV2 with data:', data);
    
    const result = await createCheckoutSessionV2(data);
    console.log('✅ Function call successful:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('❌ Error calling Firebase Function:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(url: string) {
  console.log('🔗 Redirecting to Stripe Checkout:', url);
  
  if (!url) {
    throw new Error('No checkout URL provided');
  }
  
  // Redirect to the Stripe Checkout URL
  window.location.href = url;
} // review trigger
