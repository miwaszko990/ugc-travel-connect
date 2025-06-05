import { db } from '@/app/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

/**
 * Fetch user's travel plans from Firestore
 */
export async function getUserTrips(userId: string): Promise<Trip[]> {
  try {
    console.log('🧳 Fetching trips for user:', userId);
    
    const travelPlansRef = collection(db, 'users', userId, 'travelPlans');
    const travelPlansQuery = query(travelPlansRef, orderBy('startDate', 'asc'));
    
    const snapshot = await getDocs(travelPlansQuery);
    
    if (snapshot.empty) {
      console.log('📦 No trips found for user');
      return [];
    }

    const trips: Trip[] = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to string dates
      const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate);
      const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
      
      return {
        id: doc.id,
        destination: data.destination || '',
        country: data.country || '',
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
        status: data.status || 'Planned'
      };
    });
    
    console.log('🧳 Found', trips.length, 'trips:', trips.map(t => t.destination));
    return trips;
  } catch (error) {
    console.error('💥 Error fetching user trips:', error);
    return [];
  }
}

/**
 * Fetch only upcoming trips (start date is in the future)
 */
export async function getUserUpcomingTrips(userId: string): Promise<Trip[]> {
  try {
    console.log('🧳 Fetching upcoming trips for user:', userId);
    
    const travelPlansRef = collection(db, 'users', userId, 'travelPlans');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const travelPlansQuery = query(
      travelPlansRef, 
      where('startDate', '>=', Timestamp.fromDate(today)),
      orderBy('startDate', 'asc')
    );
    
    const snapshot = await getDocs(travelPlansQuery);
    
    if (snapshot.empty) {
      console.log('📦 No upcoming trips found for user');
      return [];
    }

    const trips: Trip[] = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to string dates
      const startDate = data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate);
      const endDate = data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate);
      
      return {
        id: doc.id,
        destination: data.destination || '',
        country: data.country || '',
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Format as YYYY-MM-DD
        status: data.status || 'Planned'
      };
    });
    
    console.log('🧳 Found', trips.length, 'upcoming trips:', trips.map(t => t.destination));
    return trips;
  } catch (error) {
    console.error('💥 Error fetching upcoming trips:', error);
    return [];
  }
} 