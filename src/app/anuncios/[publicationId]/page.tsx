'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ShareIcon,
  FlagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { slugify, generateSeoUrl } from '@/utils/url';

interface Publication {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    country?: string;
  };
  contact: {
    whatsapp?: string;
    email?: string;
    phone?: string;
  };
  created_at: string;
  views?: number;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
}

export default function PublicationDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract publication ID from the URL
  const publicationId = params.publicationId as string;
  const id = publicationId.split('-')[0]; // Extract just the ID portion
  
  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setLoading(true);
        
        // Fetch publication data to get category
        const publication = await PublicationsService.getPublicationById(id);
        
        if (!publication) {
          throw new Error('Publicación no encontrada');
        }
        
        // Generate the correct URL
        const correctUrl = generateSeoUrl(
          publication.id,
          publication.title,
          publication.categorySlug || 'general',
          publication.subcategory,
          publication.subsubcategory
        );
        
        // Redirect to the correct URL
        router.replace(correctUrl);
      } catch (err) {
        console.error('Error en la redirección:', err);
        setError('No se pudo encontrar la publicación solicitada.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAndRedirect();
    }
  }, [id, router]);
  
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
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
} 