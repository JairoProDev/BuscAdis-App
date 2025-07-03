'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generateSeoUrl } from '@/utils/url';
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage';
import { PublicationData } from '@/types/publication';
import Head from 'next/head';

/**
 * Página de detalle de publicación con título en la URL (Optimizada para SEO)
 * Esta es la página principal que se indexa en Google y se comparte en redes sociales
 */
export default function PublicationDetailWithTitlePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicationData, setPublicationData] = useState<PublicationData | null>(null);
  const [relatedPublications, setRelatedPublications] = useState<PublicationData[]>([]);
  
  // Extraer parámetros de la URL
  const categorySlugParam = params?.category as string;
  const subcategorySlugParam = params?.subcategory as string;
  const subsubcategorySlugParam = params?.subsubcategory as string;
  const id = params?.id as string;
  const titleSlugParam = params?.title as string;

  // Generate canonical URL for SEO
  const canonicalUrl = publicationData ? generateSeoUrl(
    publicationData.id,
    publicationData.title,
    undefined,
    publicationData.categorySlug,
    publicationData.subcategorySlug,
    publicationData.subSubcategorySlug,
    true
  ) : '';

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

        // Convert to PublicationData format
        const publicationData: PublicationData = {
          id: publication.id,
          title: publication.title || 'Sin título',
          description: publication.description || '',
          categorySlug: publication.categorySlug || publication.category || categorySlugParam,
          subcategorySlug: publication.subcategorySlug || publication.subcategory || subcategorySlugParam || null,
          subSubcategorySlug: publication.subSubcategorySlug || publication.subsubcategory || subsubcategorySlugParam || null,
          transactionType: publication.transactionType || 'venta',
          value: publication.price || publication.amount || publication.value || 0,
          currency: publication.currency || 'PEN',
          valueType: 'fixed',
          size: 0,
          location: publication.location || {
            district: '',
            province: '',
            city: 'Lima',
            country: 'Perú'
          },
          images: publication.images || [],
          whatsapp: publication.whatsapp || publication.contact?.phone || '51987654321',
          createdAt: publication.createdAt || new Date().toISOString(),
          views: publication.views || 0,
          featured: publication.featured || false,
          premium: publication.premium || false,
        };
        
        // Validar que la URL actual coincida con la URL canónica
        const correctUrl = generateSeoUrl(
          publicationData.id,
          publicationData.title,
          undefined,
          publicationData.categorySlug,
          publicationData.subcategorySlug,
          publicationData.subSubcategorySlug,
          true // Incluir el título
        );

        // Current path from params
        let currentPath = `/${categorySlugParam}`;
        if (subcategorySlugParam && subcategorySlugParam !== 'general') currentPath += `/${subcategorySlugParam}`;
        if (subsubcategorySlugParam && subsubcategorySlugParam !== 'general') currentPath += `/${subsubcategorySlugParam}`;
        currentPath += `/${id}/${titleSlugParam}`;

        const normalizedCurrentPath = currentPath.toLowerCase();
        const normalizedCorrectUrl = correctUrl.toLowerCase();

        if (normalizedCurrentPath !== normalizedCorrectUrl) {
          console.log(`Redirecting from ${normalizedCurrentPath} to correct SEO URL: ${correctUrl}`);
          router.replace(correctUrl); // Redirect to the canonical URL
          return;
        }

        // Set publication data
        setPublicationData(publicationData);

        // Fetch related publications
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
        } catch (err) {
          console.warn('Could not fetch related publications:', err);
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !publicationData) {
    return (
      <>
        <Head>
          <title>Publicación no encontrada | BuscAdis</title>
          <meta name="robots" content="noindex" />
        </Head>
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
      {/* SEO Meta Tags */}
      <Head>
        <title>{publicationData.title} | BuscAdis</title>
        <meta name="description" content={publicationData.description} />
        <meta name="keywords" content={`${publicationData.categorySlug}, ${publicationData.title}, ${publicationData.location?.city || 'Perú'}, BuscAdis`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={publicationData.title} />
        <meta property="og:description" content={publicationData.description} />
        <meta property="og:image" content={publicationData.images?.[0] || '/images/buscadis-og-image.jpg'} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BuscAdis" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={publicationData.title} />
        <meta name="twitter:description" content={publicationData.description} />
        <meta name="twitter:image" content={publicationData.images?.[0] || '/images/buscadis-og-image.jpg'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={typeof window !== 'undefined' ? canonicalUrl : ''} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": publicationData.categorySlug === 'empleos' ? 'JobPosting' : 'Product',
              "name": publicationData.title,
              "description": publicationData.description,
              "image": publicationData.images?.[0],
              "url": typeof window !== 'undefined' ? window.location.href : '',
              "datePosted": publicationData.createdAt,
              "offers": {
                "@type": "Offer",
                "price": publicationData.value,
                "priceCurrency": publicationData.currency
              },
              ...(publicationData.categorySlug === 'empleos' && {
                "hiringOrganization": {
                  "@type": "Organization",
                  "name": "BuscAdis"
                },
                "jobLocation": {
                  "@type": "Place",
                  "address": `${publicationData.location?.district || ''}, ${publicationData.location?.province || ''}, ${publicationData.location?.city || 'Perú'}`
                }
              })
            })
          }}
        />
      </Head>

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