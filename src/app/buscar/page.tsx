// src\app\buscar\page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { mongoFetch } from '@/lib/mongodb-browser';
// import { AlertCircle } from 'lucide-react'; // Removed
import SearchLayout from '@/components/search/SearchLayout';
import { Publication } from '@/components/search/SearchResults';
import { useToast } from '@/components/ui/use-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import PublicationModal from '@/components/search/PublicationModal';
import { generateSeoUrl } from '@/utils/url';
import SearchFilters from "@/components/search/SearchFilters";

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
  subsubcategory?: string; // Add this field
  // Database field names
  subcategorySlug?: string;
  subSubcategorySlug?: string;
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
  slug?: string; // Add slug field
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  
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
  
  // Fetch publications - Simplified, called explicitly now
  const fetchPublications = useCallback(async (paramsToFetch: SearchParams) => {
    console.log(`>>> fetchPublications explicitly called with:`, paramsToFetch);
    setLoading(true);
    setError('');

    // Simplified fetch logic (removed retries for clarity during debug)
    try {
      const queryParams: Record<string, string> = {};
      Object.entries(paramsToFetch).forEach(([key, value]) => {
        if (value && key !== 'limit' && key !== 'page') { // Exclude page/limit
           queryParams[key] = value.toString();
        }
      });
      // No limit needed - API fetches all now
      // queryParams.limit = '0'; 

      console.log('Fetching /api/publications with:', queryParams);
      const response = await mongoFetch('/api/publications', { queryParams });

      if (!response.publications) {
        throw new Error(response.errorFriendly || 'No se encontraron resultados');
      }
      console.log(`API Response: ${response.publications.length} publications, total: ${response.total}`);

      const publications = response.publications || [];
       // ... (mapping logic for enhancedPublications remains the same) ...
       const enhancedPublications: Publication[] = publications.map((pub: unknown): Publication | null => { // Explicit return type
          if (!pub || typeof pub !== 'object') return null;
          const potentialPub = pub as ApiPublicationData; // Use the new interface

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

          // Basic validation
          if (!id) return null;
          if (!title) return null;

          // Explicitly construct the Publication object matching the interface
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

        }).filter((p: Publication | null): p is Publication => p !== null); // Filter out null entries

      setResults(enhancedPublications);
      setTotalResults(response.total || 0);
      setTotalPages(1); // Always 1 page now

      if (paramsToFetch.query && enhancedPublications.length > 0) {
        saveSearchHistory(paramsToFetch.query);
      }
      checkForDailyReward();

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`Error loading publications:`, errorMsg);
      setError(`Error API: ${errorMsg}`);
      setResults([]); // Clear results on error
      setTotalPages(1);
      toast({
        title: "Error de conexión",
        description: `No se pudo cargar: ${errorMsg}. Intenta más tarde.`,
        variant: "destructive"
      });
    } finally {
        setLoading(false);
        setIsInitialLoad(false); // Mark initial load as complete
    }
  }, [toast, saveSearchHistory, checkForDailyReward]); // Removed searchState dependency

  // Effect for initial load ONLY
  useEffect(() => {
    console.log("Initial Load Effect - Fetching initial data...");
    // Fetch initial data based on URL params present on load
    const initialParams: SearchParams = {
        category: searchParams?.get('category') || '',
        subcategory: searchParams?.get('subcategory') || '',
        subsubcategory: searchParams?.get('subsubcategory') || '',
        query: searchParams?.get('q') || '',
        location: searchParams?.get('location') || '',
        minPrice: searchParams?.get('minPrice') || '',
        maxPrice: searchParams?.get('maxPrice') || '',
        sortBy: searchParams?.get('sortBy') || 'recent',
        page: 1, // Always page 1 for initial load
        limit: 0 // API ignores this anyway now
    };
    fetchPublications(initialParams);

    // Load user points
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) setUserPoints(parseInt(savedPoints));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Handle search input - improved to better handle the search functionality
  const handleSearch = (query: string, options?: Record<string, string>) => {
    console.log("handleSearch triggered with query:", query);

    if (!query.trim()) {
      console.log("Empty query, not searching");
      return; // Don't perform empty searches
    }
    
    const newState = {
      ...searchState,
      query,
      page: 1,
      ...(options || {})
    };
    
    // Save to search history immediately when performing a search
    saveSearchHistory(query);
    
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    
    // Always fetch new results when searching
    fetchPublications(newState);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: Partial<SearchParams>) => {
    console.log("handleFilterChange triggered");
    const newState = {
      ...searchState,
      ...filters,
      page: 1
    };
    setSearchState(newState);
    updateUrlWithCleanPath(newState);
    fetchPublications(newState); // Fetch explicitly
  };
  
  // Function to open the modal
  const handleOpenModal = (publication: Publication, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link navigation

    console.log("--- handleOpenModal called ---");
    const id = publication.id;
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

    // Store the current full URL before changing it
    setCurrentFullUrl(window.location.href);

    // Make sure we have a category even if it's missing
    const categorySlug = publication.categorySlug || searchState.category || 'productos';

    // Use database field names or fallback to old names
    const subcategorySlug = publication.subcategorySlug || publication.subcategory || searchState.subcategory;
    const subSubcategorySlug = publication.subSubcategorySlug || publication.subsubcategory || searchState.subsubcategory;

    // Generate the clean SEO URL with all category levels and title
    const seoUrl = generateSeoUrl(
      publication.id,
      publication.title || '',
      publication.slug,
      categorySlug,
      subcategorySlug,
      subSubcategorySlug,
      // If no slug is available, generate one from the title
      !publication.slug
    );
    console.log("Generated SEO URL:", seoUrl);

    // Update browser URL to the clean SEO path without any query parameters
    window.history.pushState({ modalOpen: true, id }, '', seoUrl);

    // Extract contact information (supporting multiple phone numbers)
    const contactPhones: string[] = [];
    if (publication.contactPhone) {
      contactPhones.push(publication.contactPhone);
    }
    
    // Update state to show the modal
    console.log("Setting selectedPublicationId:", id);
    // Convert publication to PublicationWithContact interface before passing
    const enhancedPublication = {
      ...publication,
      contactPhone: publication.contactPhone || '',
      contactPhones: contactPhones.length > 0 ? contactPhones : undefined,
      contact: {
        phone: publication.contactPhone || '',
        phones: contactPhones.length > 0 ? contactPhones : undefined,
        email: publication.contactEmail || '',
        name: publication.contactName || ''
      },
      subcategory: subcategorySlug,
      subsubcategory: subSubcategorySlug,
      categorySlug: categorySlug
    };
    
    setSelectedPublicationId(id);
    setModalOpen(true);
    
    // Store the publication data in window.preloadedPublications for faster retrieval
    if (typeof window !== 'undefined') {
      window.preloadedPublications = window.preloadedPublications || {};
      window.preloadedPublications[id] = enhancedPublication;
    }
  };

  // Function to close the modal
  const handleCloseModal = () => {
    console.log("--- handleCloseModal called ---");
    setModalOpen(false);
    setSelectedPublicationId(null);
    
    // Restore the previous URL without any modal parameters
    if (currentFullUrl) {
      // Parse the URL to extract only the path portion without query parameters
      const url = new URL(currentFullUrl);
      const cleanPath = url.pathname;
      console.log("Restoring URL to:", cleanPath);
      window.history.pushState(null, '', cleanPath);
      setCurrentFullUrl('');
    } else {
      // If no previous URL, just remove any query parameters from current URL
      const url = new URL(window.location.href);
      window.history.pushState(null, '', url.pathname);
    }
  };
  
  // Show loading indicator ONLY on initial load
  if (isInitialLoad && loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Skeleton para barra de búsqueda */}
          <div className="mb-6 w-full bg-slate-800/40 rounded-xl p-4 animate-pulse">
            <div className="h-12 bg-slate-700 rounded-xl w-full"></div>
          </div>
          
          {/* Skeleton para título y controles */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-slate-700 rounded w-64 mb-2"></div>
              <div className="h-5 bg-slate-700 rounded w-40"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-slate-700 rounded"></div>
              <div className="h-10 w-10 bg-slate-700 rounded"></div>
            </div>
          </div>
          
          {/* Layout principal con sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Skeleton del sidebar de filtros */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="h-7 bg-slate-700 rounded w-32 mb-6"></div>
                <div className="space-y-6">
                  <div>
                    <div className="h-5 bg-slate-700 rounded w-24 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-10 bg-slate-700 rounded w-full"></div>
                      <div className="h-10 bg-slate-700 rounded w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-5 bg-slate-700 rounded w-28 mb-3"></div>
                    <div className="h-10 bg-slate-700 rounded w-full"></div>
                  </div>
                  <div>
                    <div className="h-5 bg-slate-700 rounded w-40 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-700 rounded w-full"></div>
                      <div className="h-6 bg-slate-700 rounded w-full"></div>
                      <div className="h-6 bg-slate-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skeleton de resultados */}
            <div className="flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg h-auto animate-pulse">
                    <div className="h-48 bg-slate-700 relative">
                      {/* Efecto shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent shimmer"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-700 rounded w-full"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                        <div className="h-6 bg-slate-700 rounded-full w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="w-full bg-slate-900 min-h-screen text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <SearchLayout
          initialResults={results}
          initialCategory={searchState.category}
          initialSubcategory={searchState.subcategory}
          initialQuery={searchState.query}
          loading={loading && !isInitialLoad}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onLoadMore={undefined}
          hasMore={false}
          totalResults={totalResults}
          showMap={true}
          onPublicationClick={handleOpenModal}
          useEnhancedSearch={true}
        >
          <SearchFilters 
            category={searchState.category || ''} 
            activeFilters={searchState}
            onFiltersChange={setSearchState}
          />
        </SearchLayout>
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