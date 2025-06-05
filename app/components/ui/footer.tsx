import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium mt-12">
      <div className="flex items-center gap-2">
        <span>© 2025 UGC Travel Connect. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <Link href="/contact" className="hover:underline">Contact Us</Link>
      </div>
    </footer>
  );
} 