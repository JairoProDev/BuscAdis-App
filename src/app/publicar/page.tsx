// src/app/publicar/page.tsx (o donde esté tu componente principal)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicarRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new publish page
    router.replace('/publish');
  }, [router]);

  // Simple loading state while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Redireccionando...</p>
      </div>
    </div>
  );
}