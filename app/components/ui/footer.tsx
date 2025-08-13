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
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="hover:underline">{t('privacyPolicy')}</Link>
        <Link href="/terms" className="hover:underline">{t('terms')}</Link>
        <Link href="/contact" className="hover:underline">{t('contact')}</Link>
      </div>
    </footer>
  );
}
