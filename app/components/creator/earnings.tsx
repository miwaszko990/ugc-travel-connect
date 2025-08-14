'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/auth';
import { 
  getCreatorOrders, 
  calculateCreatorEarningsStats, 
  startWorkOnOrder, 
  formatOrderDate,
  getStatusDisplayText,
  Order,
  CreatorEarningsStats 
} from '@/app/lib/firebase/orders';
import { toast } from 'react-hot-toast';
import { doc, collection, getDocs, query, where, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import FileDeliveryModal from './file-delivery-modal';

export default React.memo(function Earnings() {
  const { user } = useAuth();
  const t = useTranslations('creator.earnings');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<CreatorEarningsStats>({
    totalOrders: 0,
    totalEarned: 0,
    pending: 0,
    pendingPayment: 0,
    inProgress: 0,
    completed: 0,
    averagePerOrder: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState('all');
  const [fileDeliveryModal, setFileDeliveryModal] = useState<{
    isOpen: boolean;
    orderId: string;
    brandName: string;
  }>({
    isOpen: false,
    orderId: '',
    brandName: ''
  });

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
      console.log('🔍 Debug: Fetching orders for creator:', user.uid);
      const fetchedOrders = await getCreatorOrders(user.uid);
      console.log('📊 Debug: Fetched orders:', fetchedOrders);
      setOrders(fetchedOrders);
      setStats(calculateCreatorEarningsStats(fetchedOrders));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    
    const statusMap: { [key: string]: string[] } = {
      'pending': ['pending'],
      'paid': ['paid'],
      'active': ['in_progress'],
      'completed': ['completed']
    };
    
    return statusMap[selectedTab]?.includes(order.status) || false;
  });

  const handleStartWork = async (orderId: string) => {
    if (processingOrders.has(orderId)) return;
    
    try {
      setProcessingOrders(prev => new Set(prev).add(orderId));
      await startWorkOnOrder(orderId);
      toast.success(t('toasts.workStarted'));
      
      // Refresh orders to show updated status
      await fetchOrders();
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error(t('toasts.startWorkFailed'));
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleMessageBrand = async (instagramHandle: string) => {
    window.open(`https://instagram.com/${instagramHandle}`, '_blank');
  };
  
  const handleUploadMaterials = (orderId: string, brandName: string) => {
    setFileDeliveryModal({
      isOpen: true,
      orderId,
      brandName
    });
  };

  const handleFileDeliverySuccess = async () => {
    // Refresh orders to update status
    await fetchOrders();
    toast.success(t('toasts.materialsDelivered'));
  };

  // Debug function to check orders
  const debugOrders = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('🔍 Current user ID:', user.uid);
      
      // Check all orders in the database
      const allOrdersSnapshot = await getDocs(collection(db, 'orders'));
      console.log('📊 Total orders in database:', allOrdersSnapshot.docs.length);
      
      allOrdersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('📋 Order:', doc.id, data);
      });
      
      // Check orders for this specific creator
      const creatorOrdersQuery = query(
        collection(db, 'orders'),
        where('creatorId', '==', user.uid)
      );
      const creatorOrdersSnapshot = await getDocs(creatorOrdersQuery);
      console.log('👤 Orders for this creator:', creatorOrdersSnapshot.docs.length);
      
      // Check message threads for accepted offers
      const threadsSnapshot = await getDocs(collection(db, 'messageThreads'));
      console.log('💬 Total message threads:', threadsSnapshot.docs.length);
      
      threadsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.participants && data.participants.includes(user.uid)) {
          console.log('📨 Thread with user:', doc.id, data);
          if (data.messages) {
            data.messages.forEach((msg: any, index: number) => {
              if (msg.type === 'offer') {
                console.log(`🎯 Offer message ${index}:`, msg);
                console.log(`📋 Offer details:`, {
                  offerId: msg.offerId,
                  offerStatus: msg.offerStatus,
                  price: msg.price,
                  senderId: msg.senderId,
                  trip: msg.trip,
                  description: msg.description
                });
                
                // If this is an accepted offer, let's manually create the missing order
                if (msg.offerStatus === 'accepted' && msg.offerId) {
                  console.log('🚨 Found accepted offer without order! This should have created an order.');
                  console.log('🔧 Consider manually fixing this offer:', msg.offerId);
                }
              }
            });
          }
        }
      });
      
      toast.success(`Debug: Found ${allOrdersSnapshot.docs.length} total orders, ${creatorOrdersSnapshot.docs.length} for you. Check console for details.`);
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Debug failed - check console');
    }
  };

  // Debug function to manually fix missing order
  const fixMissingOrder = async () => {
    if (!user?.uid) return;
    
    try {
      // Find the accepted offer
      const threadsSnapshot = await getDocs(collection(db, 'messageThreads'));
      
      for (const threadDoc of threadsSnapshot.docs) {
        const data = threadDoc.data();
        if (data.participants && data.participants.includes(user.uid)) {
          if (data.messages) {
            for (const msg of data.messages) {
              if (msg.type === 'offer' && msg.offerStatus === 'accepted') {
                console.log('🔧 Creating missing order for accepted offer:', msg.offerId);
                
                // Create the missing order
                const orderData = {
                  id: msg.offerId,
                  brandId: msg.senderId,
                  creatorId: user.uid,
                  amount: msg.price || 500,
                  currency: 'usd',
                  tripDestination: msg.trip?.destination || 'Unknown',
                  tripCountry: msg.trip?.country || '',
                  status: 'paid' as const, // Set as paid since payment was completed
                  description: msg.description || '',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  paidAt: serverTimestamp()
                };
                
                await setDoc(doc(db, 'orders', msg.offerId), orderData);
                console.log('✅ Created missing order:', msg.offerId);
                toast.success('Missing order created! Refreshing...');
                
                // Refresh the orders
                await fetchOrders();
                return;
              }
            }
          }
        }
      }
      
      toast.error('No accepted offers found to fix');
    } catch (error) {
      console.error('Error fixing order:', error);
      toast.error('Failed to fix order - check console');
    }
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
    <div className="p-4 sm:p-8 overflow-x-hidden w-full max-w-full" style={{backgroundColor: '#FDFCF9'}}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Cards - Optimized for mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-base sm:text-2xl font-bold text-emerald-600 mb-1 truncate">
            ${stats.totalEarned.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 leading-tight">{t('stats.totalEarned')}</div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-base sm:text-2xl font-bold text-amber-600 mb-1 truncate">
            ${stats.pendingPayment.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 leading-tight">{t('stats.pendingPayment')}</div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-base sm:text-2xl font-bold text-red-burgundy mb-1 truncate">
            {stats.completed}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 leading-tight">{t('stats.jobsCompleted')}</div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-base sm:text-2xl font-bold text-gray-900 mb-1 truncate">
            ${stats.averagePerOrder.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 leading-tight">{t('stats.avgPerJob')}</div>
        </div>
      </div>
      
      {/* Tabs - Better mobile scrolling */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 overflow-hidden">
        <div className="border-b border-gray-100">
                      <nav className="flex px-2 sm:px-6 overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {[
              { key: 'all', label: t('tabs.allOrders'), count: stats.totalOrders },
              { key: 'paid', label: t('tabs.newOrders'), count: orders.filter(o => o.status === 'paid').length },
              { key: 'active', label: t('tabs.activeWork'), count: stats.inProgress },
              { key: 'completed', label: t('tabs.completed'), count: stats.completed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedTab === tab.key
                    ? 'border-red-burgundy text-red-burgundy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                <span className="ml-1">({tab.count})</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedTab === 'all' ? t('orders.noOrders') : `No ${selectedTab} orders`}
              </h3>
              <p className="text-gray-600">
                {selectedTab === 'all' 
                  ? t('orders.noOrdersSubtitle')
                  : `No ${selectedTab} orders at the moment`
                }
              </p>
              </div>
            ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 sm:p-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  {/* Mobile: Vertical layout, Desktop: Horizontal layout */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Brand Avatar */}
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-red-burgundy/10 flex-shrink-0">
                      <Image
                        src={order.creator?.profileImageUrl || '/placeholder-brand.jpg'}
                        alt={order.creator?.firstName || 'Brand'}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {order.creator?.firstName || 'Brand'}
                          </h3>
                          <p className="text-xs sm:text-sm text-red-burgundy font-medium truncate">
                            @{order.creator?.instagramHandle || 'brand'}
                          </p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-gray-900">
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
                      <div className="mb-3 mt-2">
                        <div className="text-xs sm:text-sm text-gray-900 font-medium mb-1 truncate">
                          📍 {order.tripDestination}, {order.tripCountry}
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Created: {formatOrderDate(order.createdAt)}</div>
                          {order.paidAt && (
                            <div>Paid: {formatOrderDate(order.paidAt)}</div>
                          )}
                        </div>
                      </div>

                      {/* Actions - Always stacked on mobile */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                        <button
                          onClick={() => handleMessageBrand(order.creator?.instagramHandle || '')}
                          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                        >
                          {t('orders.messageBrand')}
                        </button>
                        
                        {order.status === 'paid' && (
                          <button
                            onClick={() => handleStartWork(order.id)}
                            disabled={processingOrders.has(order.id)}
                            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-center"
                          >
                            {processingOrders.has(order.id) ? 'Starting...' : t('orders.startWork')}
                          </button>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <>
                            <button 
                              onClick={() => handleUploadMaterials(order.id, order.brand?.brandName || 'Brand')}
                              className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-red-burgundy text-white rounded-lg hover:bg-red-burgundy/90 transition-colors text-center"
                            >
                              {t('orders.uploadMaterials')}
                            </button>
                            <button className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
                              {t('orders.completeWork')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add bottom padding for mobile navigation */}
      <div className="h-20 sm:h-0" />
          
          {/* Payment Settings Footer */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
            <h3 className="font-serif text-gray-900 font-semibold mb-1">{t('paymentSettings.title')}</h3>
            <p className="text-sm text-gray-600">{t('paymentSettings.subtitle')}</p>
          </div>
          <div className="flex gap-2">
          <button className="group relative inline-flex items-center gap-2 text-red-burgundy hover:text-white bg-white hover:bg-red-burgundy px-4 py-2 rounded-lg font-medium border border-red-burgundy transition-all duration-300 shadow-sm hover:shadow-md">
              <span className="relative">{t('paymentSettings.setupPayouts')}</span>
          </button>
          </div>
        </div>
      </div>
      
      {/* File Delivery Modal */}
      <FileDeliveryModal
        isOpen={fileDeliveryModal.isOpen}
        onClose={() => setFileDeliveryModal(prev => ({ ...prev, isOpen: false }))}
        orderId={fileDeliveryModal.orderId}
        brandName={fileDeliveryModal.brandName}
        onSuccess={handleFileDeliverySuccess}
      />
    </div>
  );
});
