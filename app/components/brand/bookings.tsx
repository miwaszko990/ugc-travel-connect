'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  getBrandOrders, 
  calculateOrderStats, 
  completeOrder, 
  updateOrderStatus,
  formatOrderDate,
  getStatusDisplayText,
  Order,
  OrderStats 
} from '@/app/lib/firebase/orders';
import { toast } from 'react-hot-toast';

export default function BrandBookings() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingPayment: 0,
    paid: 0,
    inProgress: 0,
    completed: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  // Fetch orders when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const fetchedOrders = await getBrandOrders(user.uid);
      setOrders(fetchedOrders);
      setStats(calculateOrderStats(fetchedOrders));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    
    // Map tab names to order statuses
    const statusMap: { [key: string]: string[] } = {
      'pending': ['pending'],
      'paid': ['paid'],
      'active': ['in_progress'],
      'completed': ['completed']
    };
    
    return statusMap[selectedTab]?.includes(order.status) || false;
  });

  const handleReleasePayment = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;
    
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      await completeOrder(orderId);
      toast.success('Payment released successfully!');
      
      // Refresh orders to show updated status
      await fetchOrders();
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast.error('Failed to release payment');
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    if (processingOrders.has(orderId)) return;
    
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated!');
      
      // Refresh orders to show updated status
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleMessageCreator = (creatorHandle: string) => {
    window.location.href = `/dashboard/brand?tab=messages&creator=${creatorHandle}`;
  };

  if (loading) {
    return (
      <div className="p-8" style={{backgroundColor: '#FDFCF9'}}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-burgundy"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{backgroundColor: '#FDFCF9'}}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Bookings & Payments
        </h1>
        <p className="text-gray-600">
          Manage your creator collaborations and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-sm text-gray-500">Total Bookings</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.paid + stats.inProgress}
          </div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-burgundy mb-1">
            ${stats.totalSpent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Spent</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Bookings', count: stats.totalOrders },
              { key: 'pending', label: 'Pending Payment', count: stats.pendingPayment },
              { key: 'paid', label: 'Paid', count: stats.paid },
              { key: 'active', label: 'In Progress', count: stats.inProgress },
              { key: 'completed', label: 'Completed', count: stats.completed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.key
                    ? 'border-red-burgundy text-red-burgundy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Main Content */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Creator Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-burgundy/10">
                    <Image
                      src={order.creator?.profileImageUrl || '/placeholder-profile.jpg'}
                      alt={`${order.creator?.firstName} ${order.creator?.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.creator?.firstName} {order.creator?.lastName}
                        </h3>
                        <p className="text-sm text-red-burgundy font-medium">
                          @{order.creator?.instagramHandle}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {order.formattedAmount}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                            {getStatusDisplayText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-900 font-medium mb-1">
                        📍 {order.tripDestination}, {order.tripCountry}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {formatOrderDate(order.createdAt)}
                        {order.paidAt && (
                          <span className="ml-3">
                            Paid: {formatOrderDate(order.paidAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleMessageCreator(order.creator?.instagramHandle || '')}
                        className="px-3 py-1 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Message
                      </button>
                      
                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                          disabled={processingOrders.has(order.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {processingOrders.has(order.id) ? 'Updating...' : 'Start Work'}
                        </button>
                      )}
                      
                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleReleasePayment(order.id)}
                          disabled={processingOrders.has(order.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingOrders.has(order.id) ? 'Processing...' : 'Complete & Release Payment'}
                        </button>
                      )}
                      
                      <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {selectedTab === 'all' 
              ? "You haven't made any bookings yet. Browse creators to start collaborating!"
              : `No ${selectedTab} bookings at the moment.`
            }
          </p>
          {selectedTab === 'all' && (
            <button
              onClick={() => window.location.href = '/dashboard/brand?tab=browse-creators'}
              className="bg-red-burgundy text-white px-6 py-2 rounded-lg font-medium hover:bg-red-burgundy/90 transition-colors"
            >
              Browse Creators
            </button>
          )}
        </div>
      )}
    </div>
  );
} 