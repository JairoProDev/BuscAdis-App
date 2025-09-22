'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePublicationDetail } from '@/hooks/usePublicationDetail';
import ContentRow from '@/components/search/ContentRow';
import { PublicationData } from '@/types/publication';
import RealTimeSearchEngine from '@/components/search/RealTimeSearchEngine';
import PublicationDetailSidebar from '@/components/publications/PublicationDetailSidebar';
import PublicationDetailContainer from '@/components/publications/PublicationDetailContainer';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}

// Configuración de las 8 categorías principales
const categories = [
  { id: 'empleos', name: 'Empleos', description: 'Oportunidades laborales destacadas', icon: '💼' },
  { id: 'inmuebles', name: 'Inmuebles', description: 'Propiedades en venta y alquiler', icon: '🏠' },
  { id: 'vehiculos', name: 'Vehículos', description: 'Autos, motos y más', icon: '🚗' },
  { id: 'servicios', name: 'Servicios', description: 'Servicios profesionales y especializados', icon: '🛠️' },
  { id: 'productos', name: 'Productos', description: 'Artículos nuevos y usados', icon: '🛍️' },
  { id: 'eventos', name: 'Eventos', description: 'Actividades y entretenimiento', icon: '🎉' },
  { id: 'negocios', name: 'Negocios', description: 'Oportunidades de negocio', icon: '💼' },
  { id: 'comunidad', name: 'Comunidad', description: 'Conexiones locales', icon: '👥' }
];

interface HomePageContentProps {
  preSelectedPublicationId?: string;
  allPublications: PublicationData[];
}

export default function HomePageContent({ 
  preSelectedPublicationId, 
  allPublications 
}: HomePageContentProps) {
  const router = useRouter();
  const [categoryRows, setCategoryRows] = useState<Record<string, SearchResult[]>>({});
  const [categoryLoading, setCategoryLoading] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Hook del contexto de publicación
  const {
    selectedPublication,
    isDetailOpen,
    openPublicationDetail,
    closePublicationDetail,
    handleWhatsAppClick,
    handleShare,
    handleFavorite
  } = usePublicationDetail()

  // Convert SearchResult to PublicationData format
  const convertToPublicationData = (searchResult: SearchResult): PublicationData => {
    let locationParts: string[] = [];
    if (typeof searchResult.location === 'string') {
      locationParts = searchResult.location.split(',').map(part => part.trim());
    } else {
      locationParts = [];
    }
    return {
      id: searchResult.id,
      title: searchResult.title,
      description: searchResult.description,
      categorySlug: searchResult.category ? searchResult.category.toLowerCase() : 'general',
      subcategorySlug: null,
      subSubcategorySlug: null,
      transactionType: 'venta',
      value: searchResult.price,
      currency: 'PEN',
      valueType: 'fixed',
      size: 0,
      location: {
        district: locationParts[0] || '',
        province: locationParts[1] || '',
        city: locationParts[2] || 'Cusco',
        country: 'Perú'
      },
      images: [searchResult.image],
      whatsapp: '51987654321',
      createdAt: searchResult.createdAt || new Date().toISOString(),
      views: searchResult.views || Math.floor(Math.random() * 500) + 50,
      featured: searchResult.featured || false,
      premium: searchResult.premium || false,
    }
  };

  // Función para cargar publicaciones por categoría
  const loadCategoryData = async (categoryId: string) => {
    setCategoryLoading(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      const response = await fetch(`/api/publications?category=${categoryId}&limit=10&sortBy=recent`);
      const data = await response.json();
      
      if (data.publications) {
        const formattedResults = data.publications.map((pub: Record<string, unknown>) => ({
          id: pub._id || pub.id,
          title: pub.title || 'Sin título',
          description: pub.description || '',
          category: categoryId,
          price: pub.price || pub.amount || 0,
          location: `${(pub.location as Record<string, string>)?.district || ''}, ${(pub.location as Record<string, string>)?.province || ''}`.replace(/^,\s*/, '') || 'Sin ubicación',
          image: Array.isArray(pub.images) && typeof pub.images[0] === 'string' ? pub.images[0] : '/images/placeholder-image.jpg',
          createdAt: pub.createdAt || new Date().toISOString(),
          views: pub.views || 0,
          featured: pub.featured || false,
          premium: pub.premium || false
        }));
        
        setCategoryRows(prev => ({
          ...prev,
          [categoryId]: formattedResults
        }));
      }
    } catch (error) {
      console.error(`Error loading category ${categoryId}:`, error);
      setCategoryRows(prev => ({
        ...prev,
        [categoryId]: []
      }));
    } finally {
      setCategoryLoading(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Cargar todas las categorías al montar el componente
  useEffect(() => {
    const loadAllCategories = async () => {
      // Cargar las primeras 4 categorías inmediatamente
      const priorityCategories = categories.slice(0, 4);
      await Promise.all(priorityCategories.map(cat => loadCategoryData(cat.id)));
      
      // Cargar las restantes después de un breve delay
      setTimeout(() => {
        const remainingCategories = categories.slice(4);
        remainingCategories.forEach(cat => loadCategoryData(cat.id));
      }, 500);
    };

    loadAllCategories();
  }, []);

  // Sincronizar estado del sidebar con el contexto
  useEffect(() => {
    setIsSidebarOpen(isDetailOpen);
  }, [isDetailOpen]);

  // Pre-seleccionar publicación si se proporciona un ID
  useEffect(() => {
    if (preSelectedPublicationId && allPublications.length > 0) {
      const publication = allPublications.find(p => p.id === preSelectedPublicationId);
      if (publication) {
        console.log('🔍 Pre-selecting publication:', publication.title);
        openPublicationDetail(publication);
        setIsSidebarOpen(true);
      }
    }
  }, [preSelectedPublicationId, allPublications, openPublicationDetail]);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 text-white">
        {isMounted && <div className="absolute inset-0 bg-black/20"></div>}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-6xl font-bold mb-6"
            >
              Encuentra lo que necesitas
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl lg:text-2xl mb-8 text-blue-100"
            >
              Miles de oportunidades esperando por ti en BuscaDis
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <RealTimeSearchEngine 
                onSearch={(query) => {
                  router.push(`/buscar?q=${encodeURIComponent(query)}`);
                }}
                variant="page"
                showFilters={false}
                placeholder="¿Qué necesitas hoy? Encuentra oportunidades cerca de ti..."
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${isSidebarOpen ? 'lg:flex lg:gap-6 lg:items-start lg:h-full' : 'flex gap-4'}`}>
          <div className={`${isSidebarOpen ? 'lg:w-1/2 lg:flex-shrink-0' : 'w-full'}`}>
            {/* Netflix-style Category Rows */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 lg:space-y-12"
            >
              {/* Featured Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-12"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Oportunidades Destacadas
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Las mejores ofertas seleccionadas para ti
                  </p>
                </div>
              </motion.div>

              {/* Category Rows */}
              <div className="space-y-8 lg:space-y-12">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                  >
                    <ContentRow
                      title={`${category.icon} ${category.name}`}
                      description={category.description}
                      publications={categoryRows[category.id]?.map(result => convertToPublicationData(result)) || []}
                      categoryId={category.id}
                      isLoading={categoryLoading[category.id]}
                      onViewAll={() => {
                        console.log('🔗 Ver todos clicked for category:', category.id);
                        router.push(`/${category.id}`);
                      }}
                      onPublicationClick={(publication) => {
                        openPublicationDetail(publication);
                        setIsSidebarOpen(true);
                      }}
                      showViewAll={true}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center py-12 lg:py-16"
              >
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    ¿No encuentras lo que buscas?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Usa nuestro buscador avanzado para encontrar exactamente lo que necesitas con filtros específicos
                  </p>
                  <button
                    onClick={() => router.push('/buscar')}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span>Buscar Ahora</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Desktop Sidebar */}
          {isSidebarOpen && selectedPublication && (
            <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 sticky top-40">
              <div className="sticky top-[140px] h-fit max-h-[calc(100vh-160px)] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                <PublicationDetailSidebar 
                  publication={selectedPublication}
                  isOpen={isDetailOpen}
                  onClose={() => {
                    closePublicationDetail();
                    setIsSidebarOpen(false);
                  }}
                  onWhatsAppClick={handleWhatsAppClick}
                  onShare={handleShare}
                  onFavorite={handleFavorite}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Publication Detail - Bottom Sheet */}
      <PublicationDetailContainer
        publications={[]}
        viewMode="grid"
        onDetailStateChange={setIsSidebarOpen}
        renderSidebarInParent={true}
      />
    </div>
  );
}
