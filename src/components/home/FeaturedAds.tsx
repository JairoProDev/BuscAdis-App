'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import InteractiveCard from '@/components/ui/InteractiveCard'
import { VerifiedIcon, PremiumIcon } from '@/components/icons'
import { Adiso } from '@/types/marketplace'
import { categories } from '@/data/mockCategories'
import { useEffect, useState } from 'react'
import { ClassifiedadsService } from '@/services/classifiedads.service'
import AdisoCard from '@/components/AdisoCard'

interface FeaturedAdsProps {
  featured?: boolean
}

export default function FeaturedAds({ featured = false }: FeaturedAdsProps) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await ClassifiedadsService.getFeaturedClassifiedads();
        setAds(data);
      } catch (err) {
        console.error('Error fetching featured ads:', err);
        setError('No se pudieron cargar los anuncios destacados');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
      ))}
    </div>
  );

  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  
  if (ads.length === 0) return (
    <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
      No hay anuncios destacados disponibles
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <AdisoCard key={ad.id} adiso={ad} featured={featured} />
      ))}
    </div>
  );
} 