'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/app/hooks/useAuth';
import { registerSchema, RegisterFormValues } from '@/app/lib/validators';
import { UserRole } from '@/app/lib/types';
import { Fragment } from 'react';

// Define role type
interface RoleOption {
  id: UserRole;
  name: string;
}

const roles: RoleOption[] = [
  { id: 'creator', name: 'Creator' },
  { id: 'brand', name: 'Brand' }
];

export default function RegisterPage() {
  const { signUp, loading, error } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [connectInstagram, setConnectInstagram] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Update form value when role changes
  const handleRoleChange = (role: RoleOption) => {
    setSelectedRole(role);
    setValue('role', role.id);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const user = await signUp(data.email, data.password, data.role);
      
      if (user) {
        // If creator wants to connect Instagram, redirect to OAuth
        if (data.role === 'creator' && connectInstagram) {
          const instagramAuthUrl = generateInstagramAuthUrl(user.uid);
          window.location.href = instagramAuthUrl;
        } else {
          // Normal flow - redirect to profile setup
          const dashboardPath = data.role === 'creator' 
            ? '/dashboard/creator/profile-setup' 
            : '/dashboard/brand/profile-setup';
          window.location.href = dashboardPath;
        }
      }
    } catch (error) {
      // Error handled by useAuth
      console.error('Registration failed:', error);
    }
  };

  const generateInstagramAuthUrl = (userId: string) => {
    const baseUrl = 'https://api.instagram.com/oauth/authorize';
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
      redirect_uri: `${window.location.origin}/api/auth/instagram/callback`,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: userId, // Pass user ID in state parameter
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Check if the error indicates account already exists
  const isExistingAccount = error?.includes('already registered') || 
                           error?.includes('email-already-in-use') ||
                           error?.includes('already exists');

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className="bg-white rounded-[24px] shadow-lg p-8 max-w-[420px] w-full">
        <h2 className="text-2xl font-bold text-neutral mb-2 font-playfair">Welcome!</h2>
        <p className="text-gray-500 text-sm mb-5 font-inter">Join the UGC marketplace to connect with top brands</p>
        
        {error && (
          <div className={`alert mb-4 rounded-[12px] py-2 text-sm ${isExistingAccount ? 'alert-info' : 'alert-error'}`}>
            <div className="flex flex-col items-start">
            <span>{error}</span>
              {isExistingAccount && (
                <Link href="/auth/login" className="mt-2 text-red-burgundy underline font-semibold">
                  Click here to login instead
                </Link>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.email 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
              {...register('email')}
            />
            {errors.email && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.email.message}</span>
              </label>
            )}
          </div>
          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">Password</span>
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.password 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
              {...register('password')}
            />
            {errors.password && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.password.message}</span>
              </label>
            )}
          </div>
          
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className={`input h-12 px-4 w-full rounded-xl font-medium ${
                errors.confirmPassword 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.confirmPassword.message}</span>
              </label>
            )}
          </div>
          
          {/* Role selector using HeadlessUI */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-neutral font-medium text-sm">I am a</span>
            </label>
            <div className="relative">
              <Listbox value={selectedRole} onChange={handleRoleChange}>
                <div className="relative">
                  <Listbox.Button 
                    className={`relative h-12 w-full flex items-center justify-between px-4 rounded-xl font-medium ${
                      errors.role 
                        ? 'bg-white border-2 border-red-500' 
                        : 'bg-[#F4F4F5] border-0'
                    } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy text-left`}
                  >
                    {({ open }) => (
                      <>
                        <span className={`block truncate text-sm ${!selectedRole ? 'text-gray-400' : 'text-gray-700'}`}>
                          {selectedRole ? selectedRole.name : 'Select role'}
                        </span>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'transform rotate-180' : ''}`} aria-hidden="true" />
                      </>
                    )}
                  </Listbox.Button>
                  
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-md max-h-56 rounded-xl py-1 text-sm overflow-auto focus:outline-none ring-1 ring-black ring-opacity-5">
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role.id}
                          value={role}
                          className={({ active }) =>
                            `cursor-default select-none relative py-2 px-4 ${
                              active ? 'bg-red-burgundy/5 text-red-burgundy' : 'text-gray-700'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {role.name}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <input type="hidden" {...register('role')} />
            </div>
            {errors.role && (
              <label className="label py-0.5">
                <span className="label-text-alt text-error text-xs">{errors.role.message}</span>
              </label>
            )}
          </div>
          
          {/* Instagram Connection for Creators */}
          {selectedRole?.id === 'creator' && (
            <div className="form-control mt-4">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4 rounded-xl">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-pink-500" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                    </svg>
                    <h3 className="font-semibold text-gray-900">Connect Your Instagram</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically showcase your Instagram posts to potential brand collaborators
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={connectInstagram}
                      onChange={(e) => setConnectInstagram(e.target.checked)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Yes, connect my Instagram account after registration
                    </span>
                  </label>
                  {connectInstagram && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        ✨ After registration, you'll be redirected to Instagram to connect your account. Your latest posts will automatically appear on your creator profile!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            By registering, you agree to our <Link href="/terms" className="text-red-burgundy hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-red-burgundy hover:underline">Privacy Policy</Link>.
          </div>
          
          <div className="form-control mt-5 flex items-center justify-center">
            <button 
              type="submit" 
              className={`btn px-6 py-3 h-auto w-4/5 font-bold normal-case rounded-[12px] border-none shadow-sm transition-all ${
                loading 
                  ? 'bg-red-burgundy/90 cursor-not-allowed' 
                  : 'bg-red-burgundy hover:bg-red-burgundy/90'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2 text-white">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                  <span className="text-white">Creating account...</span>
                </div>
              ) : (
                <span className="text-white">Sign Up</span>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-5">
          <p className="text-neutral text-sm font-inter">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-red-burgundy font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}// review trigger
