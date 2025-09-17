import { db } from '@/app/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Helper function to get all values for a field name
    const getAll = (fd: FormData, name: string) => 
      fd.getAll(name).map(v => String(v || "").trim());
    
    // Extract basic fields
    const brandName = String(formData.get('brandName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const websiteOrIg = String(formData.get('websiteOrIg') || '').trim();
    const consent = formData.get('consent') === 'on';
    
    // Validate required fields
    if (!brandName || !email || !websiteOrIg || !consent) {
      return Response.redirect(new URL("/pl/lumo?ok=err", req.url), 303);
    }
    
    // Extract requests by zipping arrays
    const cities = getAll(formData, 'req_city[]');
    const froms = getAll(formData, 'req_from[]');
    const tos = getAll(formData, 'req_to[]');
    
    // Extract job types (applies to all requests)
    const jobType = getAll(formData, 'jobType');
    
    // Extract additional fields
    const assetsQty = String(formData.get('assetsQty') || '').trim();
    const budget = String(formData.get('budget') || '').trim();
    const taxId = String(formData.get('taxId') || '').trim();
    
    const requests = [];
    for (let i = 0; i < Math.max(cities.length, froms.length, tos.length); i++) {
      const city = cities[i] || '';
      const windowFrom = froms[i] || '';
      const windowTo = tos[i] || '';
      
      // Only include requests where at least city is provided
      if (city) {
        requests.push({
          city,
          windowFrom: windowFrom || null,
          windowTo: windowTo || null,
          jobType,
          assetsQty,
          budget,
          taxId
        });
      }
    }
    
    // Build payload
    const payload = {
      brandName,
      email,
      websiteOrIg,
      requests,
      consent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "landing_pl"
    };
    
    // Save to Firestore
    await db.collection('waitlist_brands').add(payload);
    
    // Redirect with success
    return Response.redirect(new URL("/pl/lumo?ok=brand", req.url), 303);
    
  } catch (error) {
    console.error('Error saving brand waitlist:', error);
    return Response.redirect(new URL("/pl/lumo?ok=err", req.url), 303);
  }
}
