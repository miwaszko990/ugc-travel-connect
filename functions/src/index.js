const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe');

admin.initializeApp();

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Stripe secret key not configured');
  }
  return stripe(stripeSecretKey);
}

function getFrontendUrl() {
  // Updated to use correct port 3000 for Next.js default
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

exports.createCheckoutSessionV2 = functions.https.onCall(async (data, context) => {
  console.log('🔥 NEW createCheckoutSessionV2 called');
  console.log('🔍 Raw data type:', typeof data);
  console.log('🔍 Data keys:', Object.keys(data || {}));
  console.log('🔍 Context auth:', context.auth ? 'Present' : 'Missing');
  console.log('🔍 Data auth:', data.auth ? 'Present' : 'Missing');
  
  // Check for authentication in both context and data
  const authInfo = context.auth || data.auth;
  
  if (!authInfo) {
    console.log('❌ Unauthenticated request - no auth in context or data');
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  console.log('✅ Authentication check passed, user ID:', authInfo.uid);

  // Handle the nested data structure we're receiving
  let actualData = data;
  
  // If we received the full request object, extract the actual data
  if (data && data.data && typeof data.data === 'object') {
    actualData = data.data;
    console.log('📦 Extracted nested data:', actualData);
  }
  
  // If we received a wrapped data object, extract it
  if (data && data.rawRequest && data.rawRequest.body && data.rawRequest.body.data) {
    actualData = data.rawRequest.body.data;
    console.log('📦 Extracted from rawRequest:', actualData);
  }
  
  // If the actual data is still nested under a data key, extract it
  if (actualData && actualData.data && typeof actualData.data === 'object') {
    actualData = actualData.data;
    console.log('📦 Extracted from nested data key:', actualData);
  }

  const { 
    offerId, 
    creatorId, 
    brandId, 
    amount, 
    tripDestination, 
    tripCountry,
    currency = 'usd' 
  } = actualData || {};

  console.log('🔍 Final extracted data:', { offerId, creatorId, brandId, amount, tripDestination, tripCountry });

  if (!amount || amount <= 0) {
    console.log('❌ Invalid amount:', amount);
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  if (!offerId || !creatorId || !brandId || !tripDestination) {
    console.log('❌ Missing required fields:', { offerId, creatorId, brandId, tripDestination });
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    console.log('💳 Initializing Stripe client...');
    const stripeClient = getStripeClient();
    console.log('✅ Stripe client initialized');

    const frontendUrl = getFrontendUrl();
    console.log('🌐 Frontend URL:', frontendUrl);

    console.log('🛒 Creating Stripe checkout session...');
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `UGC Content Creation - ${tripDestination}`,
              description: `Payment for UGC content creation services for ${tripDestination}, ${tripCountry || 'Unknown Location'}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/dashboard/brand?tab=messages&payment=success`,
      cancel_url: `${frontendUrl}/dashboard/brand?tab=messages`,
      metadata: {
        offerId: offerId,
        creatorId: creatorId,
        brandId: brandId,
        tripDestination: tripDestination,
        tripCountry: tripCountry || '',
        userId: authInfo.uid,
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);
    return { sessionId: session.id, url: session.url };

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', `Failed to create checkout session: ${error.message}`);
  }
});

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  console.log('🪝 Stripe webhook received');
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('💰 Payment completed:', event.data.object.id);
      await handlePaymentCompleted(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      console.log('💸 Payment failed:', event.data.object.id);
      break;
    default:
      console.log(`🤷 Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

async function handlePaymentCompleted(session) {
  console.log('🎯 Processing completed payment...');
  console.log('📋 Session metadata:', session.metadata);
  
  try {
    const metadata = session.metadata;
    const offerId = metadata?.offerId;
    const creatorId = metadata?.creatorId;
    const brandId = metadata?.brandId;

    if (!offerId || !creatorId || !brandId) {
      console.error('❌ Missing metadata:', { offerId, creatorId, brandId });
      return;
    }

    const db = admin.firestore();

    // Find the conversation between the brand and creator
    console.log('🔍 Finding conversation between:', brandId, 'and', creatorId);
    
    const threadsQuery = await db.collection('messageThreads')
      .where('participants', 'array-contains', brandId)
      .get();

    let threadRef = null;
    for (const doc of threadsQuery.docs) {
      const data = doc.data();
      if (data.participants.includes(creatorId)) {
        threadRef = doc.ref;
        break;
      }
    }

    if (!threadRef) {
      console.error('❌ Thread not found between:', brandId, 'and', creatorId);
      return;
    }

    const threadDoc = await threadRef.get();
    if (!threadDoc.exists) {
      console.error('❌ Thread document not found');
      return;
    }

    const messages = threadDoc.data().messages || [];
    const offerMessageIndex = messages.findIndex(msg => msg.offerId === offerId);
    
    if (offerMessageIndex === -1) {
      console.error('❌ Offer message not found:', offerId);
      return;
    }

    console.log('✅ Found offer message, updating status to paid');

    // Update offer status to 'paid'
    messages[offerMessageIndex].offerStatus = 'paid';
    messages[offerMessageIndex].paidAt = admin.firestore.FieldValue.serverTimestamp();
    messages[offerMessageIndex].stripeSessionId = session.id;
    
    // Add payment data to the offer message
    messages[offerMessageIndex].paymentData = {
      stripeSessionId: session.id,
      amountPaid: session.amount_total / 100, // Convert from cents
      paidAt: new Date()
    };
    
    // Add system message about payment
    const systemMessage = {
      id: `system_${Date.now()}`,
      type: 'system',
      text: '💳 Payment completed! The collaboration is now confirmed. Funds are held in escrow until delivery is complete.',
      senderId: 'system',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'delivered'
    };
    
    messages.push(systemMessage);

    await threadRef.update({
      messages: messages,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Offer updated to paid status');

    // Create an order record for the creator's dashboard
    const orderData = {
      id: offerId,
      brandId: brandId,
      creatorId: creatorId,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      tripDestination: metadata.tripDestination,
      tripCountry: metadata.tripCountry || '',
      status: 'paid', // paid -> in_progress -> completed
      stripeSessionId: session.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('orders').doc(offerId).set(orderData);
    console.log('✅ Order record created for creator dashboard');
    
  } catch (error) {
    console.error('💥 Error updating offer status:', error);
  }
} 