// /components/publications/PublicationCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { WhatsAppIcon } from '@/components/icons';
import { useMemo } from 'react';
import { generateSeoUrl } from '@/utils/url';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import { 
  JobsIcon, 
  RealEstateIcon, 
  VehicleIcon, 
  ServicesIcon, 
  ProductsIcon, 
  EventsIcon, 
} from '@/components/icons/categories';

// Interface remains the same, it's well-defined.
interface PublicationData {
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string | null;
  subSubcategorySlug: string | null;
  transactionType: string;
  value: number;
  currency: string;
  valueType: string;
  size: number;
  location: {
    country: string;
    province: string;
    city: string;
    district: string | null;
    address: string | null;
  };
  contact: {
    phones: string[];
    email: string | null;
    name: string | null;
  };
  images: string[];
  status: string;
  premium: boolean;
  createdAt?: string;
}

interface PublicationCardProps {
  publication: PublicationData;
  id?: string;
}

export default function PublicationCard({ publication, id }: PublicationCardProps) {
  // All your helper functions (formatPrice, formatDate, etc.) are great.
  // I'm keeping them as they are, they are well implemented.
  const publicationId = useMemo(() => id || publication.title.replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substring(7), [id, publication.title]);

  const formatPrice = (price: number, type: string) => {
    if (type === 'consultar') return 'A consultar';
    return `${publication.currency} ${price.toLocaleString('es-PE')}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Publicado recientemente';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Hoy';
    if (diffDays <= 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  const formatWhatsAppMessage = () => {
    // This function is well-structured, no changes needed.
    let message = `Hola, estoy interesado en tu publicación "${publication.title}" que vi en Buscadis.`;
    return encodeURIComponent(message);
  };
    
  const hasImage = useMemo(() => publication.images && publication.images.length > 0, [publication.images]);

  const effectiveCategory = publication.categorySlug;
  const seoUrl = useMemo(() => generateSeoUrl(publicationId, publication.title, undefined, effectiveCategory), [publicationId, publication.title, effectiveCategory]);
  const defaultImage = useMemo(() => getDefaultImageByCategory(effectiveCategory), [effectiveCategory]);

  const formattedWhatsAppNumber = useMemo(() => {
    const phones = publication.contact?.phones;
    if (!phones || phones.length === 0) return '';
    const firstNumber = phones[0].replace(/\D/g, '');
    if (firstNumber.startsWith('51')) return firstNumber;
    if (firstNumber.length === 9) return `51${firstNumber}`;
    return firstNumber;
  }, [publication.contact?.phones]);

  const getCategoryIcon = (categorySlug: string) => {
    // CAMBIO: Increased icon size for better visibility
    const iconProps = { className: "w-4 h-4 text-gray-300" }; 
    switch (categorySlug) {
      case 'empleos': return <JobsIcon {...iconProps} />;
      case 'inmuebles': return <RealEstateIcon {...iconProps} />;
      case 'vehiculos': return <VehicleIcon {...iconProps} />;
      case 'servicios': return <ServicesIcon {...iconProps} />;
      case 'productos': return <ProductsIcon {...iconProps} />;
      case 'eventos': return <EventsIcon {...iconProps} />;
      default: return <ProductsIcon {...iconProps} />;
    }
  };

  const getCategoryName = (categorySlug: string) => {
    const categoryNames: { [key: string]: string } = {
      'empleos': 'Empleo',
      'inmuebles': 'Inmueble',
      'vehiculos': 'Vehículo',
      'servicios': 'Servicio',
      'productos': 'Producto',
      'eventos': 'Evento',
    };
    return categoryNames[categorySlug] || 'General';
  };

  // CAMBIO: Main logic for conditional styling.
  // This is a common and clean pattern. We define the base styles and then conditionally add premium styles.
  const cardBaseClasses = "relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 group bg-gray-800 shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1";
  const premiumWrapperClasses = publication.premium ? "rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-xl shadow-amber-500/20" : "";

  return (
    // CAMBIO: Wrapper div that applies the gradient border ONLY for premium cards.
    // The inner div holds the actual content. This is a robust way to create gradient borders.
    <div className={premiumWrapperClasses}>
      <div className={cardBaseClasses}>
        
        <Link href={seoUrl} className="block">
          <div className="relative h-48 w-full">
            <Image
              src={hasImage ? publication.images[0] : defaultImage}
              alt={publication.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => { e.currentTarget.src = defaultImage; }}
            />
            {/* CAMBIO: Premium Badge. Clear, non-intrusive, and looks great. */}
            {publication.premium && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-bold px-3 py-1 rounded-full text-xs shadow-lg">
                PREMIUM
              </div>
            )}
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent"></div>

             {/* CAMBIO: Title moved over the image for a more modern look */}
             <div className="absolute bottom-0 left-0 p-4">
                 <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md">
                    {publication.title}
                 </h3>
             </div>
          </div>
        </Link>

        {/* CAMBIO: The content area now has a consistent background, solving the contrast problem. */}
        <div className="p-4 flex flex-col flex-grow justify-between bg-gray-800">
            <div>
                <div className="text-xl font-semibold text-cyan-400 mb-2">
                    {formatPrice(publication.value, publication.valueType)}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {publication.location.city}, {publication.location.province}
                </div>
            </div>
          
                         {/* SOLUCIONANDO LOS PROBLEMAS DE RECORTE */}
             <div className="flex items-center justify-between gap-1 mt-auto pt-4 border-t border-gray-700/50 min-h-[40px]">
                 {/* Categoría - Solo icono en mobile, icono + texto en desktop */}
                 <div className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-full flex-shrink-0" title={getCategoryName(effectiveCategory)}>
                     {getCategoryIcon(effectiveCategory)}
                     {/* SOLUCIÓN: Solo mostrar texto en pantallas medianas y grandes */}
                     <span className="hidden md:inline text-xs font-medium text-gray-300 whitespace-nowrap">
                         {getCategoryName(effectiveCategory)}
                     </span>
                 </div>

                 {/* Botón de contacto - Adaptativo según espacio disponible */}
                 {formattedWhatsAppNumber ? (
                     <a
                         href={`https://wa.me/${formattedWhatsAppNumber}?text=${formatWhatsAppMessage()}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white font-medium px-2 py-1 rounded-full transition-colors text-xs flex-shrink-0"
                         onClick={(e) => e.stopPropagation()}
                     >
                         <WhatsAppIcon className="w-3 h-3" />
                         {/* SOLUCIÓN: Texto solo en pantallas grandes, emoji en móviles */}
                         <span className="hidden lg:inline whitespace-nowrap">Contactar</span>
                         <span className="lg:hidden">💬</span>
                     </a>
                 ) : (
                     <span className="text-gray-500 text-xs flex-shrink-0">Sin contacto</span>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
}