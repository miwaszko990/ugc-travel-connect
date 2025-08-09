import { memo } from 'react';
import Image from 'next/image';
import type { MobileNavigationProps } from './types';

const MobileProfileHeader = memo(function MobileProfileHeader({
  profile,
  defaultProfileImage,
  translationNamespace
}: {
  profile: MobileNavigationProps['profile'];
  defaultProfileImage: string;
  translationNamespace: string;
}) {
  // Remove unused parameter warning
  console.debug('Translation namespace:', translationNamespace);
  const profileImageUrl = profile?.profileImageUrl || defaultProfileImage;
  const displayName = profile?.brandName || profile?.displayName || profile?.fullName || '';
  const instagramHandle = profile?.instagramHandle || '';

  return (
    <div className="lg:hidden mb-6 bg-gradient-to-r from-ivory to-red-burgundy/5 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-red-burgundy/20">
          <Image 
            src={profileImageUrl} 
            alt={displayName || "Profile"} 
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-serif text-red-burgundy font-medium">
            {displayName}
          </h2>
          <p className="text-gray-600 text-sm font-light">@{instagramHandle}</p>
        </div>
      </div>
    </div>
  );
});

const MobileTabBar = memo(function MobileTabBar({
  items,
  onItemClick,
  isItemActive
}: {
  items: MobileNavigationProps['items'];
  onItemClick: MobileNavigationProps['onItemClick'];
  isItemActive: MobileNavigationProps['isItemActive'];
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-sm border-t border-red-burgundy/10 flex justify-around items-center h-16 sm:hidden shadow-lg">
      {items.map((item) => {
        const isActive = isItemActive(item, item.index);
        return (
          <button
            key={item.key}
            onClick={() => onItemClick(item, item.index)}
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
  );
});

const MobileNavigation = memo(function MobileNavigation({
  profile,
  items,
  onItemClick,
  isItemActive,
  defaultProfileImage,
  translationNamespace
}: MobileNavigationProps) {
  return (
    <>
      <MobileProfileHeader
        profile={profile}
        defaultProfileImage={defaultProfileImage}
        translationNamespace={translationNamespace}
      />
      <MobileTabBar
        items={items}
        onItemClick={onItemClick}
        isItemActive={isItemActive}
      />
    </>
  );
});

export default MobileNavigation; 