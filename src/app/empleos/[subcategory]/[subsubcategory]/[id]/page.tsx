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
  EyeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { slugify } from '@/utils/url';
import RelatedPublications from '@/components/publication/RelatedPublications';

interface PublicationData {
  id: string;
  title: string;
  description: string;
  price: number; // Puede representar salario o ser 0
  price_type: string; // 'salary', 'negotiable', 'volunteer', etc.
  images: string[]; // Puede ser el logo de la empresa
  location: {
    city: string;
    region?: string;
    country?: string;
  };
  contact: {
    whatsapp?: string;
    email?: string;
    phone?: string;
    name?: string; // Nombre de la empresa o contacto
  };
  created_at: string;
  views?: number;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
  attributes?: Record<string, any>; // ej: tipo_contrato, nivel_experiencia, modalidad, etc.
}

// Componente de contenido de detalle de empleo
function EmpleoDetailPageContent({ publication: initialPublication }: { publication: PublicationData }) {
  const router = useRouter();
  const [publication, setPublication] = useState<PublicationData | null>(initialPublication);
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
  if (!publication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { 
    title, description, price, price_type: priceType, images, 
    location, contact, created_at: createdAt, views, attributes 
  } = publication;
  const formattedDate = formatDate(createdAt);
  // Adaptar formato de precio para salarios
  const formattedSalary = priceType === 'salary' ? formatPrice({ amount: price, currency: 'PEN' }) : (priceType === 'negotiable' ? 'A convenir' : 'No especificado');
  const city = location?.city || '';
  const region = location?.region || '';
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
                  <Image src={companyLogo} alt={`Logo de ${contact.name || 'Empresa'}`} width={64} height={64} className="object-contain w-full h-full" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
                  {contact.name && (
                    <p className="text-lg text-gray-600">{contact.name}</p>
                  )}
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
                    <span>{city}{region ? `, ${region}` : ''}</span>
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
              
              {/* Requisitos y Detalles */}
              {attributes && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Detalles del Empleo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {Object.entries(attributes).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        {key === 'tipo_contrato' && <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />}
                        {key === 'modalidad' && <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />}
                        {key === 'nivel_experiencia' && <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />}
                        {/* Otros iconos */}
                        <span className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="ml-2 text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha (Contacto y acciones) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información de contacto/postulación */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Postular / Contactar</h2>
              <div className="space-y-3">
                {/* Priorizar email o enlace de postulación si existe */}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}?subject=Postulación para: ${encodeURIComponent(title)}`}
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Enviar Email / CV
                  </a>
                )}
                {contact.whatsapp && !contact.email && (
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" /> Contactar por WhatsApp
                  </a>
                )}
                {contact.phone && !contact.email && !contact.whatsapp && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> Llamar
                  </a>
                )}
                {!contact.email && !contact.whatsapp && !contact.phone && (
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
          <RelatedPublications publications={relatedPublications} category="empleos" />
        )}
      </div>
    </div>
  );
}

// Main page component for Next.js 15 with async params
interface PageProps {
  params: Promise<{
    subcategory: string;
    subsubcategory: string;
    id: string;
  }>;
}

export default async function EmpleoDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // In a real implementation, you would fetch the publication data here
  // For now, we'll create a mock publication to satisfy the component
  const mockPublication: PublicationData = {
    id: id,
    title: "Empleo de ejemplo",
    description: "Descripción del empleo",
    price: 0,
    price_type: "negotiable",
    images: [],
    location: {
      city: "Lima",
      region: "Lima",
      country: "Perú"
    },
    contact: {
      email: "contacto@example.com"
    },
    created_at: new Date().toISOString()
  };

  return <EmpleoDetailPageContent publication={mockPublication} />;
} 