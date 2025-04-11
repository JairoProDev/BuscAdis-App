'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AnunciosRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir a la página principal de búsqueda
    router.replace('/buscar');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
} 