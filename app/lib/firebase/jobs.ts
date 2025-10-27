import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Job } from '@/app/lib/types';

const JOBS_COLLECTION = 'jobs';

// Create a new job
export async function createJob(
  brandId: string,
  brandName: string,
  brandLogoUrl: string | undefined,
  jobData: Omit<Job, 'id' | 'brandId' | 'brandName' | 'brandLogoUrl' | 'createdAt' | 'updatedAt' | 'applicationsCount'>
): Promise<string> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const now = new Date().toISOString();
    
    const newJob = {
      ...jobData,
      brandId,
      brandName,
      brandLogoUrl: brandLogoUrl || null,
      status: jobData.status || 'open',
      applicationsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(jobsRef, newJob);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// Update an existing job
export async function updateJob(
  jobId: string,
  updates: Partial<Omit<Job, 'id' | 'brandId' | 'createdAt'>>
): Promise<void> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

// Archive a job (soft delete)
export async function archiveJob(jobId: string): Promise<void> {
  try {
    await updateJob(jobId, { status: 'archived' });
  } catch (error) {
    console.error('Error archiving job:', error);
    throw error;
  }
}

// Get a single job by ID
export async function getJob(jobId: string): Promise<Job | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (jobSnap.exists()) {
      return {
        id: jobSnap.id,
        ...jobSnap.data(),
      } as Job;
    }
    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
}

// Get all jobs for a specific brand
export async function getBrandJobs(brandId: string): Promise<Job[]> {
  try {
    console.log('🔎 getBrandJobs called with brandId:', brandId);
    const jobsRef = collection(db, JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('brandId', '==', brandId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('📊 Query returned', querySnapshot.docs.length, 'jobs');
    
    const jobs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Job found:', doc.id, 'with brandId:', data.brandId);
      return {
        id: doc.id,
        ...data,
      } as Job;
    });
    
    // Sort in memory to avoid needing a composite index
    const sorted = jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // desc order
    });
    
    console.log('✅ Returning', sorted.length, 'sorted jobs');
    return sorted;
  } catch (error) {
    console.error('❌ Error getting brand jobs:', error);
    throw error;
  }
}

// Get all open jobs (for job board)
export async function getOpenJobs(filters?: {
  category?: string;
  location?: string;
}): Promise<Job[]> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('status', '==', 'open')
    );

    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Job));

    // Apply filters in memory
    if (filters?.category) {
      jobs = jobs.filter(job => job.category === filters.category);
    }
    if (filters?.location) {
      jobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Sort in memory to avoid needing a composite index
    return jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // desc order
    });
  } catch (error) {
    console.error('Error getting open jobs:', error);
    throw error;
  }
}

// Increment applications count for a job
export async function incrementJobApplications(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      applicationsCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error incrementing applications:', error);
    throw error;
  }
}

// Delete a job (hard delete - use with caution)
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

