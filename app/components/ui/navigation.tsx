'use client';

import { Fragment, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '@/app/hooks/useAuth';
import UserMenu from '@/app/components/ui/user-menu';
import { Button } from '@/app/components/ui/button';
import { LanguageSwitcher } from '@/app/components/ui/language-switcher';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavigationProps {
  hideNavLinks?: boolean;
  sticky?: boolean;
}

export default function Navigation({ 
  hideNavLinks = false, 
  sticky = false
}: NavigationProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    if (sticky) {
      const onScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, [sticky]);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    router.push('/auth/login');
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    router.push('/auth/register');
  };

  const navbarClass = sticky 
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-lg' : 'shadow-none'}`
    : '';

  const navbarStyle = sticky 
    ? { 
        backgroundColor: scrolled ? '#FDFCF9' : 'rgba(253, 252, 249, 0.8)',
        boxShadow: scrolled ? '0 4px 20px rgba(139, 0, 0, 0.1)' : 'none'
      }
    : { backgroundColor: 'rgba(253, 252, 249, 0.6)', backdropFilter: 'blur(8px)' };

  return (
    <>
      {/* Main Navigation */}
      <div className={navbarClass} style={navbarStyle}>
        {/* Subtle gradient overlay for seamless transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <span className="text-3xl font-serif font-bold text-red-burgundy group-hover:text-red-wine transition-all duration-300 transform group-hover:scale-105">
                    Lumo
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-burgundy group-hover:w-full transition-all duration-300"></div>
                </div>
                <span className="ml-3 text-sm font-medium text-subtext/80 hidden sm:block tracking-wide uppercase">
                  Travel Connect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {!hideNavLinks && (
              <nav className="hidden md:flex items-center space-x-12">
                <Link 
                  href="#how-it-works" 
                  className="relative text-sm font-medium text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5 px-3 py-2 rounded-lg transition-all duration-300 group"
                >
                  How It Works
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-burgundy group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link 
                  href="#about" 
                  className="relative text-sm font-medium text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5 px-3 py-2 rounded-lg transition-all duration-300 group"
                >
                  About
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-burgundy group-hover:w-full transition-all duration-300"></div>
                </Link>
                <Link 
                  href="/search" 
                  className="relative text-sm font-medium text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5 px-3 py-2 rounded-lg transition-all duration-300 group flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 group-hover:text-red-burgundy transition-colors duration-300" />
                  Search
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-burgundy group-hover:w-full transition-all duration-300"></div>
                </Link>
              </nav>
            )}
            
            {/* Language Switcher */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            {/* Auth Controls */}
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={handleLoginClick}
                    disabled={loginLoading}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      loginLoading 
                        ? 'bg-red-burgundy/10 text-red-burgundy cursor-not-allowed'
                        : 'text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5'
                    }`}
                  >
                    {loginLoading && <span className="loading loading-spinner loading-xs text-red-burgundy"></span>}
                    <span>Log in</span>
                  </button>
                  
                  <button
                    onClick={handleSignupClick}
                    disabled={signupLoading}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md ${
                      signupLoading
                        ? 'bg-red-burgundy/80 text-white border-red-burgundy cursor-not-allowed'
                        : 'bg-white text-red-burgundy hover:bg-red-burgundy hover:text-white border-red-burgundy'
                    }`}
                  >
                    {signupLoading && <span className="loading loading-spinner loading-xs text-white"></span>}
                    <span>Sign up</span>
                  </button>
                </>
              ) : (
                <UserMenu />
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-3 rounded-xl text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5 transition-all duration-300"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
            
      {/* Premium Mobile Menu */}
      <Transition appear show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-sm">
                    <div className="relative flex w-full max-w-sm flex-col bg-ivory shadow-2xl">
                      <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-border/20">
                        <Link href="/" className="flex items-center group">
                          <span className="text-2xl font-serif font-bold text-red-burgundy group-hover:text-red-wine transition-all duration-300">Lumo</span>
                        </Link>
                        <button
                          type="button"
                          className="rounded-xl p-2 text-subtext hover:text-text hover:bg-red-burgundy/10 transition-all duration-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="sr-only">Close menu</span>
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    
                      {!hideNavLinks && (
                        <div className="px-6 py-6 space-y-6">
                          <Link 
                            href="#how-it-works" 
                            className="block text-lg font-medium text-subtext hover:text-red-burgundy transition-all duration-300 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            How It Works
                          </Link>
                          <Link 
                            href="#about" 
                            className="block text-lg font-medium text-subtext hover:text-red-burgundy transition-all duration-300 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            About
                          </Link>
                          <Link 
                            href="/search" 
                            className="flex items-center gap-2 text-lg font-medium text-subtext hover:text-red-burgundy transition-all duration-300 py-2"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                            Search
                          </Link>
                          
                          {/* Mobile Language Switcher */}
                          <div className="py-2">
                            <LanguageSwitcher />
                          </div>
                          
                          {!user && (
                            <div className="pt-6 border-t border-border/20 space-y-4">
                              <button 
                                onClick={(e) => {
                                  handleLoginClick(e);
                                  setMobileMenuOpen(false);
                                }}
                                disabled={loginLoading}
                                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                                  loginLoading
                                    ? 'bg-red-burgundy/10 text-red-burgundy cursor-not-allowed'
                                    : 'text-subtext hover:text-red-burgundy hover:bg-red-burgundy/5'
                                }`}
                              >
                                {loginLoading && <span className="loading loading-spinner loading-xs text-red-burgundy"></span>}
                                <span>Log in</span>
                              </button>
                              
                              <button 
                                onClick={(e) => {
                                  handleSignupClick(e);
                                  setMobileMenuOpen(false);
                                }}
                                disabled={signupLoading}
                                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl transition-all duration-300 font-medium shadow-lg ${
                                  signupLoading
                                    ? 'bg-red-burgundy/80 text-white cursor-not-allowed'
                                    : 'bg-red-burgundy hover:bg-red-wine text-ivory'
                                }`}
                              >
                                {signupLoading && <span className="loading loading-spinner loading-xs text-white"></span>}
                                <span>Sign up</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
// review trigger
