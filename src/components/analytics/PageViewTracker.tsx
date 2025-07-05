'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useGoogleAnalytics();

  useEffect(() => {
    if (pathname) {
      // Construir la URL completa con parámetros de búsqueda
      const url = searchParams?.size 
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      
      trackPageView(url);
    }
  }, [pathname, searchParams, trackPageView]);

  return null; // Este componente no renderiza nada
} 