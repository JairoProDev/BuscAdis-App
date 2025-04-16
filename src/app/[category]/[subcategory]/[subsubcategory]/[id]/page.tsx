'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateSeoUrl } from '@/utils/url';

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract parameters from the URL
  const categorySlugParam = params.category as string;
  const subcategorySlugParam = params.subcategory as string;
  const subsubcategorySlugParam = params.subsubcategory as string;
  const id = params.id as string;
  
  useEffect(() => {
    const fetchPublication = async () => {
      if (!id) {
        setError('ID de publicación no válido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch publication data to validate it
        const publication = await PublicationsService.getPublicationById(id);
        
        if (!publication) {
          throw new Error('Publicación no encontrada');
        }
        
        // Check if this is the correct URL structure for this publication
        const correctUrl = generateSeoUrl(
          publication.id,
          publication.title,
          publication.categorySlug || publication.category || 'general',
          publication.subcategory,
          publication.subsubcategory,
          false // Sin título para la página principal
        );
        
        // Current path from params
        let currentPath = `/${categorySlugParam}`;
        if (subcategorySlugParam) currentPath += `/${subcategorySlugParam}`;
        if (subsubcategorySlugParam) currentPath += `/${subsubcategorySlugParam}`;
        currentPath += `/${id}`;

        // Normalize paths before comparing
        const normalizedCurrentPath = currentPath.toLowerCase();
        const normalizedCorrectUrl = correctUrl.toLowerCase();

        if (normalizedCurrentPath !== normalizedCorrectUrl) {
          console.log(`Redirecting from ${normalizedCurrentPath} to correct path: ${correctUrl}`);
          router.replace(correctUrl); // Redirect to the canonical URL without title
          return; // Stop further processing after redirection
        } else {
          // Si la URL es correcta, simplemente detenemos la carga
          setLoading(false);
        }
        
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError('No se pudo encontrar la publicación solicitada.');
        setLoading(false);
      }
    };
    
    fetchPublication();
  }, [categorySlugParam, subcategorySlugParam, subsubcategorySlugParam, id, router]);
  
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
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
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
  
  // Si la URL es correcta y no hay error, se debe renderizar el contenido
  // Aquí es donde deberías cargar el componente de detalle real
  // Por ahora, solo devolvemos null o un placeholder para indicar que la carga se detuvo.
  return (
    <div className="container py-16 min-h-screen">
      <h1>Página de Detalle de Publicación (Contenido a implementar)</h1>
      <p>Categoría: {categorySlugParam}</p>
      <p>Subcategoría: {subcategorySlugParam}</p>
      <p>Subsubcategoría: {subsubcategorySlugParam}</p>
      <p>ID: {id}</p>
    </div>
  );
} 