'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Location = { id: string; name: string };

interface LocationState {
  continent: Location | null;
  country: Location | null;
  department: Location | null;
  province: Location | null;
  district: Location | null;
}

interface SearchState {
  keyword: string;
  category: string;
  subcategory: string;
  subSubcategory: string;
  location: LocationState;
}

interface SearchContextType {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const initialLocation: LocationState = {
    continent: null,
    country: null,
    department: null,
    province: null,
    district: null,
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchState, setSearchState] = useState<SearchState>({
    keyword: '',
    category: '',
    subcategory: '',
    subSubcategory: '',
    location: initialLocation,
  });

  // Load from localStorage only on client side
  useEffect(() => {
    try {
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        const location = JSON.parse(storedLocation);
        setSearchState(prev => ({ ...prev, location }));
      }
    } catch (error) {
      console.error("Failed to parse location from localStorage", error);
    }
  }, []);

  // Save to localStorage whenever location changes
  useEffect(() => {
    try {
        const isLocationSet = Object.values(searchState.location).some(value => value !== null);
        if (isLocationSet) {
            localStorage.setItem('userLocation', JSON.stringify(searchState.location));
        }
    } catch (error) {
        console.error("Failed to save location to localStorage", error);
    }
  }, [searchState.location]);

  return (
    <SearchContext.Provider value={{ searchState, setSearchState }}>
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