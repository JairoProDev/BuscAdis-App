'use client'

import { motion } from 'framer-motion'
import { CategoryId, Adiso } from '@/types/marketplace'
import FeaturedAds from './FeaturedAds'
import { useEffect, useState } from 'react'
import { ClassifiedadsService } from '@/services/classifiedads.service'
import AdisoCard from '@/components/AdisoCard'
import LoadingState from '@/components/ui/LoadingState'
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
  const [adisos, setAdisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdisos = async () => {
      try {
        const data = await ClassifiedadsService.getClassifiedads({
          category: type === 'featured' ? undefined : type.toLowerCase(),
          limit: 6,
          featured: type === 'featured'
        });
        
        setAdisos(data.classifiedads);
      } catch (err) {
        console.error(`Error fetching ${type} classifiedads:`, err);
        setError(`No se pudieron cargar los anuncios de ${title}`);
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
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
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
          No hay anuncios disponibles en esta categoría
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adisos.map((adiso) => (
          <AdisoCard key={adiso.id} adiso={adiso} featured={featured} />
        ))}
      </div>
    </div>
  )
} 