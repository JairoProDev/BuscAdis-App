'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Immediately redirect to the search page - which is our new homepage
    router.replace('/buscar');
  }, [router]);
  
  // Return empty div while redirecting
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="animate-pulse text-white text-xl">Redirigiendo...</div>
    </div>
  );
}