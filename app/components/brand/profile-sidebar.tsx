'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

interface Profile {
  brandName?: string;
  instagramHandle?: string;
  website?: string;
  profileImageUrl?: string;
}

interface BrandProfileSidebarProps {
  profile: Profile | null;
  isMobile?: boolean;
  onTabChange?: (tabIndex: number) => void;
  activeTabIndex?: number;
}

const navigation: NavItem[] = [
  {
    name: 'Browse Creators',
    href: '/dashboard/brand?tab=browse-creators',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    name: 'Messages',
    href: '/dashboard/brand?tab=messages',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    name: 'Bookings',
    href: '/dashboard/brand?tab=bookings',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: 'Edit Profile',
    href: '/dashboard/brand/profile-setup',
    icon: (props) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
];

export default function BrandProfileSidebar({ profile, isMobile = false, onTabChange, activeTabIndex }: BrandProfileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Use a fallback profile image if none exists
  const defaultImage = "/images/default-avatar.jpg";
  const profileImageUrl = profile?.profileImageUrl || defaultImage;
  
  const handleEditProfile = () => {
    router.push('/dashboard/brand/profile-setup');
  };

  // Helper function to check if a nav item is active
  const isNavItemActive = (item: NavItem, index: number) => {
    if (item.href === '/dashboard/brand/profile-setup') {
      return pathname === '/dashboard/brand/profile-setup';
    }
    
    // Use activeTabIndex if provided (callback mode), otherwise fall back to URL params
    if (onTabChange && activeTabIndex !== undefined) {
      return index === activeTabIndex;
    }
    
    if (pathname === '/dashboard/brand') {
      const currentTab = searchParams.get('tab');
      
      // Browse Creators tab - active when no tab or tab=browse-creators
      if (item.href.includes('?tab=browse-creators')) {
        return !currentTab || currentTab === 'browse-creators';
      }
      
      // Other tabs - match the specific tab parameter
      if (item.href.includes('?tab=')) {
        const tabParam = item.href.split('?tab=')[1];
        return currentTab === tabParam;
      }
    }
    
    return false;
  };

  const handleNavClick = (item: NavItem, index: number) => {
    if (item.href === '/dashboard/brand/profile-setup') {
      router.push('/dashboard/brand/profile-setup');
      return;
    }
    
    // Use callback for tab switching if provided (faster)
    if (onTabChange) {
      onTabChange(index);
    } else {
      // Fallback to router navigation
      router.push(item.href);
    }
  };

  const mobileMenuItems = [
    { name: 'Browse', href: '/dashboard/brand?tab=browse-creators', icon: navigation[0].icon, index: 0 },
    { name: 'Messages', href: '/dashboard/brand?tab=messages', icon: navigation[1].icon, index: 1 },
    { name: 'Bookings', href: '/dashboard/brand?tab=bookings', icon: navigation[2].icon, index: 2 },
    { name: 'Profile', href: '/dashboard/brand/profile-setup', icon: navigation[3].icon, index: 3 },
  ];

  // Mobile version
  if (isMobile) {
    return (
      <>
        <div className="lg:hidden mb-6 bg-gradient-to-r from-ivory to-red-burgundy/5 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-red-burgundy/20">
              <Image 
                src={profileImageUrl} 
                alt={profile?.brandName || "Brand"} 
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-serif text-red-burgundy font-medium">
                {profile?.brandName || ""}
              </h2>
              <p className="text-gray-600 text-sm font-light">@{profile?.instagramHandle || ""}</p>
            </div>
          </div>
        </div>
        {/* Bottom tab bar for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-sm border-t border-red-burgundy/10 flex justify-around items-center h-16 sm:hidden shadow-lg">
          {mobileMenuItems.map((item) => {
            const isActive = isNavItemActive(item, item.index);
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item, item.index)}
                className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium focus:outline-none transition-all duration-300 ${
                  isActive 
                    ? 'text-white bg-gradient-to-t from-red-burgundy to-red-burgundy/90 shadow-lg' 
                    : 'text-gray-500 hover:text-red-burgundy hover:bg-red-burgundy/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={`w-6 h-6 mb-1 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-burgundy'
                  }`}
                />
                <span className="font-serif">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }

  // Desktop/tablet version
  return (
    <div className={`hidden sm:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} relative`}>
      <div className={`sticky top-6 bg-gradient-to-b from-[#FDFCF9] via-[#FDFCF9] to-white/95 rounded-3xl shadow-xl overflow-hidden h-[calc(100vh-3rem)] flex flex-col transition-all duration-300 ease-in-out mx-2 ${isCollapsed ? 'w-20' : 'w-72'}`}
        style={{ minWidth: isCollapsed ? 80 : 288 }}>
        {/* Profile header with luxury styling */}
        <div className={`${isCollapsed ? 'p-3' : 'p-6'} text-center relative bg-gradient-to-br from-red-burgundy/8 via-red-burgundy/3 to-transparent backdrop-blur-sm`}>
          {/* Expand button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`${
              isCollapsed 
                ? 'absolute top-3 right-3 w-8 h-8 flex items-center justify-center' 
                : 'absolute right-3 top-3 p-2'
            } rounded-full transition-all duration-300 group hover:scale-110 ${
              isCollapsed 
                ? 'bg-red-burgundy/10 hover:bg-red-burgundy/20' 
                : 'bg-red-burgundy/5 hover:bg-red-burgundy/15'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRightIcon 
              className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'} text-red-burgundy transition-transform duration-300 ${
                isCollapsed ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          </button>
          
          {/* Profile section */}
          <div className={`${isCollapsed ? 'mb-2' : 'mb-4'} transition-all duration-300`}>
            <div className={`relative mx-auto rounded-full overflow-hidden ring-4 ring-red-burgundy/10 shadow-lg ${
              isCollapsed ? 'w-12 h-12' : 'w-20 h-20'
            }`}>
              <Image 
                src={profileImageUrl} 
                alt={profile?.brandName || "Brand"} 
                fill
                className="object-cover transition-all duration-300"
              />
            </div>
            
            {!isCollapsed && (
              <div className="mt-4 transition-opacity duration-300">
                <h2 className="text-lg font-serif text-red-burgundy font-semibold mb-1">
                  {profile?.brandName || ""}
                </h2>
                <p className="text-gray-600 text-sm font-light">@{profile?.instagramHandle || ""}</p>
                {profile?.website && (
                  <p className="text-gray-500 text-xs mt-1 truncate">{profile.website}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = isNavItemActive(item, index);
              
              const NavButton = () => (
                <button
                  onClick={() => handleNavClick(item, index)}
                  onMouseEnter={() => isCollapsed && setActiveTooltip(item.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className={`w-full transition-all duration-300 ease-in-out relative group ${
                    isCollapsed 
                      ? 'p-3 rounded-2xl' 
                      : 'px-4 py-3 rounded-2xl'
                  } ${
                    isActive
                      ? 'bg-red-burgundy text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-red-burgundy hover:text-white hover:shadow-md'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                    <item.icon
                      className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-burgundy'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="font-serif font-medium text-sm">
                        {item.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Active indicator for collapsed mode */}
                  {isCollapsed && isActive && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-sm"></div>
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <div key={item.name} className="relative">
                    <NavButton />
                    {/* Tooltip for collapsed mode */}
                    {activeTooltip === item.name && (
                      <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
                        <div className="bg-red-burgundy text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                          {item.name}
                          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-red-burgundy rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return <NavButton key={item.name} />;
            })}
          </div>
        </nav>

        {/* Footer section */}
        <div className={`${isCollapsed ? 'p-3' : 'p-4'} border-t border-red-burgundy/10 bg-gradient-to-t from-red-burgundy/5 to-transparent`}>
          <button
            onClick={handleEditProfile}
            className={`w-full transition-all duration-300 ${
              isCollapsed 
                ? 'p-2 rounded-xl bg-red-burgundy/10 hover:bg-red-burgundy/20' 
                : 'px-4 py-2 bg-red-burgundy text-white rounded-xl hover:bg-red-burgundy/90 font-serif font-medium text-sm shadow-md hover:shadow-lg'
            }`}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5 text-red-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              'Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 