import { 
  BrandNavigationItem, 
  CreatorNavigationItem, 
  BrandMobileNavigationItem, 
  CreatorMobileNavigationItem 
} from '@/app/lib/navigation-config';

// Base profile interface
export interface BaseProfile {
  brandName?: string;
  instagramHandle?: string;
  website?: string;
  profileImageUrl?: string;
  displayName?: string; // For creators
  fullName?: string; // For creators
}

// Navigation item with translation support
export interface NavigationItemWithTranslation {
  key: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  translationNamespace: string;
  index: number;
  name: string; // Translated name
}

// Sidebar configuration
export interface SidebarConfig {
  role: 'brand' | 'creator';
  navigationItems: readonly (BrandNavigationItem | CreatorNavigationItem)[];
  mobileNavigationItems: readonly (BrandMobileNavigationItem | CreatorMobileNavigationItem)[];
  profileSetupPath: string;
  defaultProfileImage: string;
  translationNamespace: string;
}

// Base sidebar props
export interface BaseSidebarProps {
  profile: BaseProfile | null;
  isMobile?: boolean;
  onTabChange?: (tabIndex: number) => void;
  activeTabIndex?: number;
  role: 'brand' | 'creator';
}

// Navigation hook return type
export interface UseNavigationReturn {
  navigationItems: NavigationItemWithTranslation[];
  mobileNavigationItems: NavigationItemWithTranslation[];
  isNavItemActive: (item: NavigationItemWithTranslation, index: number) => boolean;
  handleNavClick: (item: NavigationItemWithTranslation, index: number) => void;
  handleEditProfile: () => void;
}

// Collapse/expand state
export interface SidebarState {
  isCollapsed: boolean;
  activeTooltip: string | null;
}

// Profile section props
export interface ProfileSectionProps {
  profile: BaseProfile | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  defaultProfileImage: string;
  translationNamespace: string;
}

// Navigation menu props
export interface NavigationMenuProps {
  items: NavigationItemWithTranslation[];
  isCollapsed: boolean;
  activeTooltip: string | null;
  onTooltipChange: (tooltip: string | null) => void;
  onItemClick: (item: NavigationItemWithTranslation, index: number) => void;
  isItemActive: (item: NavigationItemWithTranslation, index: number) => boolean;
}

// Mobile navigation props
export interface MobileNavigationProps {
  profile: BaseProfile | null;
  items: NavigationItemWithTranslation[];
  onItemClick: (item: NavigationItemWithTranslation, index: number) => void;
  isItemActive: (item: NavigationItemWithTranslation, index: number) => boolean;
  defaultProfileImage: string;
  translationNamespace: string;
}

// Tooltip props
export interface TooltipProps {
  content: string;
  visible: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

// Navigation button props
export interface NavigationButtonProps {
  item: NavigationItemWithTranslation;
  index: number;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (item: NavigationItemWithTranslation, index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
} 