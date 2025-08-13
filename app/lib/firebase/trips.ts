import { db } from '@/app/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

export interface TripInput {
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

/**
 * Add a new trip to user's travel plans
 */
export async function addTrip(userId: string, tripData: TripInput): Promise<string> {
  try {
    console.log('🧳 Adding trip for user:', userId, tripData);
    
    const travelPlansRef = collection(db, 'users', userId, 'travelPlans');
    
    // Convert date strings to Firestore Timestamps
    const startDate = Timestamp.fromDate(new Date(tripData.startDate));
    const endDate = Timestamp.fromDate(new Date(tripData.endDate));
    
    const tripDoc = {
      ...tripData,
      startDate,
      endDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(travelPlansRef, tripDoc);
    console.log('✅ Trip added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('💥 Error adding trip:', error);
    throw error;
  }
}

/**
 * Delete a trip from user's travel plans
 */
export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  try {
    console.log('🗑️ Deleting trip:', tripId, 'for user:', userId);
    
    const tripRef = doc(db, 'users', userId, 'travelPlans', tripId);
    await deleteDoc(tripRef);
    
    console.log('✅ Trip deleted successfully');
  } catch (error) {
    console.error('💥 Error deleting trip:', error);
    throw error;
  }
}