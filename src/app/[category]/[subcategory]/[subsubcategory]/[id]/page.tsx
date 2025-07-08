'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage';

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [publication, setPublication] = useState(null);
  const [relatedPublications, setRelatedPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract parameters from the URL
  const id = params?.id as string;
  
  useEffect(() => {
    let isMounted = true;
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
        const res = await fetch(`/api/publications/${id}`);
        const data = await res.json();
        
        if (!data.publication) throw new Error('Publicación no encontrada');
        if (isMounted) setPublication(data.publication);
        
        // Fetch related publications
        const relatedRes = await fetch(`/api/publications/related?category=${data.publication.categorySlug || categorySlugParam}&excludeId=${id}&limit=6`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (isMounted) setRelatedPublications(relatedData.publications || []);
        }
        
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError('No se pudo encontrar la publicación solicitada.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublication();
    return () => { isMounted = false; };
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !publication) {
    return (
      <div className="container py-16 min-h-screen">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600">{error || 'No se encontró la publicación.'}</p>
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
  
  return <DedicatedPublicationPage publication={publication} relatedPublications={relatedPublications} />;
} 