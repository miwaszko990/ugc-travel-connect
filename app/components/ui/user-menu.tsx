'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '@/app/hooks/auth';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  // Get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (user.role === 'creator') {
      return '/dashboard/creator';
    } else if (user.role === 'brand') {
      return '/dashboard/brand';
    }
    return '/dashboard';
  };

  // Get the correct profile setup URL based on user role
  const getProfileUrl = () => {
    if (user.role === 'creator') {
      return '/dashboard/creator/profile-setup';
    } else if (user.role === 'brand') {
      return '/dashboard/brand/profile-setup';
    }
    return '/profile';
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex rounded-full bg-white text-sm outline-none ring-2 ring-red-burgundy/20 focus:ring-red-burgundy focus:ring-offset-2 transition-all hover:ring-red-burgundy/40">
        <span className="sr-only">Open user menu</span>
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={user.profileImageUrl || "/placeholder-profile.jpg"}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 top-12 w-56 origin-top-right rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 border border-red-burgundy/10">
          {/* Email section */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <p className="text-gray-500 text-sm">Signed in as</p>
            <p className="text-sm font-medium truncate text-gray-900">{user.email}</p>
          </div>
          
          {/* Menu items */}
          <div className="space-y-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={getDashboardUrl()}
                  className={`${
                    active ? 'bg-red-burgundy/10 text-red-burgundy' : 'text-gray-700'
                  } flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${active ? 'text-red-burgundy' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={getProfileUrl()}
                  className={`${
                    active ? 'bg-red-burgundy/10 text-red-burgundy' : 'text-gray-700'
                  } flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${active ? 'text-red-burgundy' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Profile
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/settings"
                  className={`${
                    active ? 'bg-red-burgundy/10 text-red-burgundy' : 'text-gray-700'
                  } flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${active ? 'text-red-burgundy' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </Link>
              )}
            </Menu.Item>
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      console.log('Logging out...');
                      logout();
                    }}
                    className={`${
                      active ? 'bg-red-burgundy/10 text-red-burgundy' : 'text-gray-700'
                    } flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-colors duration-200`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${active ? 'text-red-burgundy' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
// review trigger
