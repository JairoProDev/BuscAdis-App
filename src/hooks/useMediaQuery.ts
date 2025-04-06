import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar media queries.
 * Permite detectar cambios en el tamaño de la pantalla y adaptar la interfaz.
 * 
 * @param query String con la media query a evaluar (ej: '(min-width: 768px)')
 * @returns Boolean que indica si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  // Por defecto en SSR, asumimos false
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificamos que estemos en el navegador
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Inicializamos el estado con el valor actual
      setMatches(media.matches);

      // Función para actualizar el estado cuando cambia la media query
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Añadimos el listener
      // Usamos la API moderna si está disponible
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        // Fallback para navegadores más antiguos
        media.addListener(listener);
      }

      // Limpieza
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          // Fallback para navegadores más antiguos
          media.removeListener(listener);
        }
      };
    }
    
    // Si no estamos en el navegador, no hacemos nada
    return undefined;
  }, [query]);

  return matches;
}

export default useMediaQuery; 