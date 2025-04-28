'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EnhancedSearchInput from './EnhancedSearchInput';

interface KeywordSearchBoxProps {
  initialValue?: string;
  appearance?: 'light' | 'dark';
  onSearch?: (query: string) => void;
  className?: string;
  label?: string;
  showLabel?: boolean;
  autoFocus?: boolean;
  showVoiceSearch?: boolean;
  showImageSearch?: boolean;
  showAiAssist?: boolean;
  placeholder?: string;
  isMobile?: boolean;
}

export default function KeywordSearchBox({
  initialValue = '',
  appearance = 'dark',
  onSearch,
  className = '',
  label = 'Palabras clave',
  showLabel = true,
  autoFocus = false,
  showVoiceSearch = true,
  showImageSearch = true,
  showAiAssist = true,
  placeholder = '¿Qué estás buscando?',
  isMobile = false,
}: KeywordSearchBoxProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialValue);
  
  const handleSearch = (query: string) => {
    setSearchValue(query);
    
    if (onSearch) {
      // If onSearch prop is provided, call it
      onSearch(query);
    } else {
      // Otherwise, navigate to search page with the query
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <label className={`block text-sm font-medium mb-1 ${
          appearance === 'dark' ? 'text-slate-400' : 'text-slate-700'
        }`}>
          {label}
        </label>
      )}
      
      <EnhancedSearchInput
        initialValue={initialValue}
        onSearch={handleSearch}
        placeholder={placeholder}
        appearance={appearance}
        autoFocus={autoFocus}
        showSuggestions={true}
        showVoiceSearch={showVoiceSearch}
        showImageSearch={showImageSearch}
        showAiAssist={showAiAssist}
        isMobile={isMobile}
      />
    </div>
  );
} 