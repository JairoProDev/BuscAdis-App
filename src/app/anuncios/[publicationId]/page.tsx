'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import { generateSeoUrl } from '@/utils/url';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Renombrado para claridad, maneja redirección desde /adisos/...
export default function OldAdisoRedirect() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract publication ID from the URL
  const publicationId = params?.publicationId as string;
  // Extraer ID numérico si es necesario (depende de tu formato de ID)
  const id = publicationId ? publicationId.split('-')[0] : null; 
  
  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!id) {
        setError('ID de publicación no válido en la URL antigua.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch publication data to get category, etc.
        const publication = await PublicationsService.getPublicationById(id);
        
        if (!publication) {
          throw new Error('Publicación no encontrada');
        }
        
        // Generate the new, correct URL
        const correctUrl = generateSeoUrl(
          publication._id?.toString() || id,
          publication.title,
          undefined, // publicationSlug
          publication.categorySlug || 'general',
          publication.subcategorySlug || '',
          publication.subSubcategorySlug || ''
        );
        
        console.log(`Redirecting legacy /adisos/${publicationId} to: ${correctUrl}`);
        
        // Redirect permanently (301) to the new URL
        router.replace(correctUrl); 
        // No establecer setLoading(false) aquí, la redirección se encarga.
        
      } catch (err) {
        console.error('Error en la redirección desde /adisos:', err);
        setError('No se pudo encontrar la publicación solicitada o redirigir.');
        setLoading(false);
      }
    };

    fetchAndRedirect();

  }, [id, publicationId, router]); // Añadir publicationId a las dependencias
  
  // Mostrar estado de carga o error mientras se procesa la redirección
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 min-h-screen">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error de Redirección</h1>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => router.push('/buscar')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Ir al buscador
          </button>
        </div>
      </div>
    );
  }

  // En teoría, nunca se debería llegar aquí si la redirección funciona
  return null;
} 