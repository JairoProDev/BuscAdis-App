'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Camera, Sparkles, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchSuggestions from './SearchSuggestions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface EnhancedSearchInputProps {
  initialValue?: string;
  placeholder?: string;
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
  isMobile?: boolean;
}

export default function EnhancedSearchInput({
  initialValue = '',
  placeholder = '¿Qué estás buscando?',
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
  isMobile = false,
}: EnhancedSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize speech recognition
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);
  
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
  
  // Initialize Web Speech API if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (!SpeechRecognition) return;
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';
      
      // Handle recognition results
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(Array.from({ length: event.results.length }, (_, i) => event.results[i]))
          .map(result => result[0].transcript)
          .join('');
        
        setSearchTerm(transcript);
      };
      
      // Handle end of recognition
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      // Handle errors
      recognitionInstance.onerror = (event: SpeechRecognitionError) => {
        console.error('Error with speech recognition:', event.error);
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
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
  
  const handleVoiceSearch = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    if (!recognition) return;
    
    try {
      setIsRecording(true);
      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
      alert('Hubo un error al iniciar el reconocimiento de voz. Por favor intenta nuevamente.');
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
    <div className={cn('relative w-full', className)} ref={searchContainerRef}>
      <form
        className={cn(
          'flex items-center bg-white rounded-lg ring-1 ring-slate-200 focus-within:ring-blue-500 transition-all overflow-hidden',
          showSuggestionsPanel && 'ring-blue-500 shadow-sm',
          appearance === 'dark' && 'bg-slate-800 ring-slate-700 focus-within:ring-blue-500',
          className
        )}
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestionsPanel(true)}
          className={cn(
            'flex-1 py-2 px-3 outline-none bg-transparent',
            appearance === 'dark' && 'text-white placeholder:text-slate-400'
          )}
          placeholder={placeholder}
          aria-label="Search"
        />
        
        {/* Show selected image thumbnail */}
        {selectedImage && (
          <div className="relative mr-2">
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Imagen para búsqueda" 
              className="h-8 w-8 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 h-4 w-4 bg-slate-800 rounded-full flex items-center justify-center"
              aria-label="Eliminar imagen"
              title="Eliminar imagen"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
        
        {/* Input for file upload */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          aria-label="Subir imagen para búsqueda"
          title="Subir imagen para búsqueda"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearInput}
            className={cn(
              'p-2 focus:outline-none',
              appearance === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            )}
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {showVoiceSearch && (
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={cn(
              'p-2 focus:outline-none',
              isRecording ? 'text-red-500' : appearance === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            )}
            aria-label={isRecording ? 'Stop recording' : 'Voice search'}
            title={isRecording ? 'Detener grabación' : 'Búsqueda por voz'}
          >
            {isRecording ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
        
        {showImageSearch && (
          <button 
            type="button" 
            onClick={handleImageSearch}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100/10"
            aria-label="Buscar por imagen"
            title="Buscar por imagen"
          >
            <Camera className={cn("h-4 w-4", isImageSearchActive ? "text-blue-400" : "text-slate-400")} />
          </button>
        )}
        
        {showAiAssist && !isRecording && !isAiThinking && (
          <button
            type="button"
            onClick={handleAiAssist}
            className={cn(
              'p-2 focus:outline-none',
              appearance === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-500 hover:text-purple-700'
            )}
            aria-label="AI search assistant"
            title="Asistente de búsqueda AI"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        )}
        
        {/* AI thinking indicator */}
        {isAiThinking && (
          <div className="flex-shrink-0 mx-2">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 rounded-full border-2 border-purple-500 border-t-transparent"
            />
          </div>
        )}
        
        <button
          type="submit"
          className={cn(
            'flex items-center px-4 py-2 h-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-r-lg transition-colors',
            isMobile ? 'px-2' : 'px-4'
          )}
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Buscar</span>}
        </button>
      </form>
      
      {/* Search suggestions */}
      {showSuggestionsPanel && showSuggestions && (
        <div className="absolute z-50 w-full">
          <SearchSuggestions
            searchTerm={searchTerm}
            onSelectSuggestion={handleSelectSuggestion}
            appearance={appearance === 'dark' ? 'dark' : 'light'}
            position={suggestionsPosition}
            compact={compactSuggestions}
          />
        </div>
      )}
    </div>
  );
}

// Speech Recognition interfaces
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType;
}

interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionError) => void;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionError {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
} 