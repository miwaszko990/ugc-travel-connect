'use client';

import Image from 'next/image';
import { DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface ProfileCardProps {
  profile: DocumentData | null;
  isMobile?: boolean;
}

export default function ProfileCard({ profile, isMobile = false }: ProfileCardProps) {
  const router = useRouter();
  const locale = useLocale();
  
  if (!profile) return null;

  const defaultLogo = "/images/default-brand-logo.jpg"; // Use a local default image
  const logoImageUrl = profile?.logoImageUrl || defaultLogo;
  const brandName = profile.brandName || profile.companyName || 'Your Brand';
  const location = profile.location || 'Location not specified';
  
  const handleEditProfile = () => {
    router.push('/dashboard/profile-setup');
  };
  
  // If it's a mobile version, render a simplified card
  if (isMobile) {
    return (
      <div className="lg:hidden w-full bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image 
                src={logoImageUrl}
                alt={profile?.brandName || "Brand Logo"}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{brandName}</h2>
            <p className="text-gray-500 text-sm">{location}</p>
          </div>
        </div>
        <button 
          className="btn btn-outline btn-primary btn-sm"
          onClick={handleEditProfile}
        >
          Edit
        </button>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="hidden lg:block w-full max-w-xs bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
          <Image 
            src={logoImageUrl}
            alt={profile?.brandName || "Brand Logo"}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold mb-1">{brandName}</h2>
        <p className="text-gray-500 mb-4">{location}</p>
        
        <button 
          className="btn btn-outline btn-primary w-full"
          onClick={() => router.push(`/${locale}/dashboard/profile-setup`)}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
// review trigger
