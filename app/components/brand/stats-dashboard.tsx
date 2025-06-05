'use client';

import { DocumentData } from 'firebase/firestore';

interface StatsDashboardProps {
  profile: DocumentData | null;
}

export default function StatsDashboard({ profile }: StatsDashboardProps) {
  if (!profile) return null;

  // These would normally come from the profile data or be calculated
  // For now, we're using mock data
  const stats = {
    activeCreators: profile.activeCreators || 0,
    pendingBookings: profile.pendingBookings || 2,
    completedCampaigns: profile.completedCampaigns || 5,
    totalSpend: profile.totalSpend || '$12,450'
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6 mt-6 hidden lg:block">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Brand Stats</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-gray-600">Active Creators</span>
          <span className="font-semibold">{stats.activeCreators}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-gray-600">Pending Bookings</span>
          <span className="font-semibold">{stats.pendingBookings}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-3">
          <span className="text-gray-600">Completed Campaigns</span>
          <span className="font-semibold">{stats.completedCampaigns}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Spend</span>
          <span className="font-semibold">{stats.totalSpend}</span>
        </div>
      </div>
    </div>
  );
}
