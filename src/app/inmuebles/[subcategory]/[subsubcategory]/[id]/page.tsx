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
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  Squares2X2Icon,
  HomeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import RelatedPublications from '@/components/publication/RelatedPublications';

// Renombrar la interfaz Publication para evitar conflictos
interface PublicationData {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    region?: string;
    country?: string;
  };
  contact: {
    whatsapp?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  created_at: string;
  views?: number;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
  attributes?: Record<string, any>;
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
          publication.categorySlug || publication.category || 'general'
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
    title, description, price, images, 
    location, contact, created_at: createdAt, views, attributes 
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
                  {formatPrice({ amount: price, currency: 'PEN' })}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-gray-500 text-sm">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{formatDate(createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{location.city}{location.region ? `, ${location.region}` : ''}</span>
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
              {attributes && (
                <div className="mt-6 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Características</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {attributes.area && (
                      <div className="flex items-center text-gray-600">
                        <Squares2X2Icon className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Área: {attributes.area} m²</span>
                      </div>
                    )}
                    {attributes.bedrooms && (
                      <div className="flex items-center text-gray-600">
                        <HomeIcon className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Habitaciones: {attributes.bedrooms}</span>
                      </div>
                    )}
                    {attributes.bathrooms && (
                      <div className="flex items-center text-gray-600">
                        {/* Icono para baños (puedes añadir uno) */}
                        <KeyIcon className="w-4 h-4 mr-2 text-blue-500" /> 
                        <span>Baños: {attributes.bathrooms}</span>
                      </div>
                    )}
                    {/* Agrega más atributos aquí si existen */}
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
              {contact.name && (
                <p className="text-lg font-medium text-gray-800 mb-2">{contact.name}</p>
              )}
              
              <div className="space-y-3">
                {/* Botón de WhatsApp */}
                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    WhatsApp
                  </a>
                )}
                
                {/* Botón de Llamar */}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Llamar
                  </a>
                )}
                
                {/* Botón de Email (si existe) */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar Email
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
export default function InmuebleDetailPage({ params }: { params: unknown }) {
  const [id, setId] = useState<string | null>(null);
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Desempaquetar params si es promesa
  useEffect(() => {
    let isMounted = true;
    Promise.resolve(params).then((resolvedParams) => {
      if (isMounted) setId(resolvedParams.id);
    });
    return () => { isMounted = false; };
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const fetchPublication = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/publications/${id}`);
        const data = await res.json();
        setPublication(data.publication);
      } catch {
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (!publication) {
    return <div className="flex items-center justify-center min-h-screen">No se encontró la publicación.</div>;
  }
  return <DedicatedPublicationPage publication={publication} />;
} 