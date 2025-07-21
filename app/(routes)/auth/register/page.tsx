'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
    await signUp(data.email, data.password, data.role);
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
