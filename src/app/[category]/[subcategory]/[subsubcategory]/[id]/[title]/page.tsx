'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateSeoUrl } from '@/utils/url'; // Importar generateSeoUrl

// Importar los componentes de detalle específicos de cada categoría
// (Commented out due to component structure changes)
// import InmuebleDetailPageContent from '@/app/inmuebles/[subcategory]/[subsubcategory]/[id]/page';
// import VehiculoDetailPageContent from '@/app/vehiculos/[subcategory]/[subsubcategory]/[id]/page';
// import EmpleoDetailPageContent from '@/app/empleos/[subcategory]/[subsubcategory]/[id]/page';
// Importa otros componentes de detalle si existen...

/**
 * Página de detalle de publicación genérica con título en la URL
 * Esta página reutiliza el componente de detalle genérico
 * pero permite tener una URL más amigable para SEO con el título incluido
 */
export default function PublicationDetailWithTitlePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicationData, setPublicationData] = useState<any>(null);
  
  // Extraer parámetros de la URL
  const categorySlugParam = params?.category as string;
  const subcategorySlugParam = params?.subcategory as string;
  const subsubcategorySlugParam = params?.subsubcategory as string;
  const id = params?.id as string;
  const titleSlugParam = params?.title as string;
  
  useEffect(() => {
    const fetchAndValidatePublication = async () => {
      if (!id) {
        setError('ID de publicación no válido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch publication data
        const publication = await PublicationsService.getPublicationById(id);
        
        if (!publication) {
          throw new Error('Publicación no encontrada');
        }
        
        // Validar que la URL actual coincida con la URL canónica (incluyendo el título)
        const publicationAny = publication as any;
        const correctUrl = generateSeoUrl(
          publicationAny._id || publicationAny.id,
          publicationAny.title,
          undefined, // publicationSlug
          publicationAny.categorySlug || publicationAny.category || 'general',
          publicationAny.subcategory,
          publicationAny.subsubcategory,
          true // Incluir el título
        );

        // Current path from params, including the title
        let currentPath = `/${categorySlugParam}`;
        if (subcategorySlugParam) currentPath += `/${subcategorySlugParam}`;
        if (subsubcategorySlugParam) currentPath += `/${subsubcategorySlugParam}`;
        currentPath += `/${id}/${titleSlugParam}`;

        const normalizedCurrentPath = currentPath.toLowerCase();
        const normalizedCorrectUrl = correctUrl.toLowerCase();

        if (normalizedCurrentPath !== normalizedCorrectUrl) {
          console.log(`Redirecting from ${normalizedCurrentPath} to correct title path: ${correctUrl}`);
          router.replace(correctUrl); // Redirect to the canonical URL with title
          return; // Stop further processing
        } else {
          // Si la URL es correcta, guardamos los datos y detenemos la carga
          setPublicationData(publication);
          setLoading(false);
        }
        
      } catch (err) {
        console.error('Error al cargar la publicación (con título):', err);
        setError('No se pudo encontrar la publicación solicitada.');
        setLoading(false);
      }
    };
    
    fetchAndValidatePublication();
  }, [
    categorySlugParam, 
    subcategorySlugParam, 
    subsubcategorySlugParam, 
    id, 
    titleSlugParam, 
    router
  ]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !publicationData) {
    return (
      <div className="container py-16 min-h-screen">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600">{error || 'No se encontraron datos de la publicación.'}</p>
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

  // For now, render a simple fallback since the component imports are problematic
  return (
    <div className="container py-16">
      <h1>{publicationData.title}</h1>
      <p>Categoría: {publicationData.categorySlug || publicationData.category || 'general'}</p>
      <pre>{JSON.stringify(publicationData, null, 2)}</pre>
    </div>
  );
} 