'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic as MicOutline, Camera as CameraOutline } from 'lucide-react'
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  FireIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { 
  MagnifyingGlassIcon as MagnifyingGlassSolid, 
  FireIcon as FireSolid 
} from '@heroicons/react/24/solid'
import { categories } from '@/data/mockCategories'
import useMediaQuery from '@/hooks/useMediaQuery'

interface Suggestion {
  text: string
  categoryId: string
  subTypeId: string
  score?: number
  trending?: boolean
  isAI?: boolean
}

interface SearchOptions {
  category?: string;
  location?: string;
  filters?: Record<string, unknown>;
}

interface SearchBarProps {
  initialValue?: string
  onSearch: (query: string, options?: SearchOptions) => void
  selectedCategory?: string
  onSelectCategory?: (category: string) => void
  placeholder?: string
  className?: string
  isMobile?: boolean
  isAnimated?: boolean
}

const generateSuggestions = () => {
  const suggestions: Suggestion[] = []
  categories.forEach(category => {
    category.types.forEach(type => {
      suggestions.push({
        text: `${type.name} en ${category.name}`,
        categoryId: category.id,
        subTypeId: type.id,
        score: 100,
        trending: false
      })
    })
  })
  return suggestions.slice(0, 8) // Limitamos a 8 sugerencias
}

const SUGGESTIONS = generateSuggestions()

export default function SearchBar({ 
  initialValue = '', 
  onSearch, 
  selectedCategory,
  onSelectCategory,
  placeholder = "¿Qué estás buscando hoy?",
  className = "",
  isMobile = false,
  isAnimated = true
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(SUGGESTIONS)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<Suggestion[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")
  const [animationComplete, setAnimationComplete] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const isMd = useMediaQuery('(min-width: 768px)')
  const searchBarSize = isMobile ? 'compact' : 'full'

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const savedSearches = localStorage.getItem('recentSearches')
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5))
    }

    // Simulamos cargar búsquedas tendencia
    const trending = SUGGESTIONS.filter(s => s.categoryId).map(s => ({
      ...s,
      score: 90,
      trending: true
    })).slice(0, 3);
    setTrendingSearches(trending)

    // Simular sugerencias de IA
    const aiSuggestions = [
      "Departamentos cerca de universidades",
      "Trabajos de medio tiempo en tecnología",
      "Autos económicos con buen rendimiento"
    ].map(text => ({
      text,
      categoryId: "",
      subTypeId: "",
      isAI: true
    }))

    // Añadimos sugerencias de IA a las normales
    setFilteredSuggestions([...SUGGESTIONS.slice(0, 5), ...aiSuggestions])
    
    if (isAnimated) {
      // Simular tiempo de carga para la animación
      const timer = setTimeout(() => setAnimationComplete(true), 800)
      return () => clearTimeout(timer)
    } else {
      setAnimationComplete(true)
    }
  }, [isAnimated])

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(SUGGESTIONS)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !inputRef.current?.contains(event.target as Node) &&
        !suggestionsRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(!isRecording)
      
      // Simulación de reconocimiento de voz
      if (!isRecording) {
        setTimeout(() => {
          const simulatedText = "departamentos en alquiler"
          setSearchTerm(simulatedText)
          setRecognizedText(simulatedText)
          setIsRecording(false)
          
          // Auto-submit después de reconocimiento
          setTimeout(() => {
            onSearch(simulatedText)
          }, 1000)
        }, 2000)
      }
    } else {
      alert("Lo sentimos, tu navegador no soporta reconocimiento de voz")
    }
  }

  const handleImageSearch = () => {
    // Simular carga de imagen para búsqueda
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.click()
    
    fileInput.onchange = () => {
      if (fileInput.files && fileInput.files[0]) {
        // Simular procesamiento y búsqueda con la imagen
        setTimeout(() => {
          setSearchTerm("búsqueda por imagen")
          onSearch("búsqueda por imagen", { type: 'image' })
        }, 1000)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm)
      
      // Guardar en búsquedas recientes
      const updatedSearches = [
        searchTerm,
        ...recentSearches.filter(s => s !== searchTerm)
      ].slice(0, 5)
      
      setRecentSearches(updatedSearches)
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
      
      setIsFocused(false)
    }
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.text)
    
    if (suggestion.categoryId && onSelectCategory) {
      onSelectCategory(suggestion.categoryId)
    }
    
    onSearch(suggestion.text, { 
      category: suggestion.categoryId,
      subType: suggestion.subTypeId
    })
    
    // Guardar en búsquedas recientes
    const updatedSearches = [
      suggestion.text,
      ...recentSearches.filter(s => s !== suggestion.text)
    ].slice(0, 5)
    
    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
    
    setIsFocused(false)
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={isAnimated ? { opacity: 0, y: -10 } : {}}
      animate={isAnimated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          {/* Input de búsqueda con degradado en el borde */}
          <div className="relative group">
            {/* Efecto de brillo */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-70 group-focus-within:opacity-100 blur transition duration-300"></div>
            
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full shadow-lg group-hover:shadow-cyan-500/20 transition duration-300">
              {/* Icono de categoría (si está seleccionada) */}
              {selectedCategory && !isMobile && (
                <div className="flex-shrink-0 pl-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    {selectedCategory}
                  </span>
                </div>
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder={placeholder}
                className="flex-grow py-3 px-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                disabled={isRecording}
              />
              
              {searchTerm && (
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              {!isMobile && (
                <>
                  {/* Botón de búsqueda por voz */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-2 rounded-full ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    aria-label="Búsqueda por voz"
                  >
                    <MicOutline className="h-5 w-5" />
                  </button>
                  
                  {/* Botón de búsqueda por imagen */}
                  <button
                    type="button"
                    onClick={handleImageSearch}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Búsqueda por imagen"
                  >
                    <CameraOutline className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Botón de búsqueda */}
              <button
                type="submit"
                className="flex-shrink-0 ml-1 mr-1 p-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition duration-300 transform hover:scale-105"
                aria-label="Buscar"
              >
                <MagnifyingGlassSolid className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Texto de reconocimiento de voz */}
          {isRecording && (
            <motion.div 
              className="absolute left-0 right-0 -bottom-8 text-center text-sm text-teal-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Escuchando... {recognizedText && <span className="font-medium">&quot;{recognizedText}&quot;</span>}
            </motion.div>
          )}
        </div>

        {/* Panel de sugerencias */}
        <AnimatePresence>
          {isFocused && animationComplete && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-[calc(100%+0.75rem)] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
            >
              {/* Panel de búsquedas recientes */}
              {recentSearches.length > 0 && !searchTerm && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Búsquedas recientes
                    </h3>
                    <button 
                      className="text-xs text-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
                      onClick={() => {
                        setRecentSearches([])
                        localStorage.removeItem('recentSearches')
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(term)
                          onSearch(term)
                          setIsFocused(false)
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Panel de búsquedas tendencia */}
              {trendingSearches.length > 0 && !searchTerm && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mb-2">
                    <FireSolid className="h-4 w-4 mr-1 text-orange-500" />
                    Tendencias
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trendingSearches.map((trend, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionSelect(trend)}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors group"
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs mr-3 group-hover:bg-teal-100 dark:group-hover:bg-teal-900 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{trend.text}</span>
                        </div>
                        
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center">
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-0.5" />
                          {trend.score}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sugerencias basadas en el término de búsqueda */}
              {filteredSuggestions.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mb-3">
                    {searchTerm ? (
                      <>
                        <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                        Resultados para &quot;{searchTerm}&quot;
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-1 text-teal-500" />
                        Sugerencias para ti
                      </>
                    )}
                  </h3>
                  
                  <div className="space-y-2">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center">
                          {suggestion.isAI ? (
                            <div className="flex-shrink-0 p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mr-3">
                              <SparklesIcon className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 p-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full mr-3">
                              <MagnifyingGlassIcon className="h-4 w-4" />
                            </div>
                          )}
                          <span className="text-slate-700 dark:text-slate-300">
                            {suggestion.isAI ? (
                              <span className="flex items-center">
                                {suggestion.text}
                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">IA</span>
                              </span>
                            ) : (
                              suggestion.text
                            )}
                          </span>
                        </div>
                        
                        {suggestion.categoryId && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {suggestion.categoryId}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mensaje cuando no hay resultados */}
              {searchTerm && filteredSuggestions.length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                    <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No encontramos resultados para &quot;{searchTerm}&quot;</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
} 