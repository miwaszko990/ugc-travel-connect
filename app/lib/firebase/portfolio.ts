import { db, storage } from '@/app/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { PortfolioItem } from '@/app/lib/types';

/**
 * Upload a portfolio file (image or video) to Firebase Storage
 * @param file The file to upload
 * @param userId The creator's user ID
 * @param progressCallback Optional callback for upload progress
 * @returns The download URL of the uploaded file
 */
export async function uploadPortfolioFile(
  file: File,
  userId: string,
  progressCallback?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `portfolioItems/${userId}/${fileName}`);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Add a portfolio item to a creator's profile
 * @param userId The creator's user ID
 * @param item The portfolio item to add (without id)
 * @returns The created portfolio item with id
 */
export async function addPortfolioItem(
  userId: string,
  item: Omit<PortfolioItem, 'id'>
): Promise<PortfolioItem> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Generate a unique ID for the portfolio item
    const portfolioItem: PortfolioItem = {
      id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      uploadedAt: new Date().toISOString()
    };

    // Remove undefined values (Firebase doesn't accept them)
    const cleanedItem = Object.fromEntries(
      Object.entries(portfolioItem).filter(([_, value]) => value !== undefined)
    ) as PortfolioItem;

    // Add the item to the user's portfolio array
    await updateDoc(userRef, {
      portfolio: arrayUnion(cleanedItem)
    });

    console.log('✅ Portfolio item added:', cleanedItem.id);
    return cleanedItem;
  } catch (error) {
    console.error('❌ Error adding portfolio item:', error);
    throw error;
  }
}

/**
 * Remove a portfolio item from a creator's profile
 * @param userId The creator's user ID
 * @param itemId The ID of the portfolio item to remove
 */
export async function removePortfolioItem(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Find the item to remove
    const itemToRemove = portfolio.find((item: PortfolioItem) => item.id === itemId);
    
    if (!itemToRemove) {
      throw new Error('Portfolio item not found');
    }

    // Remove from Firestore
    await updateDoc(userRef, {
      portfolio: arrayRemove(itemToRemove)
    });

    // Optionally delete the file from storage
    // Note: This requires parsing the URL to get the storage path
    // For now, we'll leave the file in storage as it's safer
    
    console.log('✅ Portfolio item removed:', itemId);
  } catch (error) {
    console.error('❌ Error removing portfolio item:', error);
    throw error;
  }
}

/**
 * Update a portfolio item in a creator's profile
 * @param userId The creator's user ID
 * @param itemId The ID of the portfolio item to update
 * @param updates The fields to update
 */
export async function updatePortfolioItem(
  userId: string,
  itemId: string,
  updates: Partial<Omit<PortfolioItem, 'id' | 'uploadedAt'>>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Find and update the item
    const updatedPortfolio = portfolio.map((item: PortfolioItem) => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });

    // Update the entire portfolio array
    await updateDoc(userRef, {
      portfolio: updatedPortfolio
    });

    console.log('✅ Portfolio item updated:', itemId);
  } catch (error) {
    console.error('❌ Error updating portfolio item:', error);
    throw error;
  }
}

/**
 * Get all portfolio items for a creator
 * @param userId The creator's user ID
 * @returns Array of portfolio items
 */
export async function getPortfolioItems(userId: string): Promise<PortfolioItem[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Sort by order if available, then by uploadedAt
    return portfolio.sort((a: PortfolioItem, b: PortfolioItem) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  } catch (error) {
    console.error('❌ Error getting portfolio items:', error);
    return [];
  }
}

/**
 * Reorder portfolio items
 * @param userId The creator's user ID
 * @param orderedItemIds Array of portfolio item IDs in the desired order
 */
export async function reorderPortfolioItems(
  userId: string,
  orderedItemIds: string[]
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const portfolio = userData.portfolio || [];
    
    // Update the order field for each item based on its position in orderedItemIds
    const updatedPortfolio = portfolio.map((item: PortfolioItem) => {
      const orderIndex = orderedItemIds.indexOf(item.id);
      if (orderIndex !== -1) {
        return { ...item, order: orderIndex };
      }
      return item;
    });

    await updateDoc(userRef, {
      portfolio: updatedPortfolio
    });

    console.log('✅ Portfolio items reordered');
  } catch (error) {
    console.error('❌ Error reordering portfolio items:', error);
    throw error;
  }
}

