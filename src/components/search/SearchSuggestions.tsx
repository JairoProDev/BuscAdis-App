'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Clock, Tag, Filter, MapPin, Star, Flame } from 'lucide-react'

interface SearchSuggestionsProps {
  searchTerm: string
  onSelectSuggestion: (suggestion: string) => void
  appearance?: 'light' | 'dark'
  position?: 'top' | 'bottom'
  compact?: boolean
}

interface SuggestionItem {
  text: string
  type: 'autocomplete' | 'trending' | 'history' | 'ai'
  category?: string
  categoryIcon?: string
  count?: number
}

export default function SearchSuggestions({
  searchTerm,
  onSelectSuggestion,
  appearance = 'light',
  position = 'bottom',
  compact = false,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [trendingSearches, setTrendingSearches] = useState<SuggestionItem[]>([])
  const [searchHistory, setSearchHistory] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Fetch suggestions from API based on search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`)
        const data = await response.json()
        
        if (data.suggestions) {
          setSuggestions(data.suggestions.map((text: string) => ({
            text,
            type: 'autocomplete'
          })))
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Debounce to avoid excessive API calls
    const handler = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(handler)
  }, [searchTerm])
  
  // Load trending searches on component mount
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch('/api/search/trending')
        const data = await response.json()
        
        if (data.trending) {
          setTrendingSearches(data.trending.map((text: string) => ({
            text,
            type: 'trending'
          })))
        }
      } catch (error) {
        console.error('Error fetching trending searches:', error)
      }
    }
    
    fetchTrendingSearches()
  }, [])
  
  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setSearchHistory(parsedHistory.map((text: string) => ({
          text,
          type: 'history'
        })))
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }, [])
  
  // Prepare all items to display
  const allItems = [
    ...(searchTerm ? suggestions.map((item, index) => ({ ...item, dataIndex: index })) : []),
    ...(!searchTerm ? trendingSearches.map((item, index) => ({ ...item, dataIndex: suggestions.length + index })) : []),
    ...(!searchTerm ? searchHistory.map((item, index) => ({ ...item, dataIndex: suggestions.length + trendingSearches.length + index })) : [])
  ]
  
  // Generate more AI suggestions based on current context
  const aiSuggestions = useMemo(() => {
    // Inmuebles
    const inmuebles = [
      { text: "Departamentos con vista al mar", type: 'ai' as const, category: 'inmuebles', dataIndex: allItems.length },
      { text: "Casas en venta con jardín", type: 'ai' as const, category: 'inmuebles', dataIndex: allItems.length + 1 },
      { text: "Oficinas en alquiler centro", type: 'ai' as const, category: 'inmuebles', dataIndex: allItems.length + 2 },
      { text: "Terrenos construcción cerca ciudad", type: 'ai' as const, category: 'inmuebles', dataIndex: allItems.length + 3 },
    ];
    
    // Vehículos
    const vehiculos = [
      { text: "Autos familiares económicos", type: 'ai' as const, category: 'vehiculos', dataIndex: allItems.length + 4 },
      { text: "Motos usadas buen estado", type: 'ai' as const, category: 'vehiculos', dataIndex: allItems.length + 5 },
      { text: "Camionetas 4x4 seminuevas", type: 'ai' as const, category: 'vehiculos', dataIndex: allItems.length + 6 },
      { text: "Autos eléctricos segunda mano", type: 'ai' as const, category: 'vehiculos', dataIndex: allItems.length + 7 },
    ];
    
    // Tecnología
    const tecnologia = [
      { text: "Teléfonos móviles gama alta", type: 'ai' as const, category: 'tecnologia', dataIndex: allItems.length + 8 },
      { text: "Laptops para estudiantes", type: 'ai' as const, category: 'tecnologia', dataIndex: allItems.length + 9 },
      { text: "Cámaras digitales profesionales", type: 'ai' as const, category: 'tecnologia', dataIndex: allItems.length + 10 },
      { text: "Smartwatches con GPS", type: 'ai' as const, category: 'tecnologia', dataIndex: allItems.length + 11 },
    ];
    
    // Hogar
    const hogar = [
      { text: "Muebles oficina ergonómicos", type: 'ai' as const, category: 'hogar', dataIndex: allItems.length + 12 },
      { text: "Electrodomésticos eficientes", type: 'ai' as const, category: 'hogar', dataIndex: allItems.length + 13 },
      { text: "Muebles exterior resistentes agua", type: 'ai' as const, category: 'hogar', dataIndex: allItems.length + 14 },
      { text: "Colchones ortopédicos nuevos", type: 'ai' as const, category: 'hogar', dataIndex: allItems.length + 15 },
    ];
    
    // Empleos
    const empleos = [
      { text: "Trabajos remotos programación", type: 'ai' as const, category: 'empleos', dataIndex: allItems.length + 16 },
      { text: "Empleos medio tiempo estudiantes", type: 'ai' as const, category: 'empleos', dataIndex: allItems.length + 17 },
      { text: "Ofertas trabajo sin experiencia", type: 'ai' as const, category: 'empleos', dataIndex: allItems.length + 18 },
      { text: "Vacantes bilingües marketing", type: 'ai' as const, category: 'empleos', dataIndex: allItems.length + 19 },
    ];
    
    // Servicios
    const servicios = [
      { text: "Clases particulares matemáticas", type: 'ai' as const, category: 'servicios', dataIndex: allItems.length + 20 },
      { text: "Técnicos reparación emergencias", type: 'ai' as const, category: 'servicios', dataIndex: allItems.length + 21 },
      { text: "Cuidadores mascotas fines semana", type: 'ai' as const, category: 'servicios', dataIndex: allItems.length + 22 },
      { text: "Diseñadores web freelance", type: 'ai' as const, category: 'servicios', dataIndex: allItems.length + 23 },
    ];
    
    return [...inmuebles, ...vehiculos, ...tecnologia, ...hogar, ...empleos, ...servicios];
  }, [allItems.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!suggestionsRef.current) return
      
      const totalItems = suggestions.length + trendingSearches.length + searchHistory.length + aiSuggestions.length
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0) {
            const allItems = [
              ...suggestions,
              ...trendingSearches,
              ...searchHistory,
              ...aiSuggestions
            ]
            const selectedItem = allItems[highlightedIndex]
            if (selectedItem) {
              onSelectSuggestion(selectedItem.text)
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, trendingSearches, searchHistory, highlightedIndex, onSelectSuggestion, aiSuggestions])
  
  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      highlightedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])
  
  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions, trendingSearches, searchHistory])
  
  // Función para seleccionar aleatoriamente 10 sugerencias de la lista completa
  const getRandomizedAiSuggestions = () => {
    if (aiSuggestions.length === 0) return [];
    
    // Desordenar la lista
    const shuffled = [...aiSuggestions].sort(() => Math.random() - 0.5);
    
    // Tomar los primeros 10 elementos (o menos si no hay suficientes)
    return shuffled.slice(0, 10);
  };
  
  // Obtener sugerencias IA aleatorizadas
  const randomizedAiSuggestions = getRandomizedAiSuggestions();
  
  // Add AI suggestions to all items
  // const displayItems = [...allItems, ...randomizedAiSuggestions];
  
  // Quick filters
  const quickFilters = [
    { id: 'location', label: 'Ubicación', icon: <MapPin className="h-3 w-3" /> },
    { id: 'price', label: 'Precio', icon: <Tag className="h-3 w-3" /> },
    { id: 'rating', label: 'Valoración', icon: <Star className="h-3 w-3" /> },
    { id: 'new', label: 'Más recientes', icon: <Flame className="h-3 w-3" /> },
  ]
  
  // Mock exclusive offers
  const exclusiveOffers = [
    "¡30% descuento en adisos destacados!",
    "Publica gratis durante este fin de semana",
    "Destaca tu adiso con fotos premium"
  ]
  
  // Calculate max height based on content and compact mode
  const getMaxHeight = () => {
    if (compact) {
      // In compact mode, we use a fixed smaller height
      return 280;
    }
    
    let height = 0;
    
    if (loading) height += 50;
    if (searchTerm && suggestions.length === 0 && !loading) height += 50;
    if (searchTerm && suggestions.length > 0) height += 40 + Math.min(suggestions.length, 5) * 40;
    
    if (!searchTerm) {
      // Add height for exclusive offers
      height += 70;
      // Add height for quick filters
      height += 50;
      
      if (trendingSearches.length > 0) height += 70;
      if (searchHistory.length > 0) height += 70;
      if (aiSuggestions.length > 0) height += 100;
    }
    
    return Math.min(height, 400);
  };
  
  // Manejar clic en sugerencia de forma segura
  const handleSuggestionClick = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation(); // Detener la propagación del evento para evitar que se cierre el panel
    onSelectSuggestion(text);
  };
  
  if (!searchTerm && !trendingSearches.length && !searchHistory.length && !aiSuggestions.length) return null;
  
  return (
    <motion.div
      ref={suggestionsRef}
      initial={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position === 'top' ? -10 : 10 }}
      transition={{ duration: 0.15 }}
      className={`absolute z-50 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-full overflow-y-auto rounded-xl shadow-xl ${
        appearance === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-900'
      } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
      style={{ 
        maxHeight: `${getMaxHeight()}px`,
        scrollbarWidth: 'thin', 
        scrollbarColor: appearance === 'dark' ? '#334155 #1e293b' : '#e2e8f0 #f8fafc' 
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()} // Evitar que el evento mousedown llegue al documento
    >
      <div 
        className={`${compact ? 'p-1.5' : 'p-2'} ${compact ? 'space-y-1.5' : 'space-y-3'}`}
        onMouseDown={(e) => e.preventDefault()} // Detener la propagación también aquí
      >
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm">Buscando sugerencias...</span>
          </div>
        )}
        
        {/* No results message */}
        {searchTerm && !loading && suggestions.length === 0 && (
          <div className="py-1 text-center text-sm opacity-70">
            No se encontraron sugerencias para &quot;{searchTerm}&quot;
          </div>
        )}
        
        {/* Autocomplete suggestions */}
        {searchTerm && suggestions.length > 0 && (
          <div className="space-y-1" onMouseDown={(e) => e.preventDefault()}>
            <div className="flex items-center mb-1">
              <Search className="h-4 w-4 mr-1 text-blue-500" />
              <h3 className="text-sm font-medium">Sugerencias</h3>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, compact ? 8 : suggestions.length).map((item, index) => (
                <li 
                  key={`suggestion-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                  data-index={index}
                  onClick={(e) => handleSuggestionClick(e, item.text)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`flex items-center gap-1.5 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg cursor-pointer text-sm ${
                    highlightedIndex === index 
                      ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                      : 'hover:bg-opacity-10 hover:bg-white'
                  }`}
                >
                  <Search className="h-4 w-4 opacity-70 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Non-search content: Filters, Trending, History, AI suggestions */}
        {!searchTerm && (
          <>
            {/* Quick filters */}
            <div className={`${!compact ? 'border-b pb-2 mb-2' : ''}`} onMouseDown={(e) => e.preventDefault()}>
              <div className="flex items-center mb-1">
                <Filter className="h-4 w-4 mr-1 text-blue-500" />
                <h3 className="text-sm font-medium">Filtros rápidos</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFilter(filter.id === selectedFilter ? null : filter.id);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-full transition-colors ${
                      selectedFilter === filter.id
                        ? appearance === 'dark' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700'
                        : appearance === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600'
                          : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main content sections in horizontal layout if compact */}
            <div className={`${compact ? 'grid grid-cols-3 gap-2' : 'space-y-3'}`}>
              {/* Search history */}
              {searchHistory.length > 0 && (
                <div className="space-y-1.5" onMouseDown={(e) => e.preventDefault()}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-blue-500" />
                      <h3 className="text-sm font-medium">Recientes</h3>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.removeItem('searchHistory');
                        setSearchHistory([]);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className="text-xs opacity-60 hover:opacity-100"
                      aria-label="Borrar historial de búsquedas"
                      title="Borrar historial de búsquedas"
                    >
                      Borrar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.slice(0, compact ? 4 : searchHistory.length).map((item, index) => (
                      <div 
                        key={`history-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                        data-index={suggestions.length + trendingSearches.length + index}
                        className={`flex items-center ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full cursor-pointer ${
                          highlightedIndex === (suggestions.length + trendingSearches.length + index)
                            ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                            : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                        } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => handleSuggestionClick(e, item.text)}
                      >
                        <Clock className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} opacity-70 mr-1.5`} />
                        <span className="truncate">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI suggestions */}
              {randomizedAiSuggestions.length > 0 && (
                <div className="space-y-1.5" onMouseDown={(e) => e.preventDefault()}>
                  <div className="flex items-center">
                    <span className="text-lg mr-1">✨</span>
                    <h3 className="text-sm font-medium">Sugerencias IA</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {randomizedAiSuggestions.slice(0, compact ? 4 : 8).map((item) => (
                      <button
                        key={`ai-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                        data-index={item.dataIndex}
                        onClick={(e) => handleSuggestionClick(e, item.text)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full cursor-pointer ${
                          highlightedIndex === item.dataIndex
                            ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                            : appearance === 'dark' ? 'bg-gradient-to-r from-slate-800 to-purple-900/30 hover:from-slate-700 hover:to-purple-900/50' : 'bg-gradient-to-r from-slate-50 to-purple-50 hover:from-slate-100 hover:to-purple-100'
                        } border ${appearance === 'dark' ? 'border-purple-500/30' : 'border-purple-200'}`}
                                              >
                        <span className={`${compact ? 'text-sm' : 'text-base'}`}>✨</span>
                        <span className="truncate">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches */}
              {trendingSearches.length > 0 && (
                <div className="space-y-1.5" onMouseDown={(e) => e.preventDefault()}>
                  <div className="flex items-center mb-1">
                    <TrendingUp className="h-4 w-4 mr-1 text-rose-500" />
                    <h3 className="text-sm font-medium">Tendencias</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingSearches.slice(0, compact ? 4 : trendingSearches.length).map((item, index) => (
                      <button 
                        key={`trending-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                        data-index={suggestions.length + index}
                        onClick={(e) => handleSuggestionClick(e, item.text)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full cursor-pointer ${
                          highlightedIndex === (suggestions.length + index)
                            ? appearance === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                            : appearance === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                        } border ${appearance === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                      >
                        <TrendingUp className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-rose-500`} />
                        <span className="truncate">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exclusive offers - only shown in non-compact mode or if specifically wanted */}
            {!compact && (
              <div 
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2 mb-2"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-center mb-1">
                  <Tag className="h-4 w-4 mr-1 text-blue-500" />
                  <h3 className="text-sm font-medium">Ofertas exclusivas</h3>
                </div>
                <div className="space-y-1">
                  {exclusiveOffers.map((offer) => (
                    <div 
                      key={`offer-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`}
                      className="flex items-center gap-2 text-sm"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      <span>{offer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
} 