// src\app\buscar\page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { mongoFetch } from '@/lib/dbConnect';
import { AlertCircle } from 'lucide-react';
import SearchLayout from '@/components/search/SearchLayout';
import { Publication } from '@/components/search/SearchResults';
import { useToast } from '@/components/ui/use-toast';
import { 
  RocketLaunchIcon, 
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SearchParams {
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  query?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page: number;
  limit?: number;
}

export default function BuscadorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { showToast } = useToast();
  
  // Estados para búsqueda y navegación
  const [searchState, setSearchState] = useState<SearchParams>({
    category: searchParams?.get('category') || '',
    subcategory: searchParams?.get('subcategory') || '',
    subsubcategory: searchParams?.get('subsubcategory') || '',
    query: searchParams?.get('q') || '',
    location: searchParams?.get('location') || '',
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    sortBy: searchParams?.get('sortBy') || 'recent',
    page: parseInt(searchParams?.get('page') || '1'),
    limit: 12,
  });
  
  // Estados para resultados y UI
  const [results, setResults] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Función para actualizar URL con nuevos parámetros de búsqueda
  const updateUrlParams = useCallback((params: SearchParams) => {
    const newParams = new URLSearchParams();
    
    // Solo agregar parámetros con valor
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        newParams.set(key, value.toString());
      }
    });
    
    // Actualizar la URL sin recargar la página
    const newPath = `${pathname}?${newParams.toString()}`;
    router.push(newPath, { scroll: false });
  }, [pathname, router]);
  
  // Función para buscar anuncios
  const fetchPublications = useCallback(async (params: SearchParams = searchState) => {
    setLoading(true);
    setError('');
    
    try {
      // Usar MongoDB browser adapter
      const response = await mongoFetch('/api/publications', {
        queryParams: {
          category: params.category || '',
          subcategory: params.subcategory || '',
          query: params.query || '',
          location: params.location || '',
          minPrice: params.minPrice || '',
          maxPrice: params.maxPrice || '',
          sortBy: params.sortBy || 'recent',
          page: params.page.toString(),
          limit: params.limit?.toString() || '12'
        }
      });
      
      // Enriquecer datos con campos adicionales para UI
      const publications = response.publications || [];
      const enhancedPublications = publications.map((pub: Publication) => ({
        ...pub,
        premium: pub.id?.includes('premium') || Math.random() > 0.8, // Simulación de anuncios premium        verified: Math.random() > 0.7, // Simulación de verificación
        views: Math.floor(Math.random() * 500) + 50, // Vistas aleatorias
        likes: Math.floor(Math.random() * 50), // Likes aleatorios
        bookmarks: Math.floor(Math.random() * 20) // Guardados aleatorios
      }));
      
      setResults(enhancedPublications);
      setTotalResults(response.total || 0);
      setTotalPages(response.pages || 1);
      
      // Guardar historial de búsqueda si hubo resultados
      if (params.query && enhancedPublications.length > 0) {
        saveSearchHistory(params.query);
      }
      
      // Recompensa por búsqueda
      checkForDailyReward();
      
    } catch (err: unknown) {
      console.error('Error al cargar los anuncios:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error desconocido al cargar los anuncios';
      setError(`Error al cargar los anuncios: ${errorMessage}`);
      setResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchState]);
  
  // Cargar datos iniciales
  useEffect(() => {
    fetchPublications();
    
    // Cargar puntos del usuario
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) {
      setUserPoints(parseInt(savedPoints));
    }
  }, [fetchPublications]);
  
  // Guardar historial de búsquedas
  const saveSearchHistory = (query: string) => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      let history: string[] = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Añadir solo si no existe y limitar a 10 elementos
      if (!history.includes(query)) {
        history = [query, ...history].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(history));
      }
    } catch (e) {
      console.error('Error guardando historial:', e);
    }
  };
  
  // Sistema de recompensas diarias para gamificación
  const checkForDailyReward = () => {
    try {
      const lastReward = localStorage.getItem('lastSearchReward');
      const today = new Date().toDateString();
      
      if (lastReward !== today) {
        // Dar recompensa diaria
        const pointsToAdd = Math.floor(Math.random() * 15) + 10; // 10-25 puntos
        const newTotal = userPoints + pointsToAdd;
        
        setUserPoints(newTotal);
        setShowDailyReward(true);
        
        // Guardar en localStorage
        localStorage.setItem('userPoints', newTotal.toString());
        localStorage.setItem('lastSearchReward', today);
        
        // Mostrar notificación
        setTimeout(() => {
           toast({
               title: "¡Recompensa diaria!",
               description: `Has ganado ${pointsToAdd} puntos por buscar hoy.`,
               // variant: 'success', // Shadcn typically uses variants, check its docs/implementation
               // You can add an action button if needed, e.g.:
               // action: <ToastAction altText="Ok">Ok</ToastAction>,
             });
        }, 1000);
      }
    } catch (e) {
      console.error('Error con sistema de recompensas:', e);
    }
  };
  
  // Manejar cambios en la búsqueda
  const handleSearch = (query: string, options?: Record<string, string>) => {
    const newState = {
      ...searchState,
      query,
      page: 1, // Volver a página 1 con nueva búsqueda
      ...(options || {})
    };
    
    setSearchState(newState);
    updateUrlParams(newState);
    fetchPublications(newState);
  };
  
  // Manejar cambios en filtros
  const handleFilterChange = (filters: Partial<SearchParams>) => {
    const newState = {
      ...searchState,
      ...filters,
      page: 1 // Volver a página 1 con nuevos filtros
    };
    
    setSearchState(newState);
    updateUrlParams(newState);
    fetchPublications(newState);
  };
  
  // Cargar más resultados (para infinite scroll)
  const handleLoadMore = () => {
    if (searchState.page < totalPages) {
      const newState = {
        ...searchState,
        page: searchState.page + 1
      };
      
      setSearchState(newState);
      
      // Cargar solo la siguiente página y añadir a resultados existentes
      fetchPublications(newState).then(() => {
        // Mostrar una notificación de logro si es la página 3+
        if (newState.page >= 3) {
          showToast({
            title: "¡Explorador incansable!",
            message: "Has desbloqueado un logro por tu búsqueda profunda",
            type: "info",
            icon: <RocketLaunchIcon className="h-5 w-5" />
          });
          
          // Dar puntos extra
          const extraPoints = 5;
          const newTotal = userPoints + extraPoints;
          setUserPoints(newTotal);
          localStorage.setItem('userPoints', newTotal.toString());
        }
      });
    }
  };
  
  // Manejar cierre del modal de recompensa diaria
  const handleCloseReward = () => {
    setShowDailyReward(false);
  };
  
  if (error && !loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-slate-900 min-h-screen text-white">
        <div className="bg-red-900/80 text-red-100 p-6 rounded-lg shadow-lg border border-red-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-300" />
            <h2 className="text-xl font-semibold">Error al cargar los resultados</h2>
          </div>
          <p className="mb-5">{error}</p>
          <button
            className="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-lg transition-colors"
            onClick={() => fetchPublications()}
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="container mx-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 bg-slate-900 min-h-screen text-white">
      {/* Contenedor principal de búsqueda */}
      <SearchLayout
        initialResults={results}
        initialCategory={searchState.category}
        initialSubcategory={searchState.subcategory}
        initialQuery={searchState.query}
        loading={loading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onLoadMore={handleLoadMore}
        hasMore={searchState.page < totalPages}
        totalResults={totalResults}
        showMap={true}
      />
      
      {/* Modal de recompensa diaria */}
      {showDailyReward && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70" onClick={handleCloseReward}></div>
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-teal-500/50 p-6 max-w-md w-full shadow-[0_0_40px_rgba(20,184,166,0.3)]">
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">¡Recompensa diaria!</h3>
              <p className="text-slate-300 text-center mb-6">
                Gracias por buscar en BuscAdis hoy. ¡Has ganado puntos de recompensa!
              </p>
              
              <div className="bg-slate-800/80 rounded-lg p-4 mb-6 border border-teal-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Tus puntos:</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                    {userPoints} pts
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-4">
                  Continúa buscando para conseguir más puntos y desbloquear recompensas exclusivas.
                </p>
                
                <button
                  onClick={handleCloseReward}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-8 rounded-lg transition-colors shadow-lg hover:shadow-teal-500/30"
                >
                  ¡Continuar buscando!
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}