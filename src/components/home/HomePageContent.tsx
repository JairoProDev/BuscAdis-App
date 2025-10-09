'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section with Search */}
      <div className="relative text-white overflow-hidden">
        {/* Fondo fotográfico andino optimizado */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/hero-cusco-background.webp"
            alt="Paisaje andino de Cusco"
            fill
            className="object-cover object-center"
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
            quality={80}
            draggable={false}
          />
          {/* Overlay con degradado estratégico para legibilidad */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.60) 100%)"
            }}
          />
          {/* Acento de marca superior */}
          <div
            className="absolute top-0 left-0 w-full h-1.5"
            style={{
              background: "linear-gradient(90deg, #F9D923 0%, #00B6E3 50%, #A259A4 100%)"
            }}
          />
        </div>

        {/* Contenido principal del hero */}
        <div className="relative flex flex-col items-center justify-center min-h-[480px] md:min-h-[560px] py-12 sm:py-16 lg:py-24 px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Título principal optimizado para SEO y conversión */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="
                text-2xl
                sm:text-3xl
                md:text-4xl
                lg:text-5xl
                xl:text-6xl
                font-extrabold
                mb-4
                sm:mb-6
                text-white
                px-2
                leading-tight
              "
              style={{
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              Miles de {' '}
              <span className="font-bold text-[#00B6E3] drop-shadow-lg">oportunidades</span>{' '}
              esperando por ti en{' '}
              <span className="font-bold text-[#00B6E3] drop-shadow-lg">Buscadis</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 lg:mb-12 text-white/95 font-medium px-4 max-w-3xl mx-auto"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.4)'
              }}
            >
              Encuentra todo lo que necesitas en un solo lugar; ⚡rápido, 👌fácil y 🔐seguro.
            </motion.p>

            {/* Barra de búsqueda principal - Elemento clave de conversión */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="max-w-2xl mx-auto px-4"
            >
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-3 border border-white/20">
                <RealTimeSearchEngine
                  onSearch={(query) => {
                    router.push(`/buscar?q=${encodeURIComponent(query)}`);
                  }}
                  variant="page"
                  showFilters={false}
                  placeholder="¿Qué necesitas hoy? Encuentra oportunidades cerca de ti..."
                />
              </div>
            </motion.div>


            {/* Indicadores de confianza (opcional - descomenta si tienes las métricas) */}
            {/*
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-6 text-white/90 text-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00B6E3]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span>10,000+ usuarios activos</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00B6E3]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                <span>5,000+ publicaciones</span>
              </div>
            </motion.div>
            */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${isSidebarOpen ? 'lg:flex lg:gap-6 lg:items-start lg:h-full' : 'flex gap-4'}`}>
          <div className={`${isSidebarOpen ? 'lg:w-1/2 lg:flex-shrink-0' : 'w-full'}`}>
            {/* Content Rows - Estilo Netflix optimizado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-10 lg:space-y-14"
            >
              {/* Header Section - Propuesta de valor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-4"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  Oportunidades Destacadas
                </h2>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Las mejores ofertas seleccionadas para ti en todas las categorías
                </p>
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

              {/* Call to Action Footer - Optimizado para conversión */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="py-12 lg:py-16 mt-8"
              >
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#00B6E3]/10 to-[#A259A4]/10 dark:from-[#00B6E3]/5 dark:to-[#A259A4]/5 rounded-3xl p-8 lg:p-12 border border-[#00B6E3]/20 shadow-lg">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      ¿No encuentras lo que buscas?
                    </h2>
                    <p className="text-base lg:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                      Usa nuestro buscador avanzado con filtros específicos por categoría, ubicación y precio para encontrar exactamente lo que necesitas
                    </p>
                    <button
                      onClick={() => router.push('/buscar')}
                      className="inline-flex items-center gap-3 px-8 lg:px-10 py-3.5 lg:py-4 bg-gradient-to-r from-[#00B6E3] to-[#0096c7] hover:from-[#009fc7] hover:to-[#007fa6] text-white rounded-xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      aria-label="Ir al buscador avanzado"
                    >
                      <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Buscar con Filtros Avanzados</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Desktop Sidebar - Fixed position that follows user scroll */}
          {isSidebarOpen && selectedPublication && (
            <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0">
              <div className="fixed right-4 top-24 w-[calc(50%-1rem)] max-w-lg h-[calc(100vh-6rem)] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40">
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
