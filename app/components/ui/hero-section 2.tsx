'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import CreatorCard from '@/app/components/creator/creator-card';

interface Creator {
  uid: string;
  firstName: string;
  lastName: string;
  homeCity: string;
  profileImageUrl: string;
  upcomingTrip?: {
    destination: string;
    country: string;
    dateRange: string;
  };
}

export default function HeroSection() {
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch 3 creators with profileComplete = true
    const fetchCreators = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "creator"),
          where("profileComplete", "==", true),
          limit(3)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return {
            uid: doc.id,
            firstName: d.firstName || '',
            lastName: d.lastName || '',
            homeCity: d.homeCity || '',
            profileImageUrl: d.profileImageUrl || '/placeholder-profile.jpg',
            upcomingTrip: d.upcomingTrip || undefined,
          };
        });
        setCreators(data);
      } catch (err) {
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  // Fallbacks if not enough creators
  const charlie = creators.find(
    c => c.firstName === "Charlie" && c.lastName === "Iwaszko"
  );
  const featured = charlie || {
    uid: "featured-charlie",
    firstName: "Charlie",
    lastName: "Iwaszko",
    homeCity: "London, England",
    profileImageUrl: "/images/auth-background.jpeg",
    upcomingTrip: { destination: "Cannes", country: "France", dateRange: "" }
  };
  const mini1 = creators[1] || {
    firstName: "Alex",
    lastName: "Kim",
    homeCity: "Seoul, Korea",
    profileImageUrl: "/images/mini-creator-1.jpg",
    upcomingTrip: { destination: "Paris", country: "France", dateRange: "June 1 - 10, 2023" }
  };

  const scrollToCreators = () => {
    document.getElementById('creators-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Cohesive Travel-Themed Hero */}
      <section className="relative pt-8 md:pt-12 pb-20 md:pb-28 overflow-hidden">
        {/* Soft radial background glow and globe watermark */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-gradient-radial from-[#B0D8C2]/30 via-white/60 to-transparent opacity-70 rounded-full"></div>
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 text-[180px] opacity-10 select-none">🌍</span>
        </div>
        {/* Dotted travel line SVG */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M300,180 C350,150 500,130 600,180 C700,230 750,300 850,290" stroke="#204A38" strokeWidth="2" strokeDasharray="8 8" fill="none" className="opacity-20 animate-travel-line" />
          </svg>
        </div>
        <style jsx global>{`
          @keyframes travel-line {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 32; }
          }
          .animate-travel-line {
            animation: travel-line 2.5s linear infinite;
          }
        `}</style>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            {/* Left column: Text content */}
            <div className="w-full md:w-1/2 text-left relative">
              <div className="relative">
                <span className="inline-block text-xs font-semibold tracking-wider text-[#204A38] mb-4 px-3 py-1 bg-[#F3F7F5] rounded-full shadow-sm">
                  #1 MARKETPLACE FOR TRAVEL CREATORS
                </span>
                {/* Ping animation dot */}
                <span className="absolute top-2 -left-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#222222]"></span>
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight drop-shadow-sm">
                Discover travel-ready creators in seconds.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-lg tracking-normal">
                Connect with UGC creators who are already planning trips to your target destinations. Launch your next campaign effortlessly.
              </p>
              <button 
                onClick={scrollToCreators}
                className="mt-10 bg-[#222222] hover:bg-gray-800 hover:scale-105 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg flex items-center gap-3 transition-all duration-200 group"
                aria-label="Browse creators section"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    scrollToCreators();
                  }
                }}
              >
                Browse Creators
                <span className="inline-block group-hover:animate-bounce ml-2" aria-hidden="true">✈️</span>
              </button>
              {/* Credibility badges row */}
              <div className="flex flex-wrap gap-4 mt-8 text-gray-700 text-base font-medium">
                <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold">
                  <span className="text-lg">🚀</span>2,300+ campaigns
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold">
                  <span className="text-lg">👥</span>1,000+ creators
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold">
                  <span className="text-lg">⭐</span>4.9/5 rating
                </span>
              </div>
            </div>
            {/* Right column: Two card layout */}
            <div className="relative flex flex-col items-center w-full md:w-1/2 min-h-[420px]">
              {/* Decorative background blob */}
              <div className="absolute -top-8 right-0 w-80 h-80 bg-gradient-to-br from-[#B0D8C2]/40 to-[#f8f9fa] rounded-full blur-2xl z-0"></div>

              {/* Back reveal card (centered behind main, right side) */}
              <div
                className="absolute left-1/2 top-32 z-10 w-52"
                style={{
                  transform: 'translateX(40%) rotate(8deg)',
                  transformOrigin: 'bottom center',
                  marginTop: '-40px',
                  opacity: 0.92,
                }}
              >
                <CreatorCard creator={mini1} onClick={() => {}} />
              </div>
              {/* Main big card */}
              <div
                className="relative z-20 w-56 transition-transform duration-200 hover:scale-105"
                style={{
                  boxShadow: '0 0 0 0 #204A3800, 0 8px 32px 0 #204A3820, 0 0 0 8px #204A3810',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                }}
              >
                <CreatorCard 
                  creator={featured} 
                  onClick={() => {}} 
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

{/* Add these animations to your global CSS */}
<style jsx global>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`}</style>

