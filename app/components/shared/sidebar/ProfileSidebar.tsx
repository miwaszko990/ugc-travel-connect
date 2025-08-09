import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NavigationIcons, DEFAULT_PROFILE_IMAGES } from '@/app/lib/navigation-config';
import { useNavigation } from './hooks/useNavigation';
import ProfileSection from './ProfileSection';
import NavigationMenu from './NavigationMenu';
import MobileNavigation from './MobileNavigation';
import type { BaseSidebarProps } from './types';

export default function ProfileSidebar({ 
  profile, 
  isMobile = false, 
  onTabChange, 
  activeTabIndex,
  role 
}: BaseSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const t = useTranslations(`${role}.navigation`);
  const translationNamespace = `${role}.navigation`;
  const defaultProfileImage = DEFAULT_PROFILE_IMAGES[role];

  // Use the shared navigation hook
  const {
    navigationItems,
    mobileNavigationItems,
    isNavItemActive,
    handleNavClick,
    handleEditProfile
  } = useNavigation({ role, onTabChange, activeTabIndex });

  // Mobile version
  if (isMobile) {
    return (
      <MobileNavigation
        profile={profile}
        items={mobileNavigationItems}
        onItemClick={handleNavClick}
        isItemActive={isNavItemActive}
        defaultProfileImage={defaultProfileImage}
        translationNamespace={translationNamespace}
      />
    );
  }

  // Desktop/tablet version
  return (
    <div className={`hidden sm:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} relative`}>
      <div 
        className={`sticky top-6 bg-gradient-to-b from-[#FDFCF9] via-[#FDFCF9] to-white/95 rounded-3xl shadow-xl overflow-hidden h-[calc(100vh-3rem)] flex flex-col transition-all duration-300 ease-in-out mx-2 ${isCollapsed ? 'w-20' : 'w-72'}`}
        style={{ minWidth: isCollapsed ? 80 : 288 }}
      >
        {/* Profile header */}
        <ProfileSection
          profile={profile}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          defaultProfileImage={defaultProfileImage}
          translationNamespace={translationNamespace}
        />

        {/* Navigation menu */}
        <NavigationMenu
          items={navigationItems}
          isCollapsed={isCollapsed}
          activeTooltip={activeTooltip}
          onTooltipChange={setActiveTooltip}
          onItemClick={handleNavClick}
          isItemActive={isNavItemActive}
        />

        {/* Footer section with settings button */}
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
              <NavigationIcons.settings className="w-5 h-5 text-red-burgundy" />
            ) : (
              t('settings')
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 