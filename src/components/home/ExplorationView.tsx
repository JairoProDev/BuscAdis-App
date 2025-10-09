'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PublicationCard from '@/components/publications/PublicationCard';

import type { PublicationDocument as BasePublicationDocument } from '@/types/api';

type PublicationDocument = BasePublicationDocument & { id?: string };

interface ExplorationRow {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  publications: PublicationDocument[];
  maxItems: number;
}

interface ExplorationViewProps {
  onSearch: (query: string, options?: Record<string, unknown>) => void;
}

const ExplorationView: React.FC<ExplorationViewProps> = ({ onSearch }) => {
  const [rows, setRows] = useState<ExplorationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExplorationData();
  }, []);

  const loadExplorationData = async () => {
    try {
      setIsLoading(true);
      
      // Función helper para llamar a tu API real
      const fetchFromAPI = async (params: string = '') => {
        const response = await fetch(`/api/publications?${params}`);
        if (!response.ok) throw new Error('Error fetching data');
        const data = await response.json();
        return data.publications || [];
      };

      const explorationRows: ExplorationRow[] = [];

      // Cargar datos reales de tu API
      try {
        // Destacados Premium
        const premiumPubs = await fetchFromAPI('premium=true&limit=8');
        if (premiumPubs.length > 0) {
          explorationRows.push({
            id: 'premium',
            title: 'Destacados Premium',
            subtitle: 'Los mejores adisos con máxima visibilidad',
            icon: '⭐',
            publications: premiumPubs,
            maxItems: 8
          });
        }

        // Recientes
        const recentPubs = await fetchFromAPI('limit=12');
        if (recentPubs.length > 0) {
          explorationRows.push({
            id: 'recent',
            title: 'Recién Publicados',
            subtitle: 'Los adisos más nuevos de hoy',
            icon: '🆕',
            publications: recentPubs,
            maxItems: 12
          });
        }

        // Inmuebles
        const inmueblesPubs = await fetchFromAPI('category=inmuebles&limit=10');
        if (inmueblesPubs.length > 0) {
          explorationRows.push({
            id: 'category-inmuebles',
            title: 'Inmuebles',
            subtitle: 'Lo mejor en propiedades',
            icon: '🏠',
            publications: inmueblesPubs,
            maxItems: 10
          });
        }

        // Vehículos
        const vehiculosPubs = await fetchFromAPI('category=vehiculos&limit=10');
        if (vehiculosPubs.length > 0) {
          explorationRows.push({
            id: 'category-vehiculos',
            title: 'Vehículos',
            subtitle: 'Autos, motos y más',
            icon: '🚗',
            publications: vehiculosPubs,
            maxItems: 10
          });
        }

        // Empleos
        const empleosPubs = await fetchFromAPI('category=empleos&limit=10');
        if (empleosPubs.length > 0) {
          explorationRows.push({
            id: 'category-empleos',
            title: 'Empleos',
            subtitle: 'Oportunidades laborales',
            icon: '💼',
            publications: empleosPubs,
            maxItems: 10
          });
        }

      } catch (error) {
        console.error('Error cargando categorías específicas:', error);
      }

      setRows(explorationRows);
    } catch (error) {
      console.error('Error cargando datos de exploración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={`skeleton-row-${i}-${Math.random().toString(36).substr(2, 9)}`} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((j) => (
                <div key={`skeleton-item-${j}-${Math.random().toString(36).substr(2, 9)}`} className="flex-shrink-0 w-80">
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

  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay adisos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <ExplorationRowComponent
          key={row.id}
          row={row}
          onSearch={onSearch}
        />
      ))}
    </div>
  );
};

interface ExplorationRowProps {
  row: ExplorationRow;
  onSearch: (query: string, options?: Record<string, unknown>) => void;
}

const ExplorationRowComponent: React.FC<ExplorationRowProps> = ({ row, onSearch }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
      }
    }
  }, [checkScrollButtons, row.publications]);

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
    if (row.id.startsWith('category-')) {
      const category = row.id.replace('category-', '');
      onSearch('', { category });
    }
  };

  // Adaptador robusto para trabajar con los datos reales de tu API
  const adaptPublication = (publication: Record<string, unknown> | PublicationDocument) => {
    const pub = publication as Record<string, unknown>;
    const pricing = pub.pricing as Record<string, unknown> | undefined;
    const location = pub.location as Record<string, string> | undefined;
    const contact = pub.contact as Record<string, unknown> | undefined;
    
    return {
      id: String(pub.id || pub._id || 'unknown'),
      title: String(pub.title || 'Sin título'),
      description: String(pub.description || ''),
      categorySlug: String(pub.category || 'general'),
      subcategorySlug: pub.subcategory ? String(pub.subcategory) : null,
      subSubcategorySlug: pub.subsubcategory ? String(pub.subsubcategory) : null,
      transactionType: 'venta' as const,
      value: Number(pub.price || pub.amount || pricing?.amount || 0),
      currency: String(pub.currency || pricing?.currency || 'PEN'),
      valueType: 'fixed' as const,
      size: 1, // Not present, set default
      location: {
        country: String(location?.country || 'Perú'),
        province: String(pub.province || location?.province || 'Cusco'),
        city: String(location?.city || 'Cusco'),
        district: String(pub.district || location?.district || ''),
        address: String(location?.address || '')
      },
      contact: {
        phones: pub.contactPhone ? [String(pub.contactPhone)] : (contact?.phones as string[] || []),
        email: contact?.email ? String(contact.email) : null,
        name: pub.contactName ? String(pub.contactName) : (contact?.name ? String(contact.name) : null)
      },
      images: (pub.images as string[] || ['/images/placeholder-image.jpg']),
      status: String(pub.status || 'active'),
      premium: Boolean(pub.premium || false),
      whatsapp: String(pub.whatsapp || pub.contactPhone || ''),
      createdAt: String(pub.createdAt?.toString() || new Date().toISOString()),
      views: Number(pub.views || 0)
    };
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
          {row.publications.slice(0, row.maxItems).map((publication: PublicationDocument) => (
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

export default ExplorationView; 