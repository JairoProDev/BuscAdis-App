'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicationsService, Publication } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
import { Carousel } from '@/components/ui/Carousel';
import { WhatsAppIcon } from '@/components/icons';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ShareIcon,
  FlagIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import RelatedPublications from '@/components/publication/RelatedPublications';
import { PublicationData } from '@/types';

// Función para mapear de Publication a PublicationData
function mapPublicationToPublicationData(pub: Publication): PublicationData {
  return {
    id: pub._id,
    title: pub.title,
    description: pub.description,
    categorySlug: pub.categorySlug,
    subcategorySlug: pub.subcategorySlug || null,
    subSubcategorySlug: pub.subSubcategorySlug || null,
    transactionType: 'venta', // Default value
    value: pub.value,
    currency: 'PEN', // Default currency
    valueType: pub.valueType,
    size: pub.size || 0,
    location: {
      district: pub.location.district || '',
      city: pub.location.city,
      province: pub.location.province,
      country: pub.location.country,
    },
    images: pub.images,
    whatsapp: pub.contact.phones?.[0] || '',
    createdAt: pub.createdAt,
    updatedAt: pub.updatedAt,
    views: pub.views || 0,
    featured: false, // Default value since Publication doesn't have featured
    premium: pub.premium || false,
  };
}

// El componente que renderiza el contenido de la página de detalle
function InmuebleDetailPageContent({ publication: initialPublication }: { publication: PublicationData }) {
  const router = useRouter();
  const [publication] = useState<PublicationData | null>(initialPublication);
  const [relatedPublications, setRelatedPublications] = useState<PublicationData[]>([]);

  // Fetch related publications
  useEffect(() => {
    const fetchRelated = async () => {
      if (!publication) return;
      try {
        const relatedData = await PublicationsService.getRelatedPublications(
          publication.id,
          publication.categorySlug || 'general'
        );
        setRelatedPublications(relatedData || []);
      } catch (err) {
        console.error('Error al obtener publicaciones relacionadas:', err);
      }
    };

    fetchRelated();
  }, [publication]);

  // Funciones de manejo (compartir, atrás, formato de mensaje)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Inmueble en BuscaDis',
          text: publication?.description || 'Mira este inmueble en BuscaDis',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleBack = () => {
    router.back(); // Usar router.back() para una navegación más natural
  };

  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    return encodeURIComponent(`Hola, estoy interesado en el inmueble "${publication.title}" que tienes en BuscaDis.`);
  };
  
  // Renderizado de la interfaz
  if (!publication) {
    // Esto no debería ocurrir si la página [title] funciona correctamente, pero es un fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Extraer datos para facilitar el acceso
  const { 
    title, description, value, images, 
    location, whatsapp, createdAt, views, size 
  } = publication;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Botón de Volver y Título (Breadcrumbs) */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Volver
          </button>
          {/* Aquí podrías agregar breadcrumbs si es necesario */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda (imágenes y descripción) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Carousel 
                images={images || []} 
                category="inmuebles" 
              />
            </div>
            
            {/* Detalles */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice({ amount: value, currency: 'PEN' })}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-gray-500 text-sm">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{formatDate(createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{location.city}{location.province ? `, ${location.province}` : ''}</span>
                  </div>
                  
                  {views !== undefined && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{views} {views === 1 ? 'vista' : 'vistas'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Descripción */}
              <div className="prose max-w-none text-gray-700">
                <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                <p>{description}</p>
              </div>
              
              {/* Características específicas de inmuebles */}
              {size > 0 && (
                <div className="mt-6 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Squares2X2Icon className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Área: {String(size)} m²</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha (Información de contacto y acciones) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información del vendedor */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Contactar al Vendedor</h2>
              
              <div className="space-y-3">
                {/* Botón de WhatsApp */}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    WhatsApp
                  </a>
                )}
                
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 space-y-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
              >
                <ShareIcon className="w-5 h-5 mr-2" />
                Compartir
              </button>
              <button
                // onClick={handleReport} // Implementar lógica de reporte
                className="flex items-center justify-center w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-red-100"
              >
                <FlagIcon className="w-5 h-5 mr-2" />
                Reportar Aviso
              </button>
            </div>
          </div>
        </div>

        {/* Avisos Relacionados */}
        {relatedPublications.length > 0 && (
          <RelatedPublications publications={relatedPublications} category="inmuebles" />
        )}
      </div>
    </div>
  );
}

// Main page component for Next.js 15 with async params
export default function InmuebleDetailPage({ params }: { params: Promise<{ id: string; subcategory: string; subsubcategory: string }> }) {
  const [publication, setPublication] = useState<PublicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        // Fetch publication data
        const publicationData = await PublicationsService.getPublicationById(id);
        
        if (publicationData) {
          const mappedData = mapPublicationToPublicationData(publicationData);
          setPublication(mappedData);
        } else {
          setError('Publicación no encontrada');
        }
      } catch (err) {
        console.error('Error fetching publication:', err);
        setError('Error al cargar la publicación');
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Publicación no encontrada'}</p>
        </div>
      </div>
    );
  }

  return <InmuebleDetailPageContent publication={publication} />;
}