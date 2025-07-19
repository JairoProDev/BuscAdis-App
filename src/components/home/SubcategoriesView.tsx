'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import PublicationCard from '@/components/publications/PublicationCard';

// Nuevas interfaces para reemplazar 'any'
export interface PublicationData {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;
  subSubcategorySlug?: string;
  transactionType?: string;
  price?: number;
  value?: number;
  currency?: string;
  valueType?: string;
  size?: number;
  location?: {
    city?: string;
    district?: string;
    address?: string;
  } | string;
  contactPhone?: string;
  contactEmail?: string;
  contactName?: string;
  contact?: {
    phones?: string[];
  };
  images?: string[];
  status?: string;
  premium?: boolean;
  whatsapp?: string;
  createdAt?: string;
  created_at?: string;
  views?: number;
}

export interface SearchOptions {
  category?: string;
  subcategory?: string;
  location?: string;
  priceRange?: [number, number];
  sortBy?: string;
  filters?: Record<string, unknown>;
  viewType?: string;
}

export interface SubcategoryRow {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  publications: PublicationData[];
  maxItems: number;
}

export interface SubcategoriesViewProps {
  category: string;
  onSearch: (query: string, options?: SearchOptions) => void;
  onBack: () => void;
}

// Adaptador robusto para trabajar con los datos reales de tu API
const adaptPublication = (publication: PublicationData) => ({
  id: publication.id || publication._id || 'unknown',
  title: publication.title || 'Sin título',
  description: publication.description || '',
  categorySlug: publication.categorySlug || 'general',
  subcategorySlug: publication.subcategory || publication.subcategorySlug || null,
  subSubcategorySlug: publication.subSubcategorySlug || null,
  transactionType: publication.transactionType || 'venta',
  value: publication.price || publication.value || 0,
  currency: publication.currency || 'PEN',
  valueType: publication.valueType || 'fijo',
  size: publication.size || 1,
  location: {
    country: 'Perú',
    province: 'Cusco',
    city: typeof publication.location === 'object' ? publication.location?.city || 'Cusco' : publication.location || 'Cusco',
    district: typeof publication.location === 'object' ? publication.location?.district || '' : '',
    address: typeof publication.location === 'object' ? publication.location?.address || '' : ''
  },
  contact: {
    phones: publication.contactPhone ? [publication.contactPhone] : ['900000000'],
    email: publication.contactEmail || null,
    name: publication.contactName || null
  },
  images: (publication.images && Array.isArray(publication.images)) 
    ? publication.images 
    : ['/images/placeholder-image.jpg'],
  status: publication.status || 'active',
  premium: publication.premium || false,
  whatsapp: publication.contact?.phones?.[0] || publication.whatsapp || '900000000',
  createdAt: publication.createdAt || publication.created_at || new Date().toISOString(),
  views: publication.views || 0
});

const SubcategoriesView: React.FC<SubcategoriesViewProps> = ({ category, onSearch, onBack }) => {
  const [rows, setRows] = useState<SubcategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubcategoriesData();
  }, [loadSubcategoriesData]);

  const loadSubcategoriesData = async () => {
    try {
      setIsLoading(true);
      
      // Función helper para llamar a tu API real
      const fetchFromAPI = async (params: string = '') => {
        const response = await fetch(`/api/publications?${params}`);
        if (!response.ok) throw new Error('Error fetching data');
        const data = await response.json();
        return data.publications || [];
      };

      const subcategoryRows: SubcategoryRow[] = [];

      // Definir subcategorías por categoría principal
      const subcategoriesMap: Record<string, Array<{slug: string, title: string, subtitle: string, icon: string}>> = {
        inmuebles: [
          { slug: 'casas', title: 'Casas', subtitle: 'Casas independientes y adosadas', icon: '🏠' },
          { slug: 'departamentos', title: 'Departamentos', subtitle: 'Departamentos y condominios', icon: '🏢' },
          { slug: 'terrenos', title: 'Terrenos', subtitle: 'Lotes y terrenos', icon: '🌿' },
          { slug: 'locales', title: 'Locales Comerciales', subtitle: 'Espacios comerciales', icon: '🏪' },
          { slug: 'oficinas', title: 'Oficinas', subtitle: 'Espacios de trabajo', icon: '🏢' }
        ],
        vehiculos: [
          { slug: 'autos', title: 'Autos', subtitle: 'Automóviles particulares', icon: '🚗' },
          { slug: 'motos', title: 'Motocicletas', subtitle: 'Motos y scooters', icon: '🏍️' },
          { slug: 'camionetas', title: 'Camionetas', subtitle: 'Pickup y SUV', icon: '🚙' },
          { slug: 'buses', title: 'Buses', subtitle: 'Transporte público', icon: '🚌' },
          { slug: 'repuestos', title: 'Repuestos', subtitle: 'Partes y accesorios', icon: '🔧' }
        ],
        empleos: [
          { slug: 'tecnologia', title: 'Tecnología', subtitle: 'IT y desarrollo', icon: '💻' },
          { slug: 'administracion', title: 'Administración', subtitle: 'Oficina y gestión', icon: '📊' },
          { slug: 'ventas', title: 'Ventas', subtitle: 'Comercial y marketing', icon: '💼' },
          { slug: 'turismo', title: 'Turismo', subtitle: 'Hotelería y guías', icon: '🗺️' },
          { slug: 'gastronomia', title: 'Gastronomía', subtitle: 'Cocina y restaurantes', icon: '👨‍🍳' }
        ],
        servicios: [
          { slug: 'construccion', title: 'Construcción', subtitle: 'Obras y remodelaciones', icon: '🔨' },
          { slug: 'limpieza', title: 'Limpieza', subtitle: 'Aseo y mantenimiento', icon: '🧹' },
          { slug: 'tecnicos', title: 'Técnicos', subtitle: 'Reparaciones', icon: '🔧' },
          { slug: 'belleza', title: 'Belleza', subtitle: 'Estética y cuidado', icon: '💄' },
          { slug: 'educacion', title: 'Educación', subtitle: 'Clases y tutorías', icon: '📚' }
        ],
        productos: [
          { slug: 'electronica', title: 'Electrónicos', subtitle: 'Gadgets y tecnología', icon: '📱' },
          { slug: 'muebles', title: 'Muebles', subtitle: 'Mobiliario del hogar', icon: '🪑' },
          { slug: 'ropa', title: 'Ropa', subtitle: 'Vestimenta y accesorios', icon: '👕' },
          { slug: 'deportes', title: 'Deportes', subtitle: 'Equipamiento deportivo', icon: '⚽' },
          { slug: 'libros', title: 'Libros', subtitle: 'Literatura y textos', icon: '📖' }
        ]
      };

      const subcategories = subcategoriesMap[category] || [];

      // Cargar datos para cada subcategoría
      for (const subcategory of subcategories) {
        try {
          const subcategoryPubs = await fetchFromAPI(`category=${category}&subcategory=${subcategory.slug}&limit=8`);
          if (subcategoryPubs.length > 0) {
            subcategoryRows.push({
              id: `subcategory-${category}-${subcategory.slug}`,
              title: subcategory.title,
              subtitle: subcategory.subtitle,
              icon: subcategory.icon,
              publications: subcategoryPubs,
              maxItems: 8
            });
          }
        } catch {
          console.log(`No publications available for ${category}/${subcategory.slug}`);
        }
      }

      setRows(subcategoryRows);
    } catch {
      console.error('Error loading subcategories data');
      setIsLoading(false);
    }
  };

  const getCategoryTitle = (categorySlug: string) => {
    const titles: Record<string, string> = {
      inmuebles: 'Inmuebles',
      vehiculos: 'Vehículos', 
      empleos: 'Empleos',
      servicios: 'Servicios',
      productos: 'Productos',
      eventos: 'Eventos',
      educacion: 'Educación',
      turismo: 'Turismo'
    };
    return titles[categorySlug] || categorySlug;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex-shrink-0 w-80">
                  <div className="bg-gray-200 rounded-xl h-64 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getCategoryTitle(category)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Explora por subcategorías
          </p>
        </div>
      </div>

      {/* Filas de subcategorías */}
      {rows.map((row) => (
        <SubcategoryRowComponent
          key={row.id}
          row={row}
          onSearch={onSearch}
          category={category}
        />
      ))}

      {rows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay subcategorías disponibles para {getCategoryTitle(category)}</p>
        </div>
      )}
    </div>
  );
};

interface SubcategoryRowProps {
  row: SubcategoryRow;
  onSearch: (query: string, options?: SearchOptions) => void;
  category: string;
}

const SubcategoryRowComponent: React.FC<SubcategoryRowProps> = ({ row, onSearch, category }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [row.publications]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320;
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleSeeAllClick = () => {
    const subcategory = row.id.replace(`subcategory-${category}-`, '');
    // Navegar a la vista normal con filtros de categoría y subcategoría
    onSearch('', { 
      category,
      subcategory,
      viewType: 'normal'
    });
  };

  return (
    <div className="mb-8">
      {/* Header de la fila */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-2xl">{row.icon}</span>
            {row.title}
          </h2>
          {row.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {row.subtitle}
            </p>
          )}
        </div>
        
        <button
          onClick={handleSeeAllClick}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
        >
          Ver todos →
        </button>
      </div>

      {/* Contenedor scrolleable */}
      <div className="relative group">
        {/* Botón scroll izquierda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Botón scroll derecha */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Grid de tarjetas usando TUS PublicationCards originales */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {row.publications.slice(0, row.maxItems).map((publication: PublicationData) => (
            <div key={publication.id || publication._id || Math.random()} className="flex-shrink-0 w-80">
              <PublicationCard 
                publication={adaptPublication(publication)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubcategoriesView; 