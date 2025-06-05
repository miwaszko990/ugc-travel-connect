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
  console.log('Starting createUserDocument with:', { uid, email, role });
  
  if (!uid) {
    console.error('Invalid UID provided to createUserDocument');
    throw new Error('Invalid UID provided to createUserDocument');
  }
  
  const userRef = doc(db, 'users', uid);
  
    // First check if the document already exists
  try {
    console.log('Checking if user document already exists');
    const docSnapshot = await getDoc(userRef);
    
    if (docSnapshot.exists()) {
      console.log('User document already exists, returning existing data');
      return docSnapshot.data() as UserData;
    }
    
    console.log('User document does not exist, creating new document');
    
    // Create the user data object
    const userData: UserData = {
      uid,
      email,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Writing user document to Firestore:', JSON.stringify(userData, null, 2));
    
    // Create the document in Firestore
    await setDoc(userRef, userData);
    
    console.log(`User document created successfully for ${uid}`);
    
    return userData;
  } catch (error: unknown) {
    console.error('Error in createUserDocument:', error);
    
    // Type guard for Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Firebase error code:', error.code);
      
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
  console.log('Getting user document for:', uid);
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      console.log('User document found:', userDoc.data());
      return userDoc.data() as UserData;
    }
    console.log('User document not found');
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Updates a user document in Firestore
 * @param uid User ID
 * @param data Partial UserData to update
 * @returns Promise
 */
export async function updateUserDocument(uid: string, data: Partial<UserData>): Promise<void> {
  console.log('Updating user document for:', uid, data);
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    console.log(`User document updated for ${uid}`);
  } catch (error) {
    console.error('Error updating user document:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
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
  console.log(`Uploading image to ${path}`);
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress.toFixed(1)}%`);
        if (progressCallback) {
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
          console.log('Upload complete, download URL:', downloadURL);
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
  console.log('Getting creator profile for:', uid);
  try {
    const profileDoc = await getDoc(doc(db, 'creators', uid));
    if (profileDoc.exists()) {
      console.log('Creator profile found');
      return profileDoc.data();
    }
    console.log('Creator profile not found');
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
  console.log('Getting brand profile for:', uid);
  try {
    const profileDoc = await getDoc(doc(db, 'brands', uid));
    if (profileDoc.exists()) {
      console.log('Brand profile found');
      return profileDoc.data();
    }
    console.log('Brand profile not found');
    return null;
  } catch (error) {
    console.error('Error getting brand profile:', error);
    return null;
  }
} 