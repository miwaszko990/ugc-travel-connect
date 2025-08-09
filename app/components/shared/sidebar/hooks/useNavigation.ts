import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { 
  getNavigationConfig, 
  PROFILE_SETUP_PATHS
} from '@/app/lib/navigation-config';
import type { 
  UseNavigationReturn, 
  NavigationItemWithTranslation 
} from '../types';

interface UseNavigationProps {
  role: 'brand' | 'creator';
  onTabChange?: (tabIndex: number) => void;
  activeTabIndex?: number;
}

export function useNavigation({ 
  role, 
  onTabChange, 
  activeTabIndex 
}: UseNavigationProps): UseNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations(`${role}.navigation`);

  // Get navigation configuration based on role
  const navigationConfig = useMemo(() => getNavigationConfig(role, false), [role]);
  const mobileNavigationConfig = useMemo(() => getNavigationConfig(role, true), [role]);

  // Transform navigation items with translations
  const navigationItems: NavigationItemWithTranslation[] = useMemo(() => 
    navigationConfig.map(item => ({
      ...item,
      name: t(item.key)
    })),
    [navigationConfig, t]
  );

  const mobileNavigationItems: NavigationItemWithTranslation[] = useMemo(() => 
    mobileNavigationConfig.map(item => ({
      ...item,
      name: t(item.key)
    })),
    [mobileNavigationConfig, t]
  );

  // Helper function to check if a nav item is active
  const isNavItemActive = (item: NavigationItemWithTranslation, index: number): boolean => {
    const profileSetupPath = PROFILE_SETUP_PATHS[role];
    
    // Check if we're on profile setup page
    if (item.href === profileSetupPath) {
      return pathname === profileSetupPath;
    }
    
    // Use activeTabIndex if provided (callback mode), otherwise fall back to URL params
    if (onTabChange && activeTabIndex !== undefined) {
      return index === activeTabIndex;
    }
    
    // Check if we're on the main dashboard page
    const dashboardPath = `/dashboard/${role}`;
    if (pathname === dashboardPath) {
      const currentTab = searchParams.get('tab');
      
      // Handle tab-based navigation
      if (item.href.includes('?tab=')) {
        const tabParam = item.href.split('?tab=')[1];
        
        // First tab (browse-creators for brand, travel-plans for creator) is default
        if (index === 0) {
          return !currentTab || currentTab === tabParam;
        }
        
        return currentTab === tabParam;
      }
    }
    
    return false;
  };

  // Handle navigation clicks
  const handleNavClick = (item: NavigationItemWithTranslation, index: number): void => {
    const profileSetupPath = PROFILE_SETUP_PATHS[role];
    
    // Handle profile setup navigation
    if (item.href === profileSetupPath) {
      router.push(profileSetupPath);
      return;
    }
    
    // Use callback for tab switching if provided (faster for same-page navigation)
    if (onTabChange) {
      onTabChange(index);
    } else {
      // Fallback to router navigation
      router.push(item.href);
    }
  };

  // Handle edit profile navigation
  const handleEditProfile = (): void => {
    const profileSetupPath = PROFILE_SETUP_PATHS[role];
    router.push(profileSetupPath);
  };

  return {
    navigationItems,
    mobileNavigationItems,
    isNavItemActive,
    handleNavClick,
    handleEditProfile
  };
} 