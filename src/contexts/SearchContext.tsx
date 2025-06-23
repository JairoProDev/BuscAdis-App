'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

type Location = { id: string; name: string };

interface LocationState {
  continent: Location | null;
  country: Location | null;
  department: Location | null;
  province: Location | null;
  district: Location | null;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'category';
  categoryId?: string;
  subcategoryId?: string;
  score?: number;
  timestamp?: number;
}

interface SearchState {
  query: string;
  category: string;
  subcategory: string;
  subSubcategory: string;
  location: string;
  fullLocation: LocationState;
  filters: Record<string, any>;
  suggestions: SearchSuggestion[];
  recentSearches: SearchSuggestion[];
}

interface SearchContextType {
  searchState: SearchState;
  updateSearch: (updates: Partial<SearchState>) => void;
  addRecentSearch: (query: string, category?: string) => void;
  clearRecentSearches: () => void;
  trackSearch: (query: string, category?: string, resultsCount?: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const initialLocation: LocationState = {
  continent: null,
  country: null,
  department: null,
  province: null,
  district: null,
};

const initialSearchState: SearchState = {
  query: '',
  category: '',
  subcategory: '',
  subSubcategory: '',
  location: '',
  fullLocation: initialLocation,
  filters: {},
  suggestions: [],
  recentSearches: [],
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);

  // Load from localStorage only on client side
  useEffect(() => {
    try {
      const storedLocation = localStorage.getItem('userLocation');
      const storedRecentSearches = localStorage.getItem('recentSearches');
      
      if (storedLocation) {
        const location = JSON.parse(storedLocation);
        setSearchState(prev => ({ ...prev, fullLocation: location }));
      }
      
      if (storedRecentSearches) {
        const recentSearches = JSON.parse(storedRecentSearches);
        setSearchState(prev => ({ ...prev, recentSearches }));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  // Save to localStorage whenever location or recent searches change
  useEffect(() => {
    try {
      const isLocationSet = Object.values(searchState.fullLocation).some(value => value !== null);
      if (isLocationSet) {
        localStorage.setItem('userLocation', JSON.stringify(searchState.fullLocation));
      }
      
      if (searchState.recentSearches.length > 0) {
        localStorage.setItem('recentSearches', JSON.stringify(searchState.recentSearches));
      }
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [searchState.fullLocation, searchState.recentSearches]);

  const updateSearch = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({ ...prev, ...updates }));
  }, []);

  const addRecentSearch = useCallback((query: string, category?: string) => {
    if (!query.trim()) return;
    
    const newSearch: SearchSuggestion = {
      id: `recent-${Date.now()}`,
      text: query,
      type: 'recent',
      categoryId: category,
      timestamp: Date.now(),
    };

    setSearchState(prev => {
      // Remove if exists and add to beginning
      const filtered = prev.recentSearches.filter(search => 
        search.text.toLowerCase() !== query.toLowerCase()
      );
      
      // Keep only last 10 searches
      const updated = [newSearch, ...filtered].slice(0, 10);
      
      return { ...prev, recentSearches: updated };
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setSearchState(prev => ({ ...prev, recentSearches: [] }));
    localStorage.removeItem('recentSearches');
  }, []);

  const trackSearch = useCallback(async (query: string, category?: string, resultsCount?: number) => {
    try {
      // Enviar analytics al servidor
      await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          category,
          resultsCount,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          location: searchState.location
        })
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [searchState.location]);

  return (
    <SearchContext.Provider value={{ 
      searchState, 
      updateSearch, 
      addRecentSearch, 
      clearRecentSearches, 
      trackSearch 
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 