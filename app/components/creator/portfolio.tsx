'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/auth';
import { PortfolioItem } from '@/app/lib/types';
import { getPortfolioItems } from '@/app/lib/firebase/portfolio';
import PortfolioManager from './PortfolioManager';

export default function CreatorPortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const items = await getPortfolioItems(user.uid);
      setPortfolio(items);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8D2D26] border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 sm:p-8">
        <PortfolioManager portfolio={portfolio} onUpdate={fetchPortfolio} />
      </div>
    </div>
  );
}

