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
}: EnhancedSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize speech recognition
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);
  
  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Initialize Web Speech API if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';
      
      // Handle recognition results
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
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
  
  // Trigger onFocusChange when focus state changes
  useEffect(() => {
    if (onFocusChange) {
      onFocusChange(isFocused);
    }
  }, [isFocused, onFocusChange]);
  
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
      
      // Don't close suggestions right away in case the user wants to 
      // see immediate search results suggestions
    }
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
    
    // Simulate AI thinking and generating suggestions
    setTimeout(() => {
      const aiSuggestions = [
        "Departamentos cerca de universidades",
        "Trabajos de medio tiempo en tecnología",
        "Autos económicos con buen rendimiento"
      ];
      
      // Pick a random suggestion
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setSearchTerm(randomSuggestion);
      setIsAiThinking(false);
      
      // Auto-submit after a short delay
      setTimeout(() => {
        onSearch(randomSuggestion, null);
      }, 500);
    }, 1500);
  };
  
  const bgColorClass = appearance === 'dark' 
    ? 'bg-slate-800/70 focus-within:bg-slate-700/90' 
    : 'bg-white focus-within:bg-white';
    
  const textColorClass = appearance === 'dark'
    ? 'text-slate-200 placeholder-slate-400'
    : 'text-slate-900 placeholder-slate-500';
    
  const borderClass = appearance === 'dark'
    ? 'border-slate-700 focus-within:border-slate-600'
    : 'border-slate-200 focus-within:border-slate-300';

  return (
    <div className={cn('relative w-full', className)}>
      <form
        className={cn(
          'flex items-center bg-white rounded-lg ring-1 ring-slate-200 focus-within:ring-blue-500 transition-all overflow-hidden',
          isFocused && 'ring-blue-500 shadow-sm',
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
        
        <Button
          type="submit"
          size="sm"
          className={cn(
            'px-4 py-2 h-full rounded-l-none',
            appearance === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''
          )}
          variant={appearance === 'dark' ? 'default' : 'default'}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </form>
      
      {/* Search suggestions */}
      {isFocused && showSuggestions && (
        <SearchSuggestions
          searchTerm={searchTerm}
          onSelectSuggestion={(text) => {
            setSearchTerm(text);
            if (onSearch) {
              onSearch(text, null);
            }
          }}
          appearance={appearance === 'dark' ? 'dark' : 'light'}
          position={suggestionsPosition}
        />
      )}
    </div>
  );
}

// Add type declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

// Define types for Speech Recognition
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