import ProfileSidebar from '@/app/components/shared/sidebar/ProfileSidebar';
import type { BaseProfile } from '@/app/components/shared/sidebar/types';

interface BrandProfile extends BaseProfile {
  brandName?: string;
  instagramHandle?: string;
  website?: string;
  profileImageUrl?: string;
}

interface BrandSidebarProps {
  profile: BrandProfile | null;
  isMobile?: boolean;
  onTabChange?: (tabIndex: number) => void;
  activeTabIndex?: number;
}

export default function BrandSidebar(props: BrandSidebarProps) {
  return <ProfileSidebar {...props} role="brand" />;
} 