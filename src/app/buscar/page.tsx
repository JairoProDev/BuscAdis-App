// src\app\buscar\page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { mongoFetch } from '@/lib/mongodb-browser';
// import { AlertCircle } from 'lucide-react'; // Removed
import SearchLayout from '@/components/search/SearchLayout';

import { Publication } from '@/types/publications';
import { useToast } from '@/components/ui/use-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import PublicationModal from '@/components/search/PublicationModal';
import { generateSeoUrl } from '@/utils/url';

// Interface for raw data structure from API
interface ApiPublicationData {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subsubcategory?: string;
  subcategorySlug?: string;
  subSubcategorySlug?: string;
  location?: { city?: string; region?: string; district?: string; province?: string; address?: string } | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  created_at?: string | Date;
  createdAt?: string | Date;
  images?: string[];
  premium?: boolean;
  verified?: boolean;
  slug?: string;
  [key: string]: unknown;
}

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

// Adaptador para convertir API data a Publication para SearchLayout
function adaptApiDataToPublication(apiData: ApiPublicationData): Publication {
  const validImages = apiData.images?.filter(img => img && img.trim() !== '' && !img.includes('placeholder')) || [];
  
  return {
    _id: apiData._id || apiData.id || `fallback-${Math.random()}`,
    title: apiData.title || 'Sin título',
    description: apiData.description || '',
    amount: Number(apiData.price || 0),
    currency: apiData.currency || 'PEN',
    categorySlug: apiData.categorySlug || apiData.category || 'productos',
    subcategorySlug: apiData.subcategorySlug || apiData.subcategory,
    subSubcategorySlug: apiData.subSubcategorySlug || apiData.subsubcategory,
    location: apiData.location && typeof apiData.location === 'object' 
      ? {
          district: apiData.location.district,
          province: apiData.location.province || 'Cusco',
          address: apiData.location.address || '',
        }
      : { province: 'Cusco', address: typeof apiData.location === 'string' ? apiData.location : '' },
    contact: {
      name: apiData.contactName || '',
      phones: apiData.contactPhone ? [apiData.contactPhone] : [],
      email: apiData.contactEmail,
    },
    images: validImages,
    attributes: {},
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : new Date(),
  } as Publication;
}

// SearchLayout ya maneja internamente la adaptación con sus propios adaptadores

export default function BuscadorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [searchState, setSearchState] = useState<SearchParams>(() => {
    const params = searchParams;
    return {
      category: params?.get('category') || '',
      subcategory: params?.get('subcategory') || '',
      subsubcategory: params?.get('subsubcategory') || '',
      query: params?.get('q') || '',
      location: params?.get('location') || '',
      minPrice: params?.get('minPrice') || '',
      maxPrice: params?.get('maxPrice') || '',
      sortBy: params?.get('sortBy') || 'recent',
      page: parseInt(params?.get('page') || '1'),
      limit: 12,
    }
  });
  
  const [results, setResults] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState('');
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFullUrl, setCurrentFullUrl] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const loadingRef = useRef(loading);
  const searchStateRef = useRef(searchState);

  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { searchStateRef.current = searchState; }, [searchState]);
  
  const updateUrlWithCleanPath = useCallback((params: SearchParams) => {
    let newPath = '';
    
    if (params.category) {
      newPath += `/${params.category}`;
      
      if (params.subcategory) {
        newPath += `/${params.subcategory}`;
        
        if (params.subsubcategory) {
          newPath += `/${params.subsubcategory}`;
        }
      }
    } else {
      newPath = '/';
    }
    
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.set('q', params.query);
    if (params.location) queryParams.set('lugar', params.location);
    if (params.minPrice) queryParams.set('precio_min', params.minPrice);
    if (params.maxPrice) queryParams.set('precio_max', params.maxPrice);
    if (params.sortBy && params.sortBy !== 'recent') queryParams.set('orden', params.sortBy);
    if (params.page && params.page > 1) queryParams.set('pagina', params.page.toString());
    
    const queryString = queryParams.toString();
    if (queryString) {
      newPath += `?${queryString}`;
    }
    
    router.replace(newPath, { scroll: false });
  }, [router]);
  
  const saveSearchHistory = useCallback((query: string) => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      let history: string[] = savedHistory ? JSON.parse(savedHistory) : [];
      
      if (!history.includes(query)) {
        history = [query, ...history].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(history));
      }
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  }, []);
  
  const checkForDailyReward = useCallback(() => {
    try {
      const lastReward = localStorage.getItem('lastSearchReward');
      const today = new Date().toDateString();
      
      if (lastReward !== today) {
        const pointsToAdd = 15;
        setUserPoints(currentPoints => {
          const newTotal = currentPoints + pointsToAdd;
          localStorage.setItem('userPoints', newTotal.toString());
          localStorage.setItem('lastSearchReward', today);
          setShowDailyReward(true);
          setTimeout(() => {
            toast({
              title: "¡Recompensa diaria!",
              description: `Has ganado ${pointsToAdd} puntos por buscar hoy.`,
            });
          }, 1000);
          return newTotal;
        });
      }
    } catch (e) {
      console.error('Error with reward system:', e);
    }
  }, [toast]);
  
  const fetchPublications = useCallback(async (paramsToFetch: SearchParams) => {
    console.log(`>>> fetchPublications explicitly called with:`, paramsToFetch);
    setLoading(true);
    setError('');

    try {
      const queryParams: Record<string, string> = {};
      Object.entries(paramsToFetch).forEach(([key, value]) => {
        if (value && key !== 'limit' && key !== 'page') {
           queryParams[key] = value.toString();
        }
      });

      console.log('Fetching /api/publications with:', queryParams);
      const response = await mongoFetch('/api/publications', { queryParams });

      if (!response.publications) {
        throw new Error(response.errorFriendly || 'No se encontraron resultados');
      }
      console.log(`API Response: ${response.publications.length} publications, total: ${response.total}`);

      const publications = response.publications || [];
      
      const enhancedPublications: Publication[] = publications.map((pub: unknown): Publication | null => {
        if (!pub || typeof pub !== 'object') return null;
        const potentialPub = pub as ApiPublicationData;

        const id = potentialPub._id?.toString() || potentialPub.id;
        const title = potentialPub.title;

        if (!id || !title) return null;

        return adaptApiDataToPublication(potentialPub);
      }).filter((p: Publication | null): p is Publication => p !== null);

      setResults(enhancedPublications);
      setTotalResults(response.total || 0);

      if (paramsToFetch.query && enhancedPublications.length > 0) {
        saveSearchHistory(paramsToFetch.query);
      }
      checkForDailyReward();

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`Error loading publications:`, errorMsg);
      setError(`Error API: ${errorMsg}`);
      setResults([]);
      toast({
        title: "Error de conexión",
        description: `No se pudo cargar: ${errorMsg}. Intenta más tarde.`,
        variant: "destructive"
      });
    } finally {
        setLoading(false);
        setIsInitialLoad(false);
    }
  }, [toast, saveSearchHistory, checkForDailyReward]);

  useEffect(() => {
    console.log("Initial Load Effect - Fetching initial data...");
    const initialParams: SearchParams = {
        category: searchParams?.get('category') || '',
        subcategory: searchParams?.get('subcategory') || '',
        subsubcategory: searchParams?.get('subsubcategory') || '',
        query: searchParams?.get('q') || '',
        location: searchParams?.get('location') || '',
        minPrice: searchParams?.get('minPrice') || '',
        maxPrice: searchParams?.get('maxPrice') || '',
        sortBy: searchParams?.get('sortBy') || 'recent',
        page: 1,
        limit: 0
    };
    fetchPublications(initialParams);

    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) setUserPoints(parseInt(savedPoints));
  }, [fetchPublications, searchParams]);
  
  const handleSearch = (query: string, options?: Record<string, string>) => {
    console.log("handleSearch triggered with query:", query);

    if (!query.trim()) {
      console.log("Empty query, not searching");
      return;
    }
    
    const newState = {
      ...searchState,
      query,
      page: 1,
      ...(options || {})
    };
    
    saveSearchHistory(query);
    
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    
    fetchPublications(newState);
  };
  
  const handleFilterChange = (filters: Partial<SearchParams>) => {
    console.log("handleFilterChange triggered");
    const newState = {
      ...searchState,
      ...filters,
      page: 1
    };
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    fetchPublications(newState);
  };
  
  const handleOpenModal = (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    console.log("--- handleOpenModal called ---");
    const id = String(publication._id);
    console.log("Raw ID received:", id);

    if (!id) {
      console.error('Cannot open modal: Invalid ID', publication);
      toast({
        title: "Error",
        description: "No se pudo generar el enlace para esta publicación.",
        variant: "destructive"
      });
      return;
    }

    setCurrentFullUrl(window.location.href);

    const categorySlug = publication.categorySlug || searchState.category || 'productos';
    const subcategorySlug = publication.subcategorySlug || searchState.subcategory;
    const subSubcategorySlug = publication.subSubcategorySlug || searchState.subsubcategory;

    const seoUrl = generateSeoUrl(
      id,
      publication.title || '',
      undefined, // slug
      categorySlug,
      subcategorySlug,
      subSubcategorySlug,
      true // generate slug from title
    );
    console.log("Generated SEO URL:", seoUrl);

    window.history.pushState({ modalOpen: true, id }, '', seoUrl);

    const contactPhones: string[] = [];
    if (publication.contact?.phones?.[0]) {
      contactPhones.push(publication.contact.phones[0]);
    }
    
        const enhancedPublication = {      ...publication,      id: id,      price: publication.amount ?? 0,      contactName: publication.contact?.name || '',      status: 'active',      contactPhone: publication.contact?.phones?.[0] || '',      contactPhones: contactPhones.length > 0 ? contactPhones : undefined,      contact: {        phone: publication.contact?.phones?.[0] || '',        phones: contactPhones.length > 0 ? contactPhones : undefined,        email: publication.contact?.email || '',        name: publication.contact?.name || ''      },      subcategory: subcategorySlug,      subsubcategory: subSubcategorySlug,      categorySlug: categorySlug,      subSubcategorySlug: publication.subSubcategorySlug || undefined    };
    
    setSelectedPublicationId(id);
    setModalOpen(true);
    
    if (typeof window !== 'undefined') {
      window.preloadedPublications = window.preloadedPublications || {};
      window.preloadedPublications[id] = enhancedPublication;
    }
  };

  const handleCloseModal = () => {
    console.log("--- handleCloseModal called ---");
    setModalOpen(false);
    setSelectedPublicationId(null);
    
    if (currentFullUrl) {
      const url = new URL(currentFullUrl);
      const cleanPath = url.pathname;
      console.log("Restoring URL to:", cleanPath);
      window.history.pushState(null, '', cleanPath);
      setCurrentFullUrl('');
    } else {
      const url = new URL(window.location.href);
      window.history.pushState(null, '', url.pathname);
    }
  };
  
  if (isInitialLoad && loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-2 py-1">
          <div className="mb-6 max-w-3xl mx-auto">
            <div className="h-12 bg-slate-800/60 rounded-xl animate-pulse"></div>
          </div>
          
          <div className="mb-4 overflow-x-auto">
            <div className="inline-flex space-x-2 pb-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`cat-${index}`} className="flex flex-col items-center min-w-[80px] max-w-[80px] animate-pulse">
                  <div className="w-10 h-10 bg-slate-800/60 rounded-lg mb-2"></div>
                  <div className="h-3 w-16 bg-slate-800/60 rounded-md"></div>
                  <div className="h-2 w-8 bg-slate-800/40 rounded-md mt-1"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4 overflow-x-auto">
            <div className="inline-flex space-x-2 pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`filter-${index}`} className="h-8 w-24 bg-slate-800/60 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-32 bg-slate-800/60 rounded-md animate-pulse"></div>
            <div className="h-8 w-24 bg-slate-800/60 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-32">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`result-${index}`} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg animate-pulse">
                    <div className="h-56 bg-slate-700/50 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-3 bg-slate-700/50 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16">
              <div className="bg-slate-800 border border-slate-700 rounded-xl h-full animate-pulse overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
                <div className="flex items-center justify-center h-full">
                  <div className="h-10 w-10 rounded-full bg-slate-700/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="w-full bg-slate-900 min-h-screen text-white">
      <div className="px-1 sm:px-6 lg:px-2 py-6 sm:py-2 lg:py-3">
        <SearchLayout
          initialResults={results}
          loading={loading && !isInitialLoad}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          totalResults={totalResults}
          onPublicationClick={handleOpenModal}
        />
        {error && loading && results.length > 0 && (
          <div className="mt-4 text-center text-red-400 text-sm">
            Error al cargar más resultados: {error}
          </div>
        )}
      </div>
      
      {showDailyReward && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDailyReward(false)}></div>
          <div 
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-teal-500/50 p-6 max-w-md w-full shadow-[0_0_40px_rgba(20,184,166,0.3)]"
          >
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
                  onClick={() => setShowDailyReward(false)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium py-2 px-8 rounded-lg transition-colors shadow-lg hover:shadow-teal-500/30"
                >
                  ¡Continuar buscando!
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {selectedPublicationId && modalOpen && (
        <PublicationModal
          publicationId={selectedPublicationId}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          initialData={undefined}
        />
      )}
    </main>
  );
}