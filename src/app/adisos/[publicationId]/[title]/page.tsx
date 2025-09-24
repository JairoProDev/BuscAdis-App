'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import OldAdisoRedirect from '../page';

/**
 * Página que maneja rutas de adisos genéricos con título en la URL
 * (Redirige desde /adisos/[publicationId]/[title])
 */
export default function OldAdisoWithTitleRedirect() {
  const params = useParams();
  
  // Registrar un pageview para analíticas si es necesario
  useEffect(() => {
    // Si tienes algún código de analítica, puedes ejecutarlo aquí
    console.log('Pageview: antiguo adiso con título (redirigiendo)', params);
  }, [params]);

  // Reutilizar el componente de redirección principal de /adisos/[publicationId]
  return <OldAdisoRedirect />;
} 