'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage';
import PublicationSEO from '@/components/seo/PublicationSEO';
import ErrorSEO from '@/components/seo/ErrorSEO';
import { PublicationData } from '@/types/publication';

export default function PublicationDetailWithTitlePage() {
  const params = useParams();
  const router = useRouter();
  const [publicationData, setPublicationData] = useState<PublicationData | null>(null);
  const [relatedPublications, setRelatedPublications] = useState<PublicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');

  // Extract parameters from the URL
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
        const res = await fetch(`/api/publications/${id}`);
        const data = await res.json();

        if (!data.publication) {
          throw new Error('Publicación no encontrada');
        }

        const publicationData = data.publication;

        // Generate canonical URL for SEO
        const correctUrl = `/${publicationData.categorySlug}/${publicationData.subcategorySlug || 'general'}/${publicationData.subSubcategorySlug || 'general'}/${publicationData.id}/${encodeURIComponent(publicationData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`;
        setCanonicalUrl(correctUrl);

        // URL validation and redirect for SEO
        let currentPath = `/${categorySlugParam}`;
        if (subcategorySlugParam && subcategorySlugParam !== 'general') currentPath += `/${subcategorySlugParam}`;
        if (subsubcategorySlugParam && subsubcategorySlugParam !== 'general') currentPath += `/${subsubcategorySlugParam}`;
        currentPath += `/${id}/${titleSlugParam}`;

        const normalizedCurrentPath = currentPath.toLowerCase();
        const normalizedCorrectUrl = correctUrl.toLowerCase();

        if (normalizedCurrentPath !== normalizedCorrectUrl) {
          console.log(`Redirecting from ${normalizedCurrentPath} to correct SEO URL: ${correctUrl}`);
          router.replace(correctUrl);
          return;
        }

        // Set publication data
        setPublicationData(publicationData);

        // Fetch related publications for better SEO and UX
        try {
          const response = await fetch(`/api/publications/related?category=${publicationData.categorySlug}&id=${id}&limit=4`);
          if (response.ok) {
            const relatedData = await response.json();
            if (relatedData.publications) {
              setRelatedPublications(relatedData.publications.map((pub: any) => ({
                id: pub.id || pub._id,
                title: pub.title,
                description: pub.description,
                categorySlug: pub.categorySlug || pub.category,
                subcategorySlug: pub.subcategorySlug,
                subSubcategorySlug: pub.subSubcategorySlug,
                transactionType: 'venta',
                value: pub.price || pub.amount || 0,
                currency: pub.currency || 'PEN',
                valueType: 'fixed',
                size: 0,
                location: pub.location,
                images: pub.images || [],
                whatsapp: pub.whatsapp || '51987654321',
                createdAt: pub.createdAt,
                views: pub.views || 0,
                featured: pub.featured || false,
                premium: pub.premium || false,
              })));
            }
          }
        } catch {
          console.warn('Could not fetch related publications');
        }

        setLoading(false);
        
      } catch (err) {
        console.error('Error al cargar la publicación:', err);
        setError('No se pudo encontrar la publicación solicitada.');
        setLoading(false);
      }
    };
    
    fetchAndValidatePublication();
  }, [categorySlugParam, subcategorySlugParam, subsubcategorySlugParam, id, titleSlugParam, router]);

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (publicationData?.whatsapp) {
      const message = `Hola, estoy interesado en: ${publicationData.title}`;
      const whatsappUrl = `https://wa.me/${publicationData.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && publicationData) {
      try {
        await navigator.share({
          title: publicationData.title,
          text: publicationData.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else if (publicationData) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Handle favorite
  const handleFavorite = () => {
    // TODO: Implement favorite functionality
    console.log('Favorite toggled');
  };



  if (loading) {
    return (
      <>
        <Head>
          <title>Cargando... | BuscAdis</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }
  
  if (error || !publicationData) {
    return (
      <>
        <ErrorSEO 
          title="Publicación no encontrada"
          description="La publicación que buscas no existe o ha sido eliminada."
          errorCode="404"
        />
        <div className="container mx-auto py-16 px-4 min-h-screen">
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Publicación no encontrada</h1>
            <p className="text-red-600 mb-6">{error || 'Esta publicación podría haber sido eliminada o no existe.'}</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/buscar')}
                className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Ir al buscador
              </button>
              <button 
                onClick={() => router.back()}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Advanced SEO Component */}
      {publicationData && (
        <PublicationSEO 
          publication={publicationData}
          canonicalUrl={canonicalUrl}
          relatedPublications={relatedPublications}
        />
      )}

      <DedicatedPublicationPage
        publication={publicationData}
        relatedPublications={relatedPublications}
        onWhatsAppClick={handleWhatsAppClick}
        onShare={handleShare}
        onFavorite={handleFavorite}
      />
    </>
  );
} 