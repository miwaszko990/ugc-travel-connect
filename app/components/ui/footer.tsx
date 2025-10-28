import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('root.footer');
  
  return (
    <footer className="w-full bg-gray-800 text-white py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium mt-12">
      <div className="flex items-center gap-2">
        <span>{t('copyright')}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <Link href="/privacy" className="hover:underline">{t('privacy')}</Link>
        <Link href="/terms" className="hover:underline">{t('terms')}</Link>
        <Link href="/contact" className="hover:underline">{t('contact')}</Link>
        <a 
          href="mailto:hello@lumocreators.com" 
          className="flex items-center gap-2 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Pomoc: hello@lumocreators.com
        </a>
      </div>
    </footer>
  );
}
