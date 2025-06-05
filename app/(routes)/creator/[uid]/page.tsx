import { Suspense } from 'react';
import ClientCreatorProfile from './client-page';

// Server component that passes params directly
export default function CreatorProfilePage({ params }: { params: { uid: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientCreatorProfile uid={params.uid} />
    </Suspense>
  );
} 