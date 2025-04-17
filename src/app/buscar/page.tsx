// src\app\buscar\page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { mongoFetch } from '@/lib/mongodb-browser';
import { AlertCircle } from 'lucide-react';
import SearchLayout from '@/components/search/SearchLayout';
import { Publication } from '@/components/search/SearchResults';
import { useToast } from '@/components/ui/use-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import PublicationModal from '@/components/search/PublicationModal';
import { generateSeoUrl } from '@/utils/url';

// Interface for raw data structure from API (might include _id, etc.)
interface ApiPublicationData {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  category?: string;
  categorySlug?: string; // Ensure this is potentially received
  subcategory?: string;
  location?: { city?: string; region?: string } | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  created_at?: string | Date;
  createdAt?: string | Date; // API might return this instead
  images?: string[];
  premium?: boolean;
  verified?: boolean;
  [key: string]: unknown; // Allow other fields
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

export default function BuscadorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Parse search state from the URL only once on initial load
  const [searchState, setSearchState] = useState<SearchParams>(() => {
    const params = searchParams; // Get it once
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
  
  // Results and UI states
  const [results, setResults] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFullUrl, setCurrentFullUrl] = useState<string>('');
  
  // Refs to hold latest state values for use in callbacks without triggering dependency changes
  const loadingRef = useRef(loading);
  const searchStateRef = useRef(searchState);
  const totalPagesRef = useRef(totalPages);

  // Keep refs updated with the latest state
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { searchStateRef.current = searchState; }, [searchState]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);
  
  // Stable function references using useCallback
  const updateUrlWithCleanPath = useCallback((params: SearchParams) => {
    let newPath = '';
    
    // Build path-based URL structure
    if (params.category) {
      newPath += `/${params.category}`;
      
      if (params.subcategory) {
        newPath += `/${params.subcategory}`;
        
        if (params.subsubcategory) {
          newPath += `/${params.subsubcategory}`;
        }
      }
    } else {
      // Base search path
      newPath = '/';
    }
    
    // Add any remaining query params
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
    
    // Use replace to avoid excessive history entries during filtering/searching
    router.replace(newPath, { scroll: false });
  }, [router]);
  
  const saveSearchHistory = useCallback((query: string) => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      let history: string[] = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Add only if it doesn't exist and limit to 10 items
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
        // Give daily reward
        const pointsToAdd = 15; // Puntos fijos en lugar de aleatorios
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
  
  // Fetch publications based on search params
  const fetchPublications = useCallback(async (paramsToFetch: SearchParams, isLoadMore: boolean = false) => {
    console.log(`fetchPublications called. isLoadMore: ${isLoadMore}, Page: ${paramsToFetch.page}`);
    setLoading(true);
    if (!isLoadMore) {
      setError(''); // Clear previous errors only on new searches/filters
    }
    
    const maxRetries = 1; // Reduce retries to avoid spam on persistent errors
    let retries = 0;
    let succeeded = false;
    
    while (retries <= maxRetries && !succeeded) {
      try {
        const queryParams: Record<string, string> = {};
        Object.entries(paramsToFetch).forEach(([key, value]) => {
          if (value && key !== 'limit') {
            queryParams[key] = value.toString();
          }
        });
        
        queryParams.limit = paramsToFetch.limit?.toString() || '12';
        
        console.log('Fetching /api/publications with:', queryParams);
        
        const response = await mongoFetch('/api/publications', { queryParams });
        
        if (!response.publications) {
          throw new Error(response.errorFriendly || 'No se encontraron resultados');
        }
        
        const publications = response.publications || [];
        const enhancedPublications: Publication[] = publications.map((pub: unknown): Publication | null => {
          if (!pub || typeof pub !== 'object') return null;
          const potentialPub = pub as ApiPublicationData;

          let locationText = '';
          if (typeof potentialPub.location === 'string') locationText = potentialPub.location;
          else if (potentialPub.location && typeof potentialPub.location === 'object') {
            const loc = potentialPub.location as { city?: string; region?: string };
            locationText = loc.city || '';
            if (loc.region && loc.region !== loc.city) {
              locationText += loc.region ? `, ${loc.region}` : '';
            }
          }

          const id = potentialPub._id?.toString() || potentialPub.id;
          const title = potentialPub.title;
          const createdAt = potentialPub.createdAt || potentialPub.created_at || new Date().toISOString();

          if (!id) return null;
          if (!title) return null;

          const finalPub: Publication = {
            id: id,
            title: title,
            description: typeof potentialPub.description === 'string' ? potentialPub.description : '',
            price: Number(potentialPub.price || 0),
            currency: typeof potentialPub.currency === 'string' ? potentialPub.currency : 'PEN',
            categorySlug: typeof potentialPub.categorySlug === 'string' ? potentialPub.categorySlug : (typeof potentialPub.category === 'string' ? potentialPub.category : 'unknown'),
            location: locationText || 'Ubicación no especificada',
            contactName: typeof potentialPub.contactName === 'string' ? potentialPub.contactName : '',
            contactPhone: typeof potentialPub.contactPhone === 'string' ? potentialPub.contactPhone : undefined,
            status: typeof potentialPub.status === 'string' ? potentialPub.status : 'active',
            createdAt: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
            images: potentialPub.images && Array.isArray(potentialPub.images) ? potentialPub.images : ['/images/placeholder-image.jpg'],
            premium: typeof potentialPub.premium === 'boolean' ? potentialPub.premium : false,
            verified: typeof potentialPub.verified === 'boolean' ? potentialPub.verified : false,
            subcategory: typeof potentialPub.subcategory === 'string' ? potentialPub.subcategory : undefined,
            subsubcategory: typeof potentialPub.subsubcategory === 'string' ? potentialPub.subsubcategory : undefined,
            rating: typeof potentialPub.rating === 'number' ? potentialPub.rating : undefined,
            views: typeof potentialPub.views === 'number' ? potentialPub.views : undefined,
            likes: typeof potentialPub.likes === 'number' ? potentialPub.likes : undefined,
            bookmarks: typeof potentialPub.bookmarks === 'number' ? potentialPub.bookmarks : undefined,
            slug: typeof potentialPub.slug === 'string' ? potentialPub.slug : undefined,
            distance: typeof potentialPub.distance === 'number' ? potentialPub.distance : undefined,
            attributes: typeof potentialPub.attributes === 'object' && potentialPub.attributes !== null ? potentialPub.attributes as Record<string, unknown> : undefined,
            categoryName: typeof potentialPub.categoryName === 'string' ? potentialPub.categoryName : undefined,
          };
          return finalPub;
        }).filter((p: Publication | null): p is Publication => p !== null);
        
        if (isLoadMore) {
          setResults(prevResults => {
            const existingIds = new Set(prevResults.map((item: Publication) => item.id));
            const uniqueNewResults = enhancedPublications.filter((item: Publication) => !existingIds.has(item.id));
            return uniqueNewResults.length > 0 ? [...prevResults, ...uniqueNewResults] : prevResults;
          });
        } else {
          setResults(enhancedPublications);
        }
        
        setTotalResults(response.total || 0);
        setTotalPages(response.pages || 1);
        
        if (!isLoadMore && paramsToFetch.query && enhancedPublications.length > 0) {
          saveSearchHistory(paramsToFetch.query);
        }
        if (!isLoadMore) {
          checkForDailyReward(); // Check reward only on new searches/loads
        }
        
        succeeded = true;
      } catch (err: unknown) {
        retries++;
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error loading publications (attempt ${retries}/${maxRetries}):`, errorMsg);
        
        if (retries > maxRetries) {
          setError(`Error API: ${errorMsg}`);
          if (!isLoadMore) setResults([]); // Clear results only if it's not a load more action
          setTotalPages(1);
          
          toast({
            title: "Error de conexión",
            description: `No se pudo cargar: ${errorMsg}. Intenta más tarde.`,
            variant: "destructive"
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 700 * retries)); // Slightly longer backoff
        }
      }
    }
    setLoading(false);
  }, [toast, saveSearchHistory, checkForDailyReward]);
  
  // Effect for initial load and subsequent searches/filters based on searchState changes
  useEffect(() => {
    console.log("Search state changed, triggering fetch:", searchState);
    fetchPublications(searchState, false); // Always fetch page 1 when searchState changes non-page properties
    
    // Load user points from localStorage only once on mount
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) {
      setUserPoints(parseInt(savedPoints));
    }
  }, [
    searchState.category,
    searchState.subcategory,
    searchState.subsubcategory,
    searchState.query,
    searchState.location,
    searchState.minPrice,
    searchState.maxPrice,
    searchState.sortBy,
    fetchPublications // fetchPublications is stable due to useCallback and its stable dependencies
  ]);
  
  // This effect handles PAGINATION ONLY
  useEffect(() => {
    if (searchState.page > 1) {
      console.log("Page changed to > 1, fetching more:", searchState);
      fetchPublications(searchState, true); // Fetch page > 1
    }
    // Intentionally NOT depending on fetchPublications here if it causes loops.
    // Relying on the fact that page changes *only* via handleLoadMore -> setSearchState
  }, [searchState.page]); // Depend only on page number
  
  // Effect to handle modal state based on URL query param (for direct linking/refresh)
  useEffect(() => {
    const modalId = searchParams?.get('modal');
    if (modalId) {
      console.log("Modal ID found in URL, opening modal:", modalId);
      setSelectedPublicationId(modalId);
      setModalOpen(true);
      if (!currentFullUrl) {
           // Store the URL that triggered the modal open if not already stored
           setCurrentFullUrl(window.location.href);
      }
    } else {
      // If no modal ID in query, ensure modal is closed
      if (modalOpen) {
          console.log("No modal ID in URL, closing modal.");
          setModalOpen(false);
          setSelectedPublicationId(null);
      }
    }
  }, [searchParams, modalOpen, currentFullUrl]); // Re-run if searchParams change
  
  // Handle search input
  const handleSearch = (query: string, options?: Record<string, string>) => {
    const newState = {
      ...searchState,
      query,
      page: 1, // Reset to page 1 with new search
      ...(options || {})
    };
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    // Fetch is handled by the useEffect reacting to searchState change
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: Partial<SearchParams>) => {
    const newState = {
      ...searchState,
      ...filters,
      page: 1 // Reset to page 1 with new filters
    };
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    // Fetch is handled by the useEffect reacting to searchState change
  };
  
  // Function to open the modal
  const handleOpenModal = (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link navigation

    console.log("--- handleOpenModal called ---");
    const id = publication.id;
    console.log("Raw ID received:", id);

    if (!id || !publication.categorySlug) {
      console.error('Cannot open modal: Invalid ID or missing categorySlug', publication);
      toast({
        title: "Error",
        description: "No se pudo generar el enlace para esta publicación.",
        variant: "destructive"
      });
      return;
    }

    // Store the current full URL before changing it
    setCurrentFullUrl(window.location.href);

    // Generate the correct SEO URL
    // **Numeric ID Handling:**
    // If you have a separate numeric field (e.g., publication.numericId),
    // use that here instead of publication.id.
    // For now, we continue using the existing ID (likely MongoDB _id string).
    const seoUrl = generateSeoUrl(
      publication.id, // Use the ID from the publication object
      publication.title,
      publication.categorySlug,
      publication.subcategory,
      publication.subsubcategory,
      true // Include title slug in URL
    );
    console.log("Generated SEO URL:", seoUrl);

    // Update browser URL to the SEO path with the modal query param
    const urlWithModalParam = new URL(seoUrl, window.location.origin); // Use origin as base
    urlWithModalParam.searchParams.set('modal', id);
    const newUrl = urlWithModalParam.toString();
    console.log("Pushing new URL with modal param:", newUrl);
    window.history.pushState({ modalOpen: true, id }, '', newUrl);

    // Update state to show the modal
    console.log("Setting selectedPublicationId:", id);
    setSelectedPublicationId(id);
    setModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    console.log("--- handleCloseModal called ---");
    setModalOpen(false);
    setSelectedPublicationId(null);
    // Restore the previous full URL *without* the modal param
    if (currentFullUrl) {
        const url = new URL(currentFullUrl);
        url.searchParams.delete('modal'); // Remove modal param
        const restoredUrl = url.pathname + url.search; // Keep other query params
        console.log("Restoring URL to:", restoredUrl);
        window.history.pushState(null, '', restoredUrl); // Use pushState to allow going back
        setCurrentFullUrl(''); // Clear the stored URL
    } else {
        // Fallback: go back or clear modal param from current URL
         const url = new URL(window.location.href);
         url.searchParams.delete('modal');
         window.history.pushState(null, '', url.pathname + url.search);
    }
  };
  
  // Render error state
  if (error && !loading && results.length === 0) { // Show error prominently only if no results are loaded
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-slate-900 min-h-screen text-white">
        <div className="bg-gradient-to-br from-red-900/80 to-red-950/80 text-red-100 p-6 rounded-lg shadow-lg border border-red-700 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-300" />
            <h2 className="text-xl font-semibold">Error al cargar los resultados</h2>
          </div>
          <p className="mb-5">No pudimos conectar con nuestra base de datos de anuncios. Por favor, intenta nuevamente en unos momentos.</p>
          <div className="text-sm text-red-300/80 mb-5">
            Información técnica: {error}
          </div>
          <div className="flex gap-3">
            <button
              className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white py-2 px-4 rounded-lg transition-colors"
              onClick={() => fetchPublications(searchState)} // Retry with current state
            >
              Intentar nuevamente
            </button>
            <button
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                const resetState = { ...searchState, query: '', category: '', subcategory: '', subsubcategory: '', location: '', minPrice: '', maxPrice: '', page: 1 };
                setSearchState(resetState);
                updateUrlWithCleanPath(resetState);
              }}
            >
              Buscar sin filtros
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="w-full bg-slate-900 min-h-screen text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Contenedor principal de búsqueda */}
        <SearchLayout
          initialResults={results}
          initialCategory={searchState.category}
          initialSubcategory={searchState.subcategory}
          initialQuery={searchState.query}
          loading={loading}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onLoadMore={undefined}
          hasMore={false}
          totalResults={totalResults}
          showMap={true}
          onPublicationClick={handleOpenModal}
        />
        {/* Display error subtly if results are already shown */}
        {error && loading && results.length > 0 && (
          <div className="mt-4 text-center text-red-400 text-sm">
            Error al cargar más resultados: {error}
          </div>
        )}
      </div>
      
      {/* Modal de recompensa diaria */}
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
      
      {/* Publication Modal - Now rendered here, controlled by BuscadorPage state */}
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