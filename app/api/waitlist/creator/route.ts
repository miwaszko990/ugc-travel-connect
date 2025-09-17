// import { db } from '@/app/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Helper function to get all values for a field name
    const getAll = (fd: FormData, name: string) => 
      fd.getAll(name).map(v => String(v || "").trim());
    
    // Extract basic fields
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const instagram = String(formData.get('instagram') || '').trim();
    const followersStr = String(formData.get('followers') || '').trim();
    const followers = followersStr ? parseInt(followersStr, 10) : null;
    const rates = String(formData.get('rates') || '').trim();
    const language = String(formData.get('language') || '').trim();
    const consent = formData.get('consent') === 'on';
    
    // Validate required fields
    if (!fullName || !email || !instagram || !consent) {
      return Response.redirect(new URL("/pl/lumo?ok=err", req.url), 303);
    }
    
    // Extract trips by zipping arrays
    const cities = getAll(formData, 'trip_city[]');
    const froms = getAll(formData, 'trip_from[]');
    const tos = getAll(formData, 'trip_to[]');
    
    const trips = [];
    for (let i = 0; i < Math.max(cities.length, froms.length, tos.length); i++) {
      const city = cities[i] || '';
      const from = froms[i] || '';
      const to = tos[i] || '';
      
      // Only include trips where at least city and one date are provided
      if (city && (from || to)) {
        trips.push({
          city,
          from: from || null,
          to: to || null
        });
      }
    }
    
    // Extract content types
    const contentTypes = getAll(formData, 'contentTypes');
    
    // Build payload
    const payload = {
      fullName,
      email,
      instagram,
      followers,
      trips,
      contentTypes,
      rates,
      language,
      consent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "landing_pl"
    };
    
    // Save to Firestore - temporarily disabled for deployment
    // await db.collection('waitlist_creators').add(payload);
    
    // Redirect with success
    return Response.redirect(new URL("/pl/lumo?ok=creator", req.url), 303);
    
  } catch (error) {
    console.error('Error saving creator waitlist:', error);
    return Response.redirect(new URL("/pl/lumo?ok=err", req.url), 303);
  }
}
