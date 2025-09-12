import { Suspense } from 'react';
import ClientCreatorProfile from './client-page';

// Server component that passes params directly
export default async function CreatorProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientCreatorProfile uid={uid} />
    </Suspense>
  );
} // review trigger
