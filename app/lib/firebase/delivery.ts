import { db } from '@/app/lib/firebase';
import { storage } from '@/app/lib/firebase';
import { 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL,
  UploadTaskSnapshot 
} from 'firebase/storage';

export interface DeliveryFile {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface OrderDelivery {
  files: DeliveryFile[];
  noteToBrand?: string;
  externalLinks?: string;
  deliveredAt: Date;
  status: 'delivered';
}

/**
 * Upload multiple files to Firebase Storage for order delivery
 */
export async function uploadDeliveryFiles(
  files: File[],
  orderId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<DeliveryFile[]> {
  const uploadPromises = files.map(async (file, index) => {
    return new Promise<DeliveryFile>((resolve, reject) => {
      // Create a unique file name to avoid conflicts
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const fileRef = storageRef(storage, `deliveries/${orderId}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Calculate progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(index, Math.round(progress));
        },
        (error) => {
          console.error(`Upload failed for ${file.name}:`, error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL when upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const deliveryFile: DeliveryFile = {
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
              uploadedAt: new Date()
            };
            
            resolve(deliveryFile);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  });

  return Promise.all(uploadPromises);
}

/**
 * Save order delivery data to Firestore and update order status
 */
export async function saveOrderDelivery(
  orderId: string, 
  deliveryData: OrderDelivery
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // First check if order exists
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    // Save delivery data as a subcollection
    const deliveryRef = doc(db, `orders/${orderId}/delivery`, 'latest');
    await setDoc(deliveryRef, {
      ...deliveryData,
      deliveredAt: Timestamp.fromDate(deliveryData.deliveredAt),
      files: deliveryData.files.map(file => ({
        ...file,
        uploadedAt: Timestamp.fromDate(file.uploadedAt)
      }))
    });

    // Update order status
    await updateDoc(orderRef, {
      status: 'delivered',
      deliveredAt: Timestamp.fromDate(deliveryData.deliveredAt),
      updatedAt: Timestamp.now(),
      hasDelivery: true
    });

    console.log('✅ Order delivery saved successfully');
  } catch (error) {
    console.error('❌ Error saving order delivery:', error);
    throw error;
  }
}

/**
 * Get delivery data for an order
 */
export async function getOrderDelivery(orderId: string): Promise<OrderDelivery | null> {
  try {
    const deliveryRef = doc(db, `orders/${orderId}/delivery`, 'latest');
    const deliveryDoc = await getDoc(deliveryRef);
    
    if (!deliveryDoc.exists()) {
      return null;
    }

    const data = deliveryDoc.data();
    
    return {
      ...data,
      deliveredAt: data.deliveredAt.toDate(),
      files: data.files.map((file: any) => ({
        ...file,
        uploadedAt: file.uploadedAt.toDate()
      }))
    } as OrderDelivery;
  } catch (error) {
    console.error('Error getting order delivery:', error);
    return null;
  }
}

/**
 * Check if an order has delivery files
 */
export async function hasOrderDelivery(orderId: string): Promise<boolean> {
  try {
    const deliveryRef = doc(db, `orders/${orderId}/delivery`, 'latest');
    const deliveryDoc = await getDoc(deliveryRef);
    return deliveryDoc.exists();
  } catch (error) {
    console.error('Error checking order delivery:', error);
    return false;
  }
} 
 
 