'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function MessageThread({ params }: { params: { creatorId: string } }) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Messages Page</h1>
        <p className="mb-4">Creator ID: {params.creatorId}</p>
        <p className="mb-4">This page will be rebuilt from scratch.</p>
        <button 
          onClick={() => router.push(`/${locale}/dashboard/brand`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
        </div>
    </div>
  );
} // review trigger
