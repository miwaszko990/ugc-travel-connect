import { db } from '@/app/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitQuery,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

export interface Order {
  id: string;
  brandId: string;
  creatorId: string;
  amount: number;
  currency: string;
  tripDestination: string;
  tripCountry: string;
  description?: string;
  status: 'pending' | 'paid' | 'in_progress' | 'completed';
  stripeSessionId?: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
  completedAt?: Timestamp;
  updatedAt: Timestamp;
  // Creator details (populated when fetched)
  creator?: {
    firstName: string;
    lastName: string;
    instagramHandle: string;
    profileImageUrl: string;
  };
  // Brand details (populated when fetched)
  brand?: {
    brandName: string;
    profileImageUrl: string;
  };
  // Derived fields
  formattedAmount?: string;
  statusColor?: string;
  paymentStatusColor?: string;
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  pendingPayment: number;
  paid: number;
  inProgress: number;
  completed: number;
  totalSpent: number;
}

export interface CreatorEarningsStats {
  totalOrders: number;
  totalEarned: number;
  pending: number;
  pendingPayment: number;
  inProgress: number;
  completed: number;
  averagePerOrder: number;
}

/**
 * Fetch orders for a specific brand
 */
export async function getBrandOrders(brandId: string): Promise<Order[]> {
  try {
    console.log('📋 Fetching orders for brand:', brandId);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('brandId', '==', brandId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 Found ${snapshot.docs.length} orders`);
    
    const orders: Order[] = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data() as Order;
        
        // Fetch creator details
        let creator = undefined;
        try {
          const creatorDoc = await getDoc(doc(db, 'users', orderData.creatorId));
          if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();
            creator = {
              firstName: creatorData.firstName || '',
              lastName: creatorData.lastName || '',
              instagramHandle: creatorData.instagramHandle || '',
              profileImageUrl: creatorData.profileImageUrl || '/placeholder-profile.jpg'
            };
          }
        } catch (error) {
          console.error('Error fetching creator details:', error);
        }
        
        return {
          id: orderDoc.id,
          ...orderData,
          creator,
          formattedAmount: `$${orderData.amount.toLocaleString()}`,
          statusColor: getStatusColor(orderData.status),
          paymentStatusColor: getPaymentStatusColor(orderData.status)
        };
      })
    );
    
    return orders;
    
  } catch (error) {
    console.error('Error fetching brand orders:', error);
    return [];
  }
}

/**
 * Calculate order statistics for a brand
 */
export function calculateOrderStats(orders: Order[]): OrderStats {
  const stats = orders.reduce(
    (acc, order) => {
      acc.totalOrders++;
      acc.totalSpent += order.amount;
      
      switch (order.status) {
        case 'pending':
          acc.pending++;
          break;
        case 'pendingPayment':
          acc.pendingPayment++;
          break;
        case 'paid':
          acc.paid++;
          break;
        case 'in_progress':
          acc.inProgress++;
          break;
        case 'completed':
          acc.completed++;
          break;
      }
      
      return acc;
    },
    {
      totalOrders: 0,
      pending: 0,
      pendingPayment: 0,
      paid: 0,
      inProgress: 0,
      completed: 0,
      totalSpent: 0
    }
  );
  
  return stats;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now()
    };
    
    if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
    }
    
    await updateDoc(orderRef, updateData);
    console.log('✅ Order status updated:', orderId, status);
    
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Mark order as completed and release payment
 */
export async function completeOrder(orderId: string): Promise<void> {
  try {
    await updateOrderStatus(orderId, 'completed');
    // In a real implementation, you'd also call Stripe to release the escrow funds
    console.log('✅ Order completed and payment released:', orderId);
    
  } catch (error) {
    console.error('Error completing order:', error);
    throw error;
  }
}

/**
 * Get status color classes for UI
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'pendingPayment':
      return 'text-yellow-600 bg-yellow-50';
    case 'paid':
      return 'text-blue-600 bg-blue-50';
    case 'in_progress':
      return 'text-orange-600 bg-orange-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Get payment status color classes for UI
 */
function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'pendingPayment':
      return 'text-yellow-600 bg-yellow-50';
    case 'paid':
      return 'text-blue-600 bg-blue-50';
    case 'in_progress':
      return 'text-orange-600 bg-orange-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Format date for display
 */
export function formatOrderDate(timestamp: Timestamp): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending Payment';
    case 'pendingPayment':
      return 'Pending Payment';
    case 'paid':
      return 'Paid';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Fetch orders for a specific creator
 */
export async function getCreatorOrders(creatorId: string): Promise<Order[]> {
  try {
    console.log('📋 Fetching orders for creator:', creatorId);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('creatorId', '==', creatorId)
      // Temporarily removed orderBy to bypass index requirement
      // orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    console.log(`📊 Found ${snapshot.docs.length} orders for creator`);
    
    const orders: Order[] = await Promise.all(
      snapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data() as Order;
        
        // Fetch brand details
        let brand = undefined;
        try {
          const brandDoc = await getDoc(doc(db, 'users', orderData.brandId));
          if (brandDoc.exists()) {
            const brandData = brandDoc.data();
            brand = {
              firstName: brandData.brandName || 'Unknown Brand',
              lastName: '',
              instagramHandle: brandData.instagramHandle || '',
              profileImageUrl: brandData.profileImageUrl || '/placeholder-brand.jpg'
            };
          }
        } catch (error) {
          console.error('Error fetching brand details:', error);
        }
        
        return {
          id: orderDoc.id,
          ...orderData,
          creator: brand, // Using creator field to store brand data for consistency
          formattedAmount: `$${orderData.amount.toLocaleString()}`,
          statusColor: getStatusColor(orderData.status),
          paymentStatusColor: getPaymentStatusColor(orderData.status)
        };
      })
    );
    
    return orders;
    
  } catch (error) {
    console.error('Error fetching creator orders:', error);
    return [];
  }
}

/**
 * Calculate earnings statistics for a creator
 */
export function calculateCreatorEarningsStats(orders: Order[]): CreatorEarningsStats {
  const stats = orders.reduce(
    (acc, order) => {
      acc.totalOrders++;
      
      // Count pending orders (accepted but not yet paid)
      if (order.status === 'pending') {
        acc.pending++;
      }
      
      // Only count paid and completed orders in total earned
      if (order.status === 'paid' || order.status === 'in_progress' || order.status === 'completed') {
        acc.totalEarned += order.amount;
      }
      
      // Pending payment includes paid orders waiting to start work
      if (order.status === 'paid') {
        acc.pendingPayment += order.amount;
      }
      
      // Completed orders are payment released
      if (order.status === 'completed') {
        acc.completed++;
      }
      
      if (order.status === 'in_progress') {
        acc.inProgress++;
      }
      
      return acc;
    },
    {
      totalOrders: 0,
      totalEarned: 0,
      pending: 0,
      pendingPayment: 0,
      inProgress: 0,
      completed: 0,
      averagePerOrder: 0
    }
  );
  
  // Calculate average per order for paid/completed orders
  const earnedOrders = orders.filter(order => 
    order.status === 'paid' || order.status === 'in_progress' || order.status === 'completed'
  );
  
  stats.averagePerOrder = earnedOrders.length > 0 
    ? stats.totalEarned / earnedOrders.length 
    : 0;
  
  return stats;
}

/**
 * Start work on an order (creator marks as in progress)
 */
export async function startWorkOnOrder(orderId: string): Promise<void> {
  try {
    await updateOrderStatus(orderId, 'in_progress');
    console.log('✅ Order marked as in progress:', orderId);
    
  } catch (error) {
    console.error('Error starting work on order:', error);
    throw error;
  }
}

/**
 * Mark order as ready for review (creator submits work)
 */
export async function submitOrderWork(orderId: string): Promise<void> {
  try {
    // This could be a new status like 'submitted' or 'pending_review'
    // For now, we'll keep it as 'in_progress' until brand marks complete
    console.log('✅ Order work submitted, waiting for brand review:', orderId);
    
  } catch (error) {
    console.error('Error submitting order work:', error);
    throw error;
  }
} // review trigger
