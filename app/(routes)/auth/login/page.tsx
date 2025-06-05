'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/app/hooks/useAuth';
import { loginSchema, LoginFormValues } from '@/app/lib/validators';

export default function LoginPage() {
  const { signIn, loading, error } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    await signIn(data.email, data.password);
  };

  // Check if error message indicates user needs to register
  const needsRegistration = error?.includes('register') || 
                            error?.includes('create a profile') || 
                            error?.includes('Account not found');

  // Check if error is related to credentials
  const isCredentialError = error?.includes('Invalid email or password') ||
                           error?.includes('wrong password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className="bg-white rounded-[24px] shadow-lg p-8 max-w-[420px] w-full">
        <h2 className="text-2xl font-bold text-neutral mb-2 font-playfair">Welcome back!</h2>
        <p className="text-gray-500 text-sm mb-5 font-inter">Log in to access your UGC marketplace account</p>
        
        {error && (
          <div className={`alert mb-4 rounded-[12px] py-2 text-sm ${needsRegistration ? 'alert-info' : 'alert-error'}`}>
            <div className="flex flex-col items-start">
            <span>{error}</span>
              {needsRegistration && (
                <Link href="/auth/register" className="mt-2 text-red-burgundy underline font-semibold">
                  Click here to register now
                </Link>
              )}
              {isCredentialError && (
                <Link href="/auth/forgot-password" className="mt-2 text-red-burgundy underline font-semibold">
                  Forgot your password?
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
              placeholder="Enter your password"
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
            <div className="flex justify-end mt-1">
              <Link href="/auth/forgot-password" className="text-xs text-red-burgundy hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <div className="form-control mt-5 flex items-center justify-center">
            <button 
              type="submit" 
              className={`btn px-6 py-3 h-auto w-4/5 text-white font-bold normal-case rounded-[12px] border-none shadow-sm transition-all ${
                loading 
                  ? 'bg-red-burgundy/80 cursor-not-allowed' 
                  : 'bg-red-burgundy hover:bg-red-burgundy/90'
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm text-white"></span>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-5">
          <p className="text-neutral text-sm font-inter">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-red-burgundy font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}