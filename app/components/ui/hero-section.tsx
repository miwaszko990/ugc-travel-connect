'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/auth';
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

  const featured = {
    uid: "featured-charlie",
    firstName: "Charlie",
    lastName: "Iwaszko",
    homeCity: "London, England",
    profileImageUrl: "/images/auth-background.jpeg",
    upcomingTrip: { destination: "Cannes", country: "France", dateRange: "" }
  };

  const mini1 = {
    uid: "mini1",
    firstName: "Alex",
    lastName: "Kim",
    homeCity: "Seoul, Korea",
    profileImageUrl: "/placeholder-profile.jpg",
    upcomingTrip: { destination: "Paris", country: "France", dateRange: "June 1 - 10, 2023" }
  };

  const scrollToCreators = () => {
    document.getElementById('creators-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{backgroundColor: '#FDFCF9'}}>
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0">
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 0, 0, 0.4) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          {/* Elegant gradient overlays */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-burgundy/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-red-burgundy/3 to-transparent rounded-full blur-2xl"></div>
          
          {/* Minimal geometric accents */}
          <div className="absolute top-1/4 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-red-burgundy/20 to-transparent"></div>
          <div className="absolute bottom-1/3 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-red-burgundy/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Content Section */}
            <div className="space-y-8">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-red-burgundy/20 rounded-full">
                <div className="w-2 h-2 bg-red-burgundy rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-burgundy tracking-wide">
                  LUXURY TRAVEL CREATOR MARKETPLACE
                </span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-red-burgundy leading-[0.9] tracking-tight hover:text-red-wine transition-colors duration-500">
                  Lumo
                </h1>
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-serif text-text leading-tight max-w-lg">
                  Where luxury meets authentic storytelling
                </h2>
              </div>
              
              {/* Description */}
              <p className="text-lg lg:text-xl text-subtext leading-relaxed max-w-xl">
                Connect with premium travel creators who transform destinations into captivating stories. 
                Elevate your brand with authentic, luxury content.
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <button 
                  onClick={scrollToCreators}
                  className="group relative inline-flex items-center gap-3 bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-red-burgundy"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-burgundy/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative">Discover Creators</span>
                  <svg className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-red-burgundy">2.3K+</div>
                  <div className="text-sm text-subtext font-medium">Luxury Campaigns</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-red-burgundy">500+</div>
                  <div className="text-sm text-subtext font-medium">Premium Creators</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-red-burgundy">4.9/5</div>
                  <div className="text-sm text-subtext font-medium">Client Satisfaction</div>
                </div>
              </div>
            </div>
            
            {/* Visual Section */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-burgundy/5 to-transparent rounded-3xl blur-3xl"></div>
              
              {/* Creator Cards Showcase */}
              <div className="relative">
                {/* Main featured card */}
                <div className="relative z-20 transform hover:scale-105 transition-transform duration-500">
                  <div className="w-80 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-burgundy/20 overflow-hidden">
                    <CreatorCard 
                      creator={featured} 
                      onClick={() => {}} 
                      priority={true}
                    />
                  </div>
                </div>
                
                {/* Secondary card */}
                <div className="absolute -top-8 -right-8 z-10 transform rotate-6 hover:rotate-3 transition-transform duration-500">
                  <div className="w-64 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-red-burgundy/20 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
                    <CreatorCard creator={mini1} onClick={() => {}} />
                  </div>
                </div>
              
                {/* Floating elements */}
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-burgundy/10 rounded-2xl rotate-12 animate-float"></div>
                <div className="absolute top-1/2 -left-8 w-3 h-3 bg-red-burgundy/30 rounded-full animate-bounce"></div>
                <div className="absolute -top-2 left-1/3 w-2 h-2 bg-red-burgundy/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Transition Zone */}
      <div className="relative h-32 bg-gradient-to-b from-[#FDFCF9] via-gray-50 to-white overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-burgundy/3 via-transparent to-red-burgundy/2 animate-gradient-shift"></div>
        
        {/* Subtle decorative elements for visual continuity */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-red-burgundy/20 to-transparent animate-pulse-soft"></div>
          <div className="absolute top-8 right-1/3 w-24 h-px bg-gradient-to-r from-transparent via-red-burgundy/15 to-transparent"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-burgundy/10 rounded-full animate-pulse"></div>
          
          {/* Additional floating elements */}
          <div className="absolute top-4 left-1/6 w-1 h-1 bg-red-burgundy/20 rounded-full animate-bounce-gentle"></div>
          <div className="absolute bottom-6 right-1/4 w-1.5 h-1.5 bg-red-burgundy/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-3/4 w-0.5 h-8 bg-gradient-to-b from-transparent via-red-burgundy/20 to-transparent animate-pulse-soft" style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Floating transition indicator with enhanced styling */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-8 border-2 border-red-burgundy/30 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <svg className="w-4 h-4 text-red-burgundy/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        
        {/* Subtle wave effect at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </>
  );
} // review trigger
