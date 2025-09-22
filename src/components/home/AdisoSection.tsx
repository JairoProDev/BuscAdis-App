'use client'

import { CategoryId } from '@/types/marketplace'
import { useEffect, useState } from 'react'
import { PublicationsService, Publication } from '@/services/publications.service'
import AdisoCard from '@/components/AdisoCard'
import ErrorMessage from '@/components/ui/ErrorMessage'

interface AdisoSectionProps {
  type: CategoryId | 'featured'
  title: string
  featured?: boolean
}

export default function AdisoSection({ 
  type, 
  title, 
  featured = false 
}: AdisoSectionProps) {
  const [adisos, setAdisos] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para adaptar Publication a AdisoData
  const adaptPublicationToAdiso = (publication: Publication) => ({
    id: publication._id,
    title: publication.title,
    price: publication.value,
    location: publication.location,
    image: publication.images?.[0],
    is_premium: publication.premium,
    is_verified: false, // No disponible en Publication
    rating: 0, // No disponible en Publication
    category: publication.categorySlug,
    categorySlug: publication.categorySlug
  });

  useEffect(() => {
    const fetchAdisos = async () => {
      try {
        const data = await PublicationsService.getPublications({
          category: type === 'featured' ? undefined : type.toLowerCase(),
          limit: 6,
          premium: type === 'featured'
        });
        
        setAdisos(data.publications);
      } catch (err) {
        console.error(`Error fetching ${type} publications:`, err);
        setError(`No se pudieron cargar los adisos de ${title}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAdisos();
  }, [type, title, featured]);

  if (loading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={`skeleton-${i}-${Math.random().toString(36).substr(2, 9)}`} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (adisos.length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
          No hay adisos disponibles en esta categoría
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adisos.map((adiso) => (
          <AdisoCard key={adiso._id} adiso={adaptPublicationToAdiso(adiso)} featured={featured} />
        ))}
      </div>
    </div>
  )
} 