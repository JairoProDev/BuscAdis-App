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
  EducationIcon, 
  TourismIcon, 
  PetsIcon 
} from '@/components/icons/categories';

// Define la interfaz que coincide con la estructura de tus datos JSON
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

// Adaptamos PublicationCardProps para que reciba directamente tu estructura de datos
interface PublicationCardProps {
  publication: PublicationData;
  id?: string; // Podemos pasar un ID explícitamente o generarlo
}

export default function PublicationCard({ publication, id }: PublicationCardProps) {
  // Generar un ID si no se proporciona
  const publicationId = useMemo(() => id || publication.title.replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substring(7), [id, publication.title]);

  const formatPrice = (price: number, type: string) => {
    if (type === 'negotiable' || type === 'negociable' || type === 'consultar') return 'Consultar';
    if (type === 'free') return 'Gratis';
    if (type === 'sueldo_mas_comisiones') return 'Sueldo + Comisiones';
    if (type === 'desde') return `Desde S/ ${price.toLocaleString('es-PE')}`;
    if (type === 'por_metro_cuadrado_negociable') return `S/ ${price.toLocaleString('es-PE')}/m² (Negociable)`;
    return `${publication.currency} ${price.toLocaleString('es-PE')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      // Asumo que 'createdAt' será una cadena de fecha válida en el futuro
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const formatWhatsAppMessage = () => {
    let message = `Hola, estoy interesado en tu publicación "${publication.title}" de Buscadis.`;

    // Personalizar el mensaje según la categoría (usando los slugs ahora)
    if (publication.categorySlug === 'empleos') {
      message = `Hola, estoy interesado en la oferta de empleo "${publication.title}" publicada en Buscadis.`;
    } else if (publication.categorySlug === 'inmuebles') {
      message = `Hola, estoy interesado en el inmueble "${publication.title}" que tienes en Buscadis.`;
    } else if (publication.categorySlug === 'servicios') {
      message = `Hola, estoy interesado en el servicio "${publication.title}" que ofreces en Buscadis.`;
    } else if (publication.categorySlug === 'vehiculos') {
      message = `Hola, estoy interesado en el vehículo "${publication.title}" que tienes en Buscadis.`;
    } else if (publication.categorySlug === 'productos') {
      message = `Hola, estoy interesado en el producto "${publication.title}" que vendes en Buscadis.`;
    }
    // Puedes agregar más categorías según sea necesario

    // Incluir información adicional si es relevante
    if (publication.transactionType === 'venta' && publication.valueType === 'fijo' && publication.currency && publication.value > 0) {
      message += ` El precio es ${publication.currency} ${publication.value.toLocaleString('es-PE')}.`;
    } else if (publication.transactionType === 'alquiler' && publication.valueType === 'fijo' && publication.currency && publication.value > 0) {
      message += ` El precio de alquiler es ${publication.currency} ${publication.value.toLocaleString('es-PE')}.`;
    }

    return encodeURIComponent(message);
  };

  // Determinar si la publicación tiene imagen
  const hasImage = useMemo(() => {
    return publication.images && publication.images.length > 0;
  }, [publication.images]);

  // Usar directamente los slugs de tus datos
  const effectiveCategory = publication.categorySlug;
  const effectiveSubcategory = publication.subcategorySlug;
  const effectiveSubsubcategory = publication.subSubcategorySlug;

  // URL amigable para SEO
  const seoUrl = useMemo(() => generateSeoUrl(
    publicationId,
    publication.title,
    undefined, // Publication slug - undefined as we don't have it
    effectiveCategory,
    effectiveSubcategory ?? undefined,
    effectiveSubsubcategory ?? undefined,
    true // includeTitleInSlug parameter should be boolean
  ), [
    publicationId,
    publication.title,
    effectiveCategory,
    effectiveSubcategory,
    effectiveSubsubcategory
  ]);

  // Obtener la imagen predeterminada según la categoría (usando el slug ahora)
  const defaultImage = useMemo(() => {
    return getDefaultImageByCategory(effectiveCategory);
  }, [effectiveCategory]);

  // Check if the WhatsApp number exists and format it correctly
  const formattedWhatsAppNumber = useMemo(() => {
    const phones = publication.contact?.phones;
    if (!phones || phones.length === 0) return '';
    const firstNumber = phones[0];
    if (!firstNumber) return '';

    const cleanNumber = firstNumber.replace(/\D/g, '');

    if (cleanNumber.startsWith('51')) {
      return cleanNumber;
    } else if (cleanNumber.startsWith('9') && cleanNumber.length === 9) {
      return `51${cleanNumber}`;
    } else if (cleanNumber.length === 9) { // Assuming local Cusco numbers might be 9 digits
      return `51${cleanNumber}`;
    } else {
      return cleanNumber; // Fallback, might need more robust logic
    }
  }, [publication.contact?.phones]);

  // Función para obtener el icono de la categoría
  const getCategoryIcon = (categorySlug: string) => {
    const iconProps = { className: "w-4 h-4", fill: "currentColor" };
    
    switch (categorySlug) {
      case 'empleos':
        return <JobsIcon {...iconProps} />;
      case 'inmuebles':
        return <RealEstateIcon {...iconProps} />;
      case 'vehiculos':
        return <VehicleIcon {...iconProps} />;
      case 'servicios':
        return <ServicesIcon {...iconProps} />;
      case 'productos':
        return <ProductsIcon {...iconProps} />;
      case 'eventos':
        return <EventsIcon {...iconProps} />;
      default:
        return <ProductsIcon {...iconProps} />;
    }
  };

  // Función para obtener el nombre de la categoría
  const getCategoryName = (categorySlug: string) => {
    const categoryNames: { [key: string]: string } = {
      'empleos': 'Empleos',
      'inmuebles': 'Inmuebles',
      'vehiculos': 'Vehículos',
      'servicios': 'Servicios',
      'productos': 'Productos',
      'eventos': 'Eventos',
    };
    return categoryNames[categorySlug] || 'General';
  };

  return (
    <div className="rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-black">
      <Link href={seoUrl}>
        <div className="relative h-56 w-full">
          <Image
            src={hasImage ? publication.images[0] : defaultImage}
            alt={publication.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-sm">
            {formatPrice(publication.value, publication.valueType)}
          </div>

          {/* Logo de Buscadis */}
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md">
              <Image
                src="/logo.png"
                alt="Buscadis"
                width={28}
                height={28}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 bg-gradient-to-r from-cyan-500 to-teal-500">
        <Link href={seoUrl}>
          <h3 className="font-semibold text-white hover:text-cyan-100 transition-colors text-lg mb-1 truncate">
            {publication.title}
          </h3>
        </Link>
        <div className="text-sm text-cyan-100 mb-3">
          {publication.location.city}, {publication.location.province} • {formatDate(publication.createdAt ?? '')}
        </div>

        {/* Fila mejorada con categoría e iconos */}
        <div className="flex justify-between items-center gap-2">
          {/* Categoría con icono - responsive */}
          <div className="flex items-center gap-1 text-cyan-100 text-xs bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm flex-shrink-0">
            {getCategoryIcon(effectiveCategory)}
            {/* Solo mostrar texto en desktop */}
            <span className="hidden sm:inline">
              {getCategoryName(effectiveCategory)}
            </span>
          </div>

          {/* Botón de contacto mejorado */}
          {formattedWhatsAppNumber ? (
            <a
              href={`https://wa.me/${formattedWhatsAppNumber}?text=${formatWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-white font-medium text-xs hover:text-cyan-100 transition-colors bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`WhatsApp click for publication: ${publicationId}`);
              }}
            >
              <WhatsAppIcon className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Contactar</span>
              <span className="sm:hidden">💬</span>
            </a>
          ) : (
            <span className="text-cyan-200 text-xs flex-shrink-0">Sin contacto</span>
          )}
        </div>
      </div>
    </div>
  );
}