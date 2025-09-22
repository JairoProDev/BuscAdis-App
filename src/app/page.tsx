'use client';

import React, { useState, useEffect } from 'react';
import { PublicationDetailProvider } from '@/hooks/usePublicationDetail';
import { PublicationData } from '@/types/publication';
import HomePageContent from '@/components/home/HomePageContent';

export default function HomePage() {
  const [allPublications, setAllPublications] = useState<PublicationData[]>([]);

  // Cargar algunas publicaciones para el contexto
  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await fetch('/api/publications?limit=50');
        const data = await response.json();
        if (data.publications) {
          const publications = data.publications.map((pub: any) => ({
            id: pub._id || pub.id,
            sequentialId: pub.sequentialId,
            title: pub.title || 'Sin título',
            description: pub.description || '',
            categorySlug: pub.categorySlug || 'general',
            subcategorySlug: null,
            subSubcategorySlug: null,
            transactionType: 'venta',
            value: pub.price || pub.amount || 0,
            currency: 'PEN',
            valueType: 'fixed',
            size: 0,
            location: {
              district: pub.location?.district || '',
              province: pub.location?.province || '',
              city: pub.location?.city || 'Cusco',
              country: 'Perú'
            },
            images: pub.images || ['/images/placeholder-image.jpg'],
            whatsapp: pub.whatsapp || '51987654321',
            createdAt: pub.createdAt || new Date().toISOString(),
            views: pub.views || 0,
            featured: pub.featured || false,
            premium: pub.premium || false,
          }));
          setAllPublications(publications);
        }
      } catch (error) {
        console.error('Error loading publications:', error);
      }
    };

    loadPublications();
  }, []);

  return (
    <PublicationDetailProvider>
      <HomePageContent allPublications={allPublications} />
    </PublicationDetailProvider>
  );
}