'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName?: string;
}

export default function AuthRequiredModal({ isOpen, onClose, creatorName }: AuthRequiredModalProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure transition works
      setTimeout(() => setIsVisible(true), 10);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
      <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className={`relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left shadow-xl transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-burgundy mb-4">Login Required</h3>
        
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-burgundy/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
            
            <p className="text-sm text-gray-600 mb-6">
              You must be logged in to view {creatorName ? `${creatorName}'s` : 'this'} profile. Create an account or log in to connect with creators.
            </p>
        
            <div className="space-y-3">
          <button 
                className="w-full bg-red-burgundy hover:bg-red-burgundy/90 text-white font-medium py-3 rounded-lg transition-all duration-200"
            onClick={() => router.push('/auth/login')}
          >
            Log in
          </button>
          <button 
                className="w-full border border-red-burgundy text-red-burgundy hover:bg-red-burgundy/5 font-medium py-3 rounded-lg transition-all duration-200"
            onClick={() => router.push('/auth/register')}
          >
            Sign up
          </button>
        </div>
        
          <button 
              className="mt-4 text-sm text-gray-400 hover:text-red-burgundy underline transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
