'use client'

import React from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { PublicationsService, Publication } from '@/services/publications.service'
import AdisoCard from '@/components/AdisoCard'

interface FeaturedAdsProps {
  featured?: boolean
}

export default function FeaturedAds({ featured = false }: FeaturedAdsProps) {
  const [ads, setAds] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await PublicationsService.getPremiumPublications();
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
        <AdisoCard key={ad._id} adiso={{
          id: ad._id,
          title: ad.title,
          price: ad.value,
          location: ad.location,
          image: ad.images?.[0],
          is_premium: ad.premium,
          is_verified: false,
          rating: 0,
          category: ad.categorySlug,
          categorySlug: ad.categorySlug
        }} featured={featured} />
      ))}
    </div>
  );
} 