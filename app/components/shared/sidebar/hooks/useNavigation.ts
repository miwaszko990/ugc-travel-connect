import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
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
  const locale = useLocale();

  const withLocale = (path: string): string => {
    if (path === '/') return `/${locale}`;
    return `/${locale}${path}`;
  };

  // Get navigation configuration based on role - always include home icon
  const navigationConfig = useMemo(() => {
    const config = getNavigationConfig(role, false);
    return config;
  }, [role]);
  
  const mobileNavigationConfig = useMemo(() => {
    const config = getNavigationConfig(role, true);
    return config;
  }, [role]);

  // Transform navigation items with translations and adjust indices
  const navigationItems: NavigationItemWithTranslation[] = useMemo(() => 
    navigationConfig.map((item, index) => ({
      ...item,
      name: t(item.key),
      // Adjust index for dashboard tabs (subtract 1 to account for home icon at index 0)
      adjustedIndex: pathname.includes('/dashboard/') && onTabChange && item.key !== 'home' 
        ? item.index - 1 
        : item.index
    })),
    [navigationConfig, t, pathname, onTabChange]
  );

  const mobileNavigationItems: NavigationItemWithTranslation[] = useMemo(() => 
    mobileNavigationConfig.map((item, index) => ({
      ...item,
      name: t(item.key),
      // Adjust index for dashboard tabs (subtract 1 to account for home icon at index 0)
      adjustedIndex: pathname.includes('/dashboard/') && onTabChange && item.key !== 'home' 
        ? item.index - 1 
        : item.index
    })),
    [mobileNavigationConfig, t, pathname, onTabChange]
  );

  // Helper function to check if a nav item is active
  const isNavItemActive = (item: NavigationItemWithTranslation, index: number): boolean => {
    const profileSetupPath = withLocale(PROFILE_SETUP_PATHS[role]);
    const localizedPathname = pathname || '/';

    // Homepage
    if (item.href === '/') {
      return localizedPathname === `/${locale}`;
    }

    // Profile setup
    if (withLocale(item.href) === profileSetupPath) {
      return localizedPathname === profileSetupPath;
    }

    // Check main dashboard page
    const dashboardPath = withLocale(`/dashboard/${role}`);
    if (localizedPathname.startsWith(dashboardPath)) {
      const currentTab = searchParams.get('tab');
      if (item.href.includes('?tab=')) {
        const tabParam = item.href.split('?tab=')[1];
        // Use adjustedIndex for comparison when in dashboard context
        const itemIndex = 'adjustedIndex' in item ? item.adjustedIndex : index;
        
        // First tab (browse-creators) should be active when no tab param or when explicitly set
        if (itemIndex === 0) {
          return !currentTab || currentTab === tabParam;
        }
        return currentTab === tabParam;
      }
    }

    return false;
  };

  // Handle navigation clicks
  const handleNavClick = (item: NavigationItemWithTranslation, index: number): void => {
    const profileSetupPath = withLocale(PROFILE_SETUP_PATHS[role]);

    // Home navigation - always navigate to home page
    if (item.href === '/' || item.key === 'home') {
      router.push(withLocale('/'));
      return;
    }

    // Profile setup navigation
    if (withLocale(item.href) === profileSetupPath || item.href === PROFILE_SETUP_PATHS[role]) {
      router.push(profileSetupPath);
      return;
    }

    // Dashboard tab navigation
    if (onTabChange && pathname.includes('/dashboard/')) {
      // Use adjustedIndex if available, otherwise use the index parameter
      const tabIndex = 'adjustedIndex' in item ? item.adjustedIndex : index;
      onTabChange(tabIndex);
    } else {
      // Direct navigation for non-dashboard pages
      router.push(withLocale(item.href));
    }
  };

  const handleEditProfile = (): void => {
    router.push(withLocale(PROFILE_SETUP_PATHS[role]));
  };

  return {
    navigationItems,
    mobileNavigationItems,
    isNavItemActive,
    handleNavClick,
    handleEditProfile
  };
} 