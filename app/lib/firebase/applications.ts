import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Application } from '@/app/lib/types';
import { incrementJobApplications } from './jobs';

const APPLICATIONS_COLLECTION = 'applications';

// Create a new application
export async function createApplication(
  jobId: string,
  creatorId: string,
  creatorName: string,
  applicationData: {
    message: string;
    portfolioLinks?: string[];
    creatorProfileUrl?: string;
    creatorInstagram?: string;
  }
): Promise<string> {
  try {
    const applicationsRef = collection(db, APPLICATIONS_COLLECTION);
    const now = new Date().toISOString();
    
    const newApplication = {
      jobId,
      creatorId,
      creatorName,
      message: applicationData.message,
      portfolioLinks: applicationData.portfolioLinks || [],
      creatorProfileUrl: applicationData.creatorProfileUrl || null,
      creatorInstagram: applicationData.creatorInstagram || null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(applicationsRef, newApplication);
    
    // Increment the job's applications count
    await incrementJobApplications(jobId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

// Update an application status
export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status']
): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(appRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Get a single application by ID
export async function getApplication(applicationId: string): Promise<Application | null> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const appSnap = await getDoc(appRef);
    
    if (appSnap.exists()) {
      return {
        id: appSnap.id,
        ...appSnap.data(),
      } as Application;
    }
    return null;
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
}

// Get all applications for a specific job
export async function getJobApplications(jobId: string): Promise<Application[]> {
  try {
    const applicationsRef = collection(db, APPLICATIONS_COLLECTION);
    const q = query(
      applicationsRef,
      where('jobId', '==', jobId)
    );
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Application));
    
    // Sort in memory to avoid needing a composite index
    return applications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // desc order
    });
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw error;
  }
}

// Get all applications by a specific creator
export async function getCreatorApplications(creatorId: string): Promise<Application[]> {
  try {
    const applicationsRef = collection(db, APPLICATIONS_COLLECTION);
    const q = query(
      applicationsRef,
      where('creatorId', '==', creatorId)
    );
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Application));
    
    // Sort in memory to avoid needing a composite index
    return applications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // desc order
    });
  } catch (error) {
    console.error('Error getting creator applications:', error);
    throw error;
  }
}

// Check if a creator has already applied to a job
export async function hasCreatorApplied(
  creatorId: string,
  jobId: string
): Promise<boolean> {
  try {
    const applicationsRef = collection(db, APPLICATIONS_COLLECTION);
    const q = query(
      applicationsRef,
      where('creatorId', '==', creatorId),
      where('jobId', '==', jobId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking application:', error);
    throw error;
  }
}

