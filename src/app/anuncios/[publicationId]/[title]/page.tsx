'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import OldAnuncioRedirect from '../page';

/**
 * Página que maneja rutas de anuncios genéricos con título en la URL
 * (Redirige desde /anuncios/[publicationId]/[title])
 */
export default function OldAnuncioWithTitleRedirect() {
  const params = useParams();
  
  // Registrar un pageview para analíticas si es necesario
  useEffect(() => {
    // Si tienes algún código de analítica, puedes ejecutarlo aquí
    console.log('Pageview: antiguo anuncio con título (redirigiendo)', params);
  }, [params]);

  // Reutilizar el componente de redirección principal de /anuncios/[publicationId]
  return <OldAnuncioRedirect />;
} 