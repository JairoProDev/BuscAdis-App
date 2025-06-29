'use client';

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar media queries.
 * Permite detectar cambios en el tamaño de la pantalla y adaptar la interfaz.
 * 
 * @param query String con la media query a evaluar (ej: '(min-width: 768px)')
 * @returns Boolean que indica si la media query coincide
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
} 