import { memo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ProfileSectionProps } from './types';

const ProfileSection = memo(function ProfileSection({
  profile,
  isCollapsed,
  onToggleCollapse,
  defaultProfileImage,
  translationNamespace
}: ProfileSectionProps) {
  const t = useTranslations(translationNamespace);
  
  const profileImageUrl = profile?.profileImageUrl || defaultProfileImage;
  const displayName = profile?.brandName || profile?.displayName || profile?.fullName || '';
  const instagramHandle = profile?.instagramHandle || '';

  return (
    <div className={`${isCollapsed ? 'p-3' : 'p-6'} text-center relative bg-gradient-to-br from-red-burgundy/8 via-red-burgundy/3 to-transparent backdrop-blur-sm`}>
      {/* Expand/Collapse button */}
      <button
        onClick={onToggleCollapse}
        className={`${
          isCollapsed 
            ? 'absolute top-3 right-3 w-8 h-8 flex items-center justify-center' 
            : 'absolute right-3 top-3 p-2'
        } rounded-full transition-all duration-300 group hover:scale-110 ${
          isCollapsed 
            ? 'bg-red-burgundy/10 hover:bg-red-burgundy/20' 
            : 'bg-red-burgundy/5 hover:bg-red-burgundy/15'
        }`}
        aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
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
            alt={displayName || t('brandAltText')} 
            fill
            className="object-cover transition-all duration-300"
          />
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 transition-opacity duration-300">
            <h2 className="text-lg font-serif text-red-burgundy font-semibold mb-1">
              {displayName}
            </h2>
            <p className="text-gray-600 text-sm font-light">@{instagramHandle}</p>
            {profile?.website && (
              <p className="text-gray-500 text-xs mt-1 truncate">{profile.website}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProfileSection; 