'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  EyeIcon
} from '@heroicons/react/24/outline';
import { slugify } from '@/utils/url';

interface Publication {
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

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Obtener parámetros de la URL
  const id = params.id as string;
  const subcategory = params.subcategory as string;
  const subsubcategory = params.subsubcategory as string;
  
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>([]);

  // Fetch publication data
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log(`Obteniendo publicación con ID: ${id}`);
        
        // Implementar lógica de reintento para mayor confiabilidad
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;
        let data = null;
        
        while (attempts <= maxAttempts && !success) {
          try {
            attempts++;
            data = await PublicationsService.getPublicationById(id);
            success = true;
          } catch (err) {
            console.warn(`Intento ${attempts}/${maxAttempts} fallido:`, err);
            if (attempts <= maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (!success || !data) {
          throw new Error('No se pudo cargar la publicación después de varios intentos');
        }
        
        setPublication(data);
        
        // Intentar obtener publicaciones relacionadas si tenemos una categoría
        if (data.category || data.categorySlug) {
          try {
            const relatedData = await PublicationsService.getRelatedPublications(
              id, 
              data.category || data.categorySlug
            );
            setRelatedPublications(relatedData || []);
          } catch (err) {
            console.error('Error al obtener publicaciones relacionadas:', err);
          }
        }
        
        // Registrar visualización
        if (data) {
          try {
            // Enviar evento de visualización al backend (implementar después)
            console.log('Publicación vista:', id);
            
            // Registrar en localStorage para análisis
            try {
              const viewedItems = JSON.parse(localStorage.getItem('viewedItems') || '[]');
              if (!viewedItems.includes(id)) {
                viewedItems.push(id);
                localStorage.setItem('viewedItems', JSON.stringify(viewedItems));
              }
            } catch (e) {
              console.error('Error al registrar vista local:', e);
            }
          } catch (err) {
            console.error('Error al registrar visualización:', err);
          }
        }
      } catch (err) {
        console.error('Error al obtener publicación:', err);
        setError('No se pudo cargar la publicación. Inténtalo de nuevo más tarde.');
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublication();
    }
  }, [id]);

  // Compartir
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Publicación en BuscaDis',
          text: publication?.description || 'Mira esta publicación en BuscaDis',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  // Botón de retroceso
  const handleBack = () => {
    if (subcategory) {
      router.push(`/vehiculos/${subcategory}`);
    } else {
      router.push('/vehiculos');
    }
  };

  // Metadata dinámica para SEO
  useEffect(() => {
    if (publication && typeof document !== 'undefined') {
      // Establecer título de la página para SEO
      document.title = `${publication.title} | BuscaDis`;
      
      // Establecer meta descripción para SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          'content', 
          publication.description.substring(0, 160) + '...'
        );
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = publication.description.substring(0, 160) + '...';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      
      // Establecer meta tags de Open Graph
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.getElementsByTagName('head')[0].appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', publication.title);
      
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.getElementsByTagName('head')[0].appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', publication.description.substring(0, 160) + '...');
      
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.getElementsByTagName('head')[0].appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
      
      // Establecer imagen si está disponible
      if (publication.images && publication.images.length > 0) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.getElementsByTagName('head')[0].appendChild(ogImage);
        }
        ogImage.setAttribute('content', publication.images[0]);
      }
    }
  }, [publication]);

  // Formatear mensaje de WhatsApp según la categoría
  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    return encodeURIComponent(`Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 min-h-screen">
        <div className="bg-red-50 border border-red-100 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error</h1>
          <p className="text-red-600">{error || 'Publicación no encontrada'}</p>
          <button 
            onClick={() => router.push('/vehiculos')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            aria-label="Volver a vehículos"
          >
            Volver a vehículos
          </button>
        </div>
      </div>
    );
  }

  // Extraer valores predeterminados
  const title = publication.title || 'Sin título';
  const description = publication.description || 'Sin descripción';
  const price = publication.price || 0;
  const priceType = publication.price_type || 'fixed';
  const whatsapp = publication.contact?.whatsapp || '';
  const email = publication.contact?.email || '';
  const phone = publication.contact?.phone || '';
  const city = publication.location?.city || '';
  const region = publication.location?.region || '';
  const createdAt = publication.created_at || '';

  // Fecha con formato
  const formattedDate = createdAt ? formatDate(createdAt) : 'Fecha no disponible';

  return (
    <div className="bg-white min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Ruta de navegación */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <button onClick={() => router.push('/')} className="hover:text-blue-600">Inicio</button>
          <span className="mx-2">/</span>
          <button onClick={() => router.push('/vehiculos')} className="hover:text-blue-600">Vehículos</button>
          {subcategory && (
            <>
              <span className="mx-2">/</span>
              <button onClick={() => router.push(`/vehiculos/${subcategory}`)} className="hover:text-blue-600 capitalize">
                {subcategory.replace(/-/g, ' ')}
              </button>
            </>
          )}
          {subsubcategory && subsubcategory !== 'all' && (
            <>
              <span className="mx-2">/</span>
              <button onClick={() => router.push(`/vehiculos/${subcategory}/${subsubcategory}`)} className="hover:text-blue-600 capitalize">
                {subsubcategory.replace(/-/g, ' ')}
              </button>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-gray-700 truncate">{title}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda (imágenes y descripción) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              {publication.images && publication.images.length > 0 ? (
                <Carousel images={publication.images} />
              ) : (
                <div className="bg-gray-100 h-80 flex items-center justify-center rounded-lg">
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mt-2">Sin imágenes disponibles</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Información del vehículo */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(price, priceType)}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-gray-500">
                    <CalendarIcon className="w-5 h-5 mr-1" />
                    <span>{formattedDate}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <MapPinIcon className="w-5 h-5 mr-1" />
                    <span>{city}{region ? `, ${region}` : ''}</span>
                  </div>
                  
                  {publication.views !== undefined && (
                    <div className="flex items-center text-gray-500">
                      <EyeIcon className="w-5 h-5 mr-1" />
                      <span>{publication.views} {publication.views === 1 ? 'vista' : 'vistas'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Descripción */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {description}
                </div>
              </div>
              
              {/* Atributos específicos de vehículos */}
              {publication.attributes && Object.keys(publication.attributes).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Características</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(publication.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}: </span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <ShareIcon className="w-5 h-5 mr-2" />
                  <span>Compartir</span>
                </button>
                
                <button
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <FlagIcon className="w-5 h-5 mr-2" />
                  <span>Reportar</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Columna derecha (información de contacto) */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contactar al vendedor</h2>
              
              {/* Botones de contacto */}
              <div className="space-y-3 mb-6">
                {whatsapp && (
                  <a 
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-all"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}
                
                {email && (
                  <a
                    href={`mailto:${email}?subject=Interesado en: ${encodeURIComponent(title)}`}
                    className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contactar por Email</span>
                  </a>
                )}
                
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Llamar</span>
                  </a>
                )}
              </div>
              
              {/* Información adicional */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>ID: {publication.id}</p>
                <p>Categoría: Vehículos</p>
                {subcategory && (
                  <p>Subcategoría: {subcategory.replace(/-/g, ' ')}</p>
                )}
                {subsubcategory && subsubcategory !== 'all' && (
                  <p>Tipo: {subsubcategory.replace(/-/g, ' ')}</p>
                )}
                <p>Publicado: {formattedDate}</p>
              </div>
            </div>
            
            {/* Consejos de seguridad */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Consejos de seguridad</h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                <li>Verifica el vehículo personalmente antes de comprarlo</li>
                <li>Revisa la documentación completa del vehículo</li>
                <li>Nunca envíes dinero por adelantado</li>
                <li>Reúnete en lugares públicos y seguros</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Publicaciones relacionadas */}
        {relatedPublications.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vehículos similares</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedPublications.slice(0, 4).map((pub) => (
                <div key={pub.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative">
                    {pub.images && pub.images.length > 0 ? (
                      <Image 
                        src={pub.images[0]} 
                        alt={pub.title} 
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {formatPrice(pub.price, pub.price_type)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 line-clamp-1 mb-1">{pub.title}</h3>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{pub.location.city}</span>
                      <span>{formatDate(pub.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 