'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function MessagesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-gradient-to-b from-ivory to-white">
      <div className="relative w-24 h-24 mb-6">
        <Image
          src="/images/travel-illustration.svg"
          alt="Travel illustration"
          fill
          className="object-contain"
          />
      </div>
      <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
        Start Your Journey
      </h3>
      <p className="text-center text-gray-600 max-w-md mb-8">
        Plan your upcoming travels and connect with luxury brands for unique content creation opportunities.
      </p>
      <button
        className="inline-flex items-center px-6 py-3 border-2 border-red-burgundy text-red-burgundy hover:bg-red-burgundy hover:text-white font-medium rounded-full transition-all duration-300 group"
        onClick={() => {}}
      >
        <svg className="w-5 h-5 mr-2 text-red-burgundy group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Plan Your First Trip
      </button>
    </div>
  );
} 