'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchSuggestions from './SearchSuggestions';

interface EnhancedSearchInputProps {
  initialValue?: string;
  placeholder?: string;
  appearance?: 'light' | 'dark';
  onSearch: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  suggestionsPosition?: 'top' | 'bottom';
  showVoiceSearch?: boolean;
  showImageSearch?: boolean;
  showAiAssist?: boolean;
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
}: EnhancedSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      
      // Save to search history
      try {
        const savedHistory = localStorage.getItem('searchHistory');
        let history: string[] = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Add only if it doesn't exist and limit to 10 items
        if (!history.includes(searchTerm)) {
          history = [searchTerm, ...history].slice(0, 10);
          localStorage.setItem('searchHistory', JSON.stringify(history));
        }
      } catch (e) {
        console.error('Error saving search history:', e);
      }
      
      setIsFocused(false);
    }
  };
  
  const handleClearInput = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(!isRecording);
      
      // Simulation of voice recognition
      if (!isRecording) {
        setTimeout(() => {
          const simulatedText = "departamentos en alquiler";
          setSearchTerm(simulatedText);
          setIsRecording(false);
          
          // Auto-submit after recognition
          setTimeout(() => {
            onSearch(simulatedText);
          }, 1000);
        }, 2000);
      }
    } else {
      alert("Lo sentimos, tu navegador no soporta reconocimiento de voz");
    }
  };
  
  const handleImageSearch = () => {
    // Simulate image upload for search
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();
    
    fileInput.onchange = () => {
      if (fileInput.files && fileInput.files[0]) {
        // Simulate processing and searching with the image
        setTimeout(() => {
          setSearchTerm("búsqueda por imagen");
          onSearch("búsqueda por imagen");
        }, 1000);
      }
    };
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
        onSearch(randomSuggestion);
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
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          {/* Glow effect on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-70 blur-sm transition duration-300"></div>
          
          {/* Main input container */}
          <div className={`relative flex items-center ${bgColorClass} rounded-full border ${borderClass} shadow-sm transition-all duration-300 focus-within:shadow-lg`}>
            {/* Search icon */}
            <div className="flex-shrink-0 pl-4">
              <Search className={`h-5 w-5 ${appearance === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            
            {/* Search input */}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              className={`flex-grow py-3 px-3 bg-transparent border-0 focus:ring-0 focus:outline-none ${textColorClass}`}
              disabled={isRecording || isAiThinking}
            />
            
            {/* Clear button */}
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearInput}
                className={`flex-shrink-0 ${appearance === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                aria-label="Borrar texto de búsqueda"
                title="Borrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {/* AI assist button */}
            {showAiAssist && !isRecording && !isAiThinking && (
              <button
                type="button"
                onClick={handleAiAssist}
                className={`flex-shrink-0 mx-1 p-1.5 rounded-full ${appearance === 'dark' ? 'text-purple-400 hover:text-purple-300 hover:bg-slate-700' : 'text-purple-600 hover:text-purple-700 hover:bg-slate-100'}`}
                aria-label="Sugerencia de IA"
                title="Obtener sugerencia inteligente"
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
            
            {/* Voice search button */}
            {showVoiceSearch && !isRecording && (
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`flex-shrink-0 mx-1 p-1.5 rounded-full ${appearance === 'dark' ? 'text-rose-400 hover:text-rose-300 hover:bg-slate-700' : 'text-rose-500 hover:text-rose-600 hover:bg-slate-100'}`}
                aria-label="Búsqueda por voz"
                title="Buscar con tu voz"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
            
            {/* Voice recording indicator */}
            {isRecording && (
              <div className="flex-shrink-0 mx-2 flex items-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-3 w-3 bg-rose-500 rounded-full mr-2"
                />
                <span className="text-sm text-rose-400">Grabando...</span>
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="ml-2 text-slate-400 hover:text-slate-300"
                  aria-label="Detener grabación"
                  title="Detener"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Image search button */}
            {showImageSearch && !isRecording && (
              <button
                type="button"
                onClick={handleImageSearch}
                className={`flex-shrink-0 mx-1 p-1.5 rounded-full ${appearance === 'dark' ? 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-700' : 'text-cyan-500 hover:text-cyan-600 hover:bg-slate-100'}`}
                aria-label="Búsqueda por imagen"
                title="Buscar con una imagen"
              >
                <Camera className="h-5 w-5" />
              </button>
            )}
            
            {/* Search button */}
            <button
              type="submit"
              className="flex-shrink-0 ml-1 mr-1 p-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:shadow-md transition-shadow"
              aria-label="Buscar"
              title="Buscar"
              disabled={isRecording || isAiThinking}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
      
      {/* Search suggestions dropdown */}
      {showSuggestions && (
        <SearchSuggestions
          searchTerm={searchTerm}
          isVisible={isFocused}
          onSelectSuggestion={(suggestion) => {
            setSearchTerm(suggestion);
            onSearch(suggestion);
            setIsFocused(false);
          }}
          onClose={() => setIsFocused(false)}
          position={suggestionsPosition}
          appearance={appearance}
        />
      )}
    </div>
  );
} 