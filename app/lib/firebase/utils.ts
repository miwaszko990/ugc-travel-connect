import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { UserData, UserRole } from '@/app/hooks/useAuth';
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
  
  const userRef = doc(db, 'users', uid);
  
  // First check if the document already exists
  try {
    const docSnapshot = await getDoc(userRef);
    
    if (docSnapshot.exists()) {
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
    
    // Create the document in Firestore
    await setDoc(userRef, userData);
    
    return userData;
  } catch (error: unknown) {
    console.error('Error in createUserDocument:', error);
    
    // Type guard for Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'permission-denied') {
        console.error('Firebase security rules are preventing write. Check your Firestore rules.');
      } else if (error.code === 'unavailable') {
        console.error('Firebase service is currently unavailable. Check your internet connection.');
        
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
    const profileDoc = await getDoc(doc(db, 'creators', uid));
    if (profileDoc.exists()) {
      return profileDoc.data();
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
    const profileDoc = await getDoc(doc(db, 'brands', uid));
    if (profileDoc.exists()) {
      return profileDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting brand profile:', error);
    return null;
  }
} // review trigger
