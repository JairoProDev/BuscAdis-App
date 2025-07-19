'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, MicOff, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions from './SearchSuggestions';
import { cn } from '@/lib/utils';

interface EnhancedSearchInputProps {
  initialValue?: string;
  appearance?: 'light' | 'dark';
  onSearch: (query: string, selectedImage?: File | null) => void;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  suggestionsPosition?: 'top' | 'bottom';
  showVoiceSearch?: boolean;
  showImageSearch?: boolean;
  showAiAssist?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
  compactSuggestions?: boolean;
}

export default function EnhancedSearchInput({
  initialValue = '',
  appearance = 'dark',
  onSearch,
  className = '',
  autoFocus = false,
  showSuggestions = true,
  suggestionsPosition = 'bottom',
  showVoiceSearch = true,
  showImageSearch = false,
  showAiAssist = true,
  onFocusChange,
  compactSuggestions = true,
}: EnhancedSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      setShowSuggestionsPanel(true);
    }
  }, [autoFocus]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestionsPanel(false);
        if (onFocusChange) {
          onFocusChange(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onFocusChange]);
  
  // Update onFocusChange when suggestions panel visibility changes
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(showSuggestionsPanel);
    }
  }, [showSuggestionsPanel, onFocusChange]);
  
  // Reset component when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm, selectedImage);
      
      // Save to search history
      try {
        const savedHistory = localStorage.getItem('searchHistory') || '[]';
        const parsedHistory = JSON.parse(savedHistory);
        
        // Add to beginning of array and keep only unique values
        const newHistory = [searchTerm, ...parsedHistory.filter((item: string) => item !== searchTerm)].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving to search history:', error);
      }
    }
  };
  
  // Handler para seleccionar una sugerencia
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    
    // Ejecutar búsqueda automáticamente cuando se selecciona una sugerencia
    setTimeout(() => {
      onSearch(suggestion, null);
    }, 100);
  };
  
  const handleClearInput = () => {
    setSearchTerm('');
    setSelectedImage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const startVoiceSearch = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceError('');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setVoiceError('No se pudo iniciar el reconocimiento de voz');
    }
  };

  const stopVoiceSearch = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };
  
  const handleImageSearch = () => {
    setIsImageSearchActive(!isImageSearchActive);
    if (!isImageSearchActive && imageInputRef.current) {
      imageInputRef.current.click();
    } else {
      setSelectedImage(null);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor sube una imagen de menos de 5MB.');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube un archivo de imagen válido (JPG, PNG, etc.).');
      return;
    }
    
    setSelectedImage(file);
  };
  
  const handleAiAssist = () => {
    setIsAiThinking(true);
    
    // Simulación de procesamiento AI y generación de sugerencias contextuales
    setTimeout(() => {
      // Lista ampliada de sugerencias por categorías
      const suggestionsByCategory: Record<string, string[]> = {
        // Inmuebles
        inmuebles: [
          "Departamentos con vista al mar en Lima",
          "Casas con jardín cerca de colegios",
          "Oficinas en alquiler zona financiera",
          "Locales comerciales en avenidas principales",
          "Terrenos para construcción con servicios",
          "Departamentos amueblados para estudiantes",
          "Casas de campo a menos de 1 hora de la ciudad",
          "Habitaciones para estudiantes cerca de universidades",
          "Departamentos pet friendly con terraza",
          "Oficinas de coworking por día",
          "Estacionamientos en venta zona residencial",
          "Terrenos industriales cerca de carreteras principales"
        ],
        // Vehículos
        vehiculos: [
          "Autos familiares económicos en combustible",
          "Camionetas 4x4 para trabajo pesado",
          "Motos usadas en buen estado",
          "Autos híbridos de segunda mano",
          "Furgonetas para reparto a buen precio",
          "Autos clásicos restaurados",
          "Camiones pequeños para mudanzas",
          "Motos de alta cilindrada",
          "Autos automáticos con poco kilometraje",
          "Vehículos con sistema GPS integrado",
          "Motos scooter para ciudad",
          "Camionetas con asientos para niños"
        ],
        // Empleos
        empleos: [
          "Trabajos de medio tiempo en tecnología",
          "Empleos de marketing digital con inglés",
          "Vacantes para desarrolladores web remotos",
          "Puestos administrativos sin experiencia",
          "Empleos en educación con horario flexible",
          "Trabajos para estudiantes fin de semana",
          "Oportunidades en startups con beneficios",
          "Empleos de atención al cliente bilingües",
          "Puestos en logística y distribución",
          "Trabajos para profesionales de la salud",
          "Empleos en hostelería temporada alta",
          "Oportunidades para diseñadores freelance"
        ],
        // Electrónica y tecnología
        tecnologia: [
          "Laptops para estudiantes bajo presupuesto",
          "Smartphones con buena cámara usados",
          "Tablets para diseño gráfico",
          "Consolas de videojuegos última generación",
          "Televisores Smart TV 4K en oferta",
          "Cámaras fotográficas profesionales",
          "Auriculares inalámbricos calidad/precio",
          "Componentes para PC gaming",
          "Impresoras multifunción para oficina",
          "Drones con cámara estabilizada",
          "Monitores ultrawide para trabajo",
          "Dispositivos smart home económicos"
        ],
        // Servicios
        servicios: [
          "Servicios de limpieza por horas",
          "Profesores particulares a domicilio",
          "Técnicos de reparación electrodomésticos",
          "Servicios de catering para eventos pequeños",
          "Abogados consulta online",
          "Contadores para pequeñas empresas",
          "Diseñadores web freelance",
          "Fotógrafos para eventos familiares",
          "Servicios de jardinería semanal",
          "Plomeros con disponibilidad inmediata",
          "Electricistas certificados",
          "Servicios de traducción urgentes"
        ],
        // Hogar y muebles
        hogar: [
          "Muebles de oficina ergonómicos",
          "Sofás cama para espacios pequeños",
          "Cocinas integrales a medida",
          "Electrodomésticos seminuevos garantizados",
          "Mesas extensibles para comedores",
          "Camas con almacenamiento inferior",
          "Sillas de oficina con soporte lumbar",
          "Muebles de exterior resistentes",
          "Lámparas de diseño económicas",
          "Armarios modulares para habitaciones",
          "Juegos de comedor para familias grandes",
          "Escritorios minimalistas para home office"
        ],
        // Categoría general
        general: [
          "Artículos deportivos poco uso",
          "Instrumentos musicales para principiantes",
          "Ropa de marca segunda mano",
          "Libros universitarios actualizados",
          "Bicicletas urbanas ligeras",
          "Juguetes educativos por edad",
          "Herramientas profesionales de construcción",
          "Artículos para mascotas grandes",
          "Maquinaria para pequeños negocios",
          "Artículos coleccionables vintage",
          "Equipamiento para gimnasio en casa",
          "Productos orgánicos y ecológicos"
        ]
      };
      
      // Identificar la categoría seleccionada (esto sería implementado según la estructura de tu app)
      // Por ahora simulamos una detección básica basada en el último término buscado o una categoría por defecto
      let detectedCategory = 'general';
      
      try {
        // Intentar obtener la última búsqueda para inferir interés
        const lastSearches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const lastSearch = lastSearches[0]?.toLowerCase() || '';
        
        // Lógica simple para inferir la categoría por palabras clave
        if (lastSearch.includes('departamento') || lastSearch.includes('casa') || lastSearch.includes('alquiler') || 
            lastSearch.includes('terreno') || lastSearch.includes('oficina')) {
          detectedCategory = 'inmuebles';
        } else if (lastSearch.includes('auto') || lastSearch.includes('moto') || lastSearch.includes('camioneta') || 
                  lastSearch.includes('vehículo') || lastSearch.includes('coche')) {
          detectedCategory = 'vehiculos';
        } else if (lastSearch.includes('trabajo') || lastSearch.includes('empleo') || lastSearch.includes('vacante') || 
                  lastSearch.includes('curriculum') || lastSearch.includes('salario')) {
          detectedCategory = 'empleos';
        } else if (lastSearch.includes('laptop') || lastSearch.includes('smartphone') || lastSearch.includes('tablet') || 
                  lastSearch.includes('electrónica') || lastSearch.includes('gadget')) {
          detectedCategory = 'tecnologia';
        } else if (lastSearch.includes('limpieza') || lastSearch.includes('servicio') || lastSearch.includes('técnico') || 
                  lastSearch.includes('reparación') || lastSearch.includes('profesional')) {
          detectedCategory = 'servicios';
        } else if (lastSearch.includes('mueble') || lastSearch.includes('sofá') || lastSearch.includes('mesa') || 
                  lastSearch.includes('cama') || lastSearch.includes('silla')) {
          detectedCategory = 'hogar';
        }
      } catch (error) {
        console.error('Error al analizar historial de búsqueda:', error);
        // Mantener categoría general por defecto
      }
      
      // Seleccionar sugerencias de la categoría detectada y algunas generales
      const categorySpecificSuggestions = suggestionsByCategory[detectedCategory] || [];
      const generalSuggestions = suggestionsByCategory.general;
      
      // Combinar y mezclar 
      const combinedSuggestions = [
        ...categorySpecificSuggestions,
        ...generalSuggestions.slice(0, 4) // Agregar algunas sugerencias generales
      ];
      
      // Desordenar el array para mostrar resultados aleatorios
      const shuffledSuggestions = combinedSuggestions.sort(() => Math.random() - 0.5);
      
      // Seleccionar una sugerencia aleatoria
      const randomSuggestion = shuffledSuggestions[Math.floor(Math.random() * shuffledSuggestions.length)];
      
      // Solo mostrar la sugerencia en el campo de búsqueda sin ejecutar la búsqueda
      setSearchTerm(randomSuggestion);
      setIsAiThinking(false);
      
      // Enfocar el campo de búsqueda para mejorar UX
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1500);
  };
  
  return (
    <div ref={searchContainerRef} className={cn('relative w-full max-w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-full">
          <div className={cn(
            'group flex items-center w-full rounded-2xl transition-all duration-300',
            'backdrop-blur-sm shadow-lg hover:shadow-xl',
            appearance === 'dark'
              ? [
                  isListening 
                    ? 'bg-red-900/40 ring-2 ring-red-500/50 shadow-red-900/30'
                    : 'bg-slate-800/40 hover:bg-slate-800/60',
                  !isListening && 'ring-2 ring-teal-500/40 hover:ring-teal-400/60',
                  !isListening && 'shadow-teal-900/20 hover:shadow-teal-900/30'
                ]
              : [
                  isListening 
                    ? 'bg-red-50/80 ring-2 ring-red-400/50 shadow-red-200/30'
                    : 'bg-white/80 hover:bg-white/90',
                  !isListening && 'ring-2 ring-teal-500/40 hover:ring-teal-400/60',
                  !isListening && 'shadow-teal-200/20 hover:shadow-teal-200/30'
                ],
            isAiThinking && !isListening && 'ring-2 ring-purple-500/50',
            showSuggestionsPanel && !isListening && 'ring-2 ring-teal-500/50'
          )}>
            {/* Search Icon with Animation */}
            <motion.div 
              className="flex-shrink-0 pl-5"
              animate={{ 
                scale: isAiThinking ? [1, 1.1, 1] : 1,
                rotate: isAiThinking ? [0, 180, 360] : 0
              }}
              transition={{ 
                duration: 2,
                repeat: isAiThinking ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Search className={cn(
                'w-5 h-5 transition-colors duration-300',
                appearance === 'dark' 
                  ? 'text-teal-400 group-hover:text-teal-300' 
                  : 'text-teal-500 group-hover:text-teal-600'
              )} />
            </motion.div>

            {/* Input Field with Enhanced Styling */}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestionsPanel(true)}
              placeholder="¿Qué estás buscando?"
              aria-label="Campo de búsqueda"
              className={cn(
                'w-full px-4 py-4 bg-transparent border-0',
                'text-lg placeholder:text-sm',
                'focus:ring-0 focus:outline-none',
                'transition-all duration-300',
                appearance === 'dark' 
                  ? [
                      isListening 
                        ? 'text-red-300 placeholder:text-red-400'
                        : 'text-white placeholder:text-slate-400',
                      'group-hover:placeholder:text-slate-300'
                    ]
                  : [
                      isListening 
                        ? 'text-red-700 placeholder:text-red-500'
                        : 'text-slate-900 placeholder:text-slate-400',
                      'group-hover:placeholder:text-slate-500'
                    ]
              )}
              disabled={isListening}
            />

            {/* Action Buttons Container */}
            <div className="flex items-center gap-2 pr-4">
              {/* Clear Button */}
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  type="button"
                  onClick={handleClearInput}
                  title="Limpiar búsqueda"
                  className={cn(
                    'p-2 rounded-full transition-all duration-300',
                    'hover:bg-slate-200/20 active:bg-slate-200/30',
                    appearance === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              {/* Separator Line */}
              <div className={cn(
                'h-6 w-px mx-1',
                appearance === 'dark' 
                  ? 'bg-slate-700/50' 
                  : 'bg-slate-200'
              )} />

              {/* Voice Search Button with Enhanced UX */}
              {showVoiceSearch && (
                <motion.div className="relative">
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                    className={cn(
                      'p-2.5 rounded-full transition-all duration-300 transform relative',
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg hover:bg-red-600 scale-110 ring-4 ring-red-200' 
                        : 'bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105',
                      appearance === 'dark'
                        ? 'shadow-black/20'
                        : 'shadow-gray-200'
                    )}
                    title={isListening ? 'Detener grabación' : 'Buscar por voz'}
                  >
                    <div className="relative z-10">
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </div>
                    
                    {/* Pulsing ring animations only when listening */}
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-red-300 animate-ping opacity-30" />
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Image Search Button */}
              {showImageSearch && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleImageSearch}
                  title="Búsqueda por imagen"
                  className={cn(
                    'p-2 rounded-full transition-all duration-300',
                    isImageSearchActive
                      ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'
                      : appearance === 'dark'
                      ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  )}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              )}

              {/* AI Assist Button */}
              {showAiAssist && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleAiAssist}
                  title="Asistente de búsqueda AI"
                  className={cn(
                    'p-2 rounded-full transition-all duration-300',
                    isAiThinking
                      ? 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30'
                      : appearance === 'dark'
                      ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  )}
                >
                  <motion.div
                    animate={isAiThinking ? {
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <span className="text-lg">✨</span>
                  </motion.div>
                </motion.button>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                title="Realizar búsqueda"
                className={cn(
                  'ml-2 px-6 py-2.5 rounded-xl font-medium',
                  'transition-all duration-300',
                  'bg-gradient-to-r shadow-lg',
                  appearance === 'dark'
                    ? [
                        'from-teal-500 to-cyan-500',
                        'hover:from-teal-400 hover:to-cyan-400',
                        'text-white',
                        'shadow-teal-900/20'
                      ]
                    : [
                        'from-teal-500 to-cyan-500',
                        'hover:from-teal-600 hover:to-cyan-600',
                        'text-white',
                        'shadow-teal-500/20'
                      ]
                )}
              >
                <span className="hidden sm:inline">Buscar</span>
                <Search className="w-4 h-4 sm:hidden" />
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Hidden file input for image search */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        title="Subir imagen para búsqueda"
      />

      {/* Search suggestions panel with animation */}
      <AnimatePresence>
        {showSuggestions && showSuggestionsPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SearchSuggestions
              searchTerm={searchTerm}
              onSelectSuggestion={handleSelectSuggestion}
              appearance={appearance}
              position={suggestionsPosition}
              compact={compactSuggestions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Status Banner */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 z-50"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <Mic className="h-5 w-5" />
              <span className="font-semibold">GRABANDO</span>
            </div>
            <div className="text-red-100">|</div>
            <span className="text-red-100">Habla ahora tu búsqueda...</span>
            <div className="text-red-100">|</div>
            <button
              onClick={stopVoiceSearch}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Detener
            </button>
          </div>
        </motion.div>
      )}

      {/* Voice Error Message */}
      {voiceError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 shadow-md"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Error de voz:</span>
            <span>{voiceError}</span>
          </div>
        </motion.div>
      )}

      {/* Success Feedback */}
      {searchTerm && !isListening && searchTerm !== initialValue && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg text-green-700 shadow-md"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">¡Búsqueda por voz exitosa!</span>
            <span>&quot;{searchTerm}&quot;</span>
          </div>
        </motion.div>
      )}
    </div>
  );
} 