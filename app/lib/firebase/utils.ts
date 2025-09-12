import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { UserData, UserRole } from '@/app/hooks/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Creates a new user document in Firestore
 * @param uid User ID from Firebase Auth
 * @param email User email
 * @param role User role (creator or brand)
 * @returns Promise with UserData
 */
export async function createUserDocument(uid: string, email: string, role: UserRole): Promise<UserData> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error('Invalid UID provided to createUserDocument');
  }
  
  console.log(`🔥 Creating user document for ${uid} with role ${role}`);
  
  const userRef = doc(db, 'users', uid);
  
  // First check if the document already exists
  try {
    const docSnapshot = await getDoc(userRef);
    
    if (docSnapshot.exists()) {
      console.log(`✅ User document already exists for ${uid}`);
      return docSnapshot.data() as UserData;
    }
    
    // Create the user data object
    const userData: UserData = {
      uid,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`📝 Writing user document to Firestore for ${uid}:`, userData);
    
    // Create the document in Firestore with merge option
    await setDoc(userRef, userData, { merge: true });
    
    console.log(`✅ Successfully created user document for ${uid}`);
    
    // Verify the document was created by reading it back
    const verifySnapshot = await getDoc(userRef);
    if (verifySnapshot.exists()) {
      console.log(`✅ Verified user document exists for ${uid}`);
      return verifySnapshot.data() as UserData;
    } else {
      console.error(`❌ Failed to verify user document creation for ${uid}`);
      return userData; // Return the data we tried to save
    }
    
  } catch (error: unknown) {
    console.error('❌ Error in createUserDocument:', error);
    
    // Type guard for Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'permission-denied') {
        console.error('🚫 Firebase security rules are preventing write. Check your Firestore rules.');
        console.error('Current user auth state:', auth.currentUser?.uid);
        console.error('Trying to write to users/' + uid);
      } else if (error.code === 'unavailable') {
        console.error('📡 Firebase service is currently unavailable. Check your internet connection.');
        
        // Return fallback data when offline
        return {
          uid,
          email,
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }
    
    // Rethrow the error
    throw error;
  }
}

/**
 * Gets a user document from Firestore
 * @param uid User ID
 * @returns Promise with UserData or null
 */
export async function getUserDocument(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
}

/**
 * Updates a user document in Firestore
 * @param uid User ID
 * @param data Partial user data to update
 */
export async function updateUserDocument(uid: string, data: Partial<UserData>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
}

/**
 * Uploads an image to Firebase Storage
 * @param file File to upload
 * @param path Storage path including filename
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export async function uploadImageToStorage(
  file: File, 
  path: string, 
  progressCallback?: (progress: number) => void
): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (progressCallback) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressCallback(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error('Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
}

/**
 * Gets a creator profile from Firestore
 * @param uid User ID
 * @returns Promise with creator profile data or null
 */
export async function getCreatorProfile(uid: string): Promise<any | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid));
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      // Only return data if it's a creator user
      if (data.role === 'creator') {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting creator profile:', error);
    return null;
  }
}

/**
 * Gets a brand profile from Firestore
 * @param uid User ID
 * @returns Promise with brand profile data or null
 */
export async function getBrandProfile(uid: string): Promise<any | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid));
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      // Only return data if it's a brand user
      if (data.role === 'brand') {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting brand profile:', error);
    return null;
  }
} // review trigger
