import ProfileSidebar from '@/app/components/shared/sidebar/ProfileSidebar';
import type { BaseProfile } from '@/app/components/shared/sidebar/types';

interface CreatorProfile extends BaseProfile {
  displayName?: string;
  fullName?: string;
  instagramHandle?: string;
  website?: string;
  profileImageUrl?: string;
}

interface CreatorSidebarProps {
  profile: CreatorProfile | null;
  isMobile?: boolean;
  onTabChange?: (tabIndex: number) => void;
  activeTabIndex?: number;
}

export default function CreatorSidebar(props: CreatorSidebarProps) {
  return <ProfileSidebar {...props} role="creator" />;
} 