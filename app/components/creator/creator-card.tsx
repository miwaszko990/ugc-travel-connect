'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

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
  followers?: number;
  specialties?: string[];
}

interface CreatorCardProps {
  creator: Creator;
  onClick: (creator: Creator) => void;
  priority?: boolean;
}

export default function CreatorCard({ creator, onClick, priority }: CreatorCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getProfileColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const followers = creator.followers || Math.floor(Math.random() * 50000) + 5000;
  
  return (
    <article 
      onClick={() => onClick(creator)}
      className="flex flex-col bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover:scale-[1.02] hover:border-red-burgundy/20 p-6 min-h-[420px]"
      role="button"
      tabIndex={0}
      aria-label={`View ${creator.firstName} ${creator.lastName}'s profile from ${creator.homeCity}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(creator);
        }
      }}
    >
      {/* Creator Image - Fixed aspect ratio */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-4 flex-shrink-0">
        {/* Loading skeleton */}
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        {/* Initials fallback */}
        {imageFailed && (
          <div className={`absolute inset-0 ${getProfileColor(creator.firstName)} flex items-center justify-center`}>
            <span className="text-white text-4xl font-bold">
              {getInitials(creator.firstName, creator.lastName)}
            </span>
          </div>
        )}
        
        {!imageFailed && (
          <Image
            src={creator.profileImageUrl}
            alt={`${creator.firstName} ${creator.lastName}, UGC creator from ${creator.homeCity}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            priority={priority}
            onError={(e) => {
              console.log('Image failed to load:', creator.profileImageUrl);
              setImageFailed(true);
              setImageLoaded(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', creator.profileImageUrl);
              setImageLoaded(true);
            }}
          />
        )}
      </div>
      
      {/* Creator Info - Flexible layout */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Name - Allow natural height */}
        <div className="mb-3">
          <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-red-burgundy transition-colors duration-300 leading-tight overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}>
            {creator.firstName} {creator.lastName}
          </h3>
        </div>
          
        {/* Trip Status - Allow natural height */}
        <div className="mb-4 flex-shrink-0">
          {creator.upcomingTrip ? (
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-full font-medium flex items-center gap-2 w-fit max-w-full">
              <span className="text-blue-500">✈️</span>
              <span className="truncate">{creator.upcomingTrip.destination}, {creator.upcomingTrip.dateRange}</span>
            </span>
          ) : (
            <span className="bg-gray-50 text-gray-600 text-xs px-3 py-2 rounded-full font-medium flex items-center gap-2 w-fit max-w-full">
              <span className="text-gray-500">📍</span>
              <span className="truncate">Currently in {creator.homeCity}</span>
            </span>
          )}
        </div>
          
        {/* Stats Row - Fixed at bottom with proper spacing */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 flex-shrink-0">
          {/* Followers */}
          <div className="flex items-center gap-2 text-gray-600">
            <UsersIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">{formatFollowers(followers)}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{creator.homeCity.split(',')[0]}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
// review trigger
