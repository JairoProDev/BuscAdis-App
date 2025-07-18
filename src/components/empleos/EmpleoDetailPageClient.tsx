'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PublicationsService } from '@/services/publications.service';
import { formatDate } from '@/utils/date';
import { formatPrice } from '@/utils/format';
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
import RelatedPublications from '@/components/publication/RelatedPublications';
import { PublicationData as EmploymentPublicationData } from '@/types/publication';

// Interface for related publications that matches RelatedPublications component
interface RelatedPublicationData {
  id: string;
  title: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    region?: string;
  };
  created_at: string;
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
}

interface EmpleoDetailPageClientProps {
  id: string;
}

export default function EmpleoDetailPageClient({ id }: EmpleoDetailPageClientProps) {
  const router = useRouter();
  const [publication, setPublication] = useState<EmploymentPublicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPublications, setRelatedPublications] = useState<RelatedPublicationData[]>([]);

  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/publications/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar la publicación');
        const data = await res.json();
        // Adaptar el resultado para cumplir con PublicationData
        const pub = data.publication;
        // Parsear location string a objeto
        let district = '';
        let city = '';
        const country = 'Perú';
        if (typeof pub.location === 'string') {
          const parts = pub.location.split(',').map((p: unknown) => (typeof p === 'string' ? p.trim() : ''));
          if (parts.length === 2) {
            district = parts[0];
            city = parts[1];
          } else if (parts.length === 1) {
            city = parts[0];
          }
        }
        const adapted: EmploymentPublicationData = {
          id: pub._id || id,
          title: pub.title || '',
          description: pub.description || '',
          categorySlug: pub.categorySlug || '',
          subcategorySlug: pub.subcategorySlug || null,
          subSubcategorySlug: pub.subSubcategorySlug || null,
          transactionType: pub.transactionType || 'venta',
          value: pub.value || pub.price || 0,
          currency: pub.currency || 'PEN',
          valueType: pub.valueType || 'fixed',
          size: pub.size || 0,
          location: {
            district,
            province: '',
            city,
            country,
          },
          images: Array.isArray(pub.images) ? pub.images : [],
          whatsapp: pub.contactPhone || '',
          createdAt: typeof pub.createdAt === 'string' ? pub.createdAt : (pub.createdAt?.$date || new Date().toISOString()),
          views: pub.views || 0,
          featured: pub.featured || false,
          premium: pub.premium || false,
        };
        setPublication(adapted);
      } catch (error) {
        console.error('Error fetching empleo:', error);
        // setError('Error al cargar el empleo'); // This line was removed
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  // Fetch related publications
  useEffect(() => {
    const fetchRelated = async () => {
      if (!publication) return;
      try {
        const relatedData = await PublicationsService.getRelatedPublications(
          publication.id,
          publication.categorySlug || 'general'
        );
        // Adapt the related publications to match RelatedPublications interface
        const adaptedRelated = (relatedData || []).map((pub: Record<string, unknown>) => {
          let city = '';
          let region = '';
          if (typeof pub.location === 'object' && pub.location !== null && 'city' in pub.location) {
            city = (pub.location as { city?: string }).city || '';
            region = (pub.location as { province?: string; region?: string }).province || (pub.location as { region?: string }).region || '';
          } else if (typeof pub.location === 'string') {
            city = pub.location;
          }
          return {
            id: pub._id || pub.id || '',
            title: pub.title || '',
            price: pub.price ?? pub.value ?? 0,
            price_type: pub.price_type || pub.valueType || 'fixed',
            images: Array.isArray(pub.images) ? pub.images : [],
            location: { city, region },
            created_at: pub.created_at || pub.createdAt || '',
            category: pub.categorySlug || pub.category || '',
            subcategory: pub.subcategorySlug || pub.subcategory || '',
            subsubcategory: pub.subSubcategorySlug || pub.subsubcategory || '',
          };
        });
        setRelatedPublications(adaptedRelated);
      } catch (err) {
        console.error('Error al obtener ofertas relacionadas:', err);
      }
    };

    fetchRelated();
  }, [publication]);

  // Funciones de manejo
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication?.title || 'Oferta de Empleo en BuscaDis',
          text: publication?.description || 'Mira esta oferta de empleo en BuscaDis',
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
    router.back();
  };

  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    return encodeURIComponent(`Hola, estoy interesado en la oferta de empleo "${publication.title}" publicada en BuscaDis.`);
  };
  
  // Renderizado
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No se encontró la publicación.</p>
      </div>
    );
  }

  const { 
    title, description, categorySlug, value, currency, valueType, location, images, whatsapp, createdAt, views
  } = publication;
  const formattedDate = formatDate(createdAt);
  // Adaptar formato de precio para salarios
  const formattedSalary = value > 0 ? formatPrice({ amount: value, currency }) : (valueType === 'negotiable' ? 'A convenir' : 'No especificado');
  const city = location?.city || '';
  const province = location?.province || '';
  const district = location?.district || '';
  const country = location?.country || '';
  const companyLogo = images && images.length > 0 ? images[0] : '/images/company-placeholder.png';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Navegación y Título */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda (Detalles de la oferta) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              {/* Encabezado con logo (opcional) */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                  <Image src={companyLogo} alt={`Logo de la empresa`} width={64} height={64} className="object-contain w-full h-full" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>Publicado: {formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{district}{province ? `, ${province}` : ''}{city ? `, ${city}` : ''}{country ? `, ${country}` : ''}</span>
                  </div>
                  {views !== undefined && (
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{views} {views === 1 ? 'vista' : 'vistas'}</span>
                    </div>
                  )}
                </div>
                <div className="font-medium text-blue-600">
                  Salario: {formattedSalary}
                </div>
              </div>
              
              {/* Descripción del puesto */}
              <div className="prose max-w-none text-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-2">Descripción del Puesto</h2>
                <p>{description}</p>
              </div>
              {/* Puedes agregar más detalles aquí si tienes atributos personalizados en PublicationData global */}
            </div>
          </div>

          {/* Columna derecha (Contacto y acciones) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información de contacto/postulación */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Postular / Contactar</h2>
              <div className="space-y-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" /> Contactar por WhatsApp
                  </a>
                )}
                {!whatsapp && (
                  <p className="text-sm text-gray-500 text-center">No hay método de contacto directo disponible.</p>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 space-y-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
              >
                <ShareIcon className="w-5 h-5 mr-2" /> Compartir Oferta
              </button>
              <button
                className="flex items-center justify-center w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-red-100"
              >
                <FlagIcon className="w-5 h-5 mr-2" /> Reportar Oferta
              </button>
            </div>
          </div>
        </div>

        {/* Ofertas Relacionadas */}
        {relatedPublications.length > 0 && (
          <RelatedPublications publications={relatedPublications} category={categorySlug} />
        )}
      </div>
    </div>
  );
} 