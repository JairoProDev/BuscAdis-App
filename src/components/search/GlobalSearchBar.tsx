'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/contexts/SearchContext';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronDownIcon,
  CameraIcon,
  MicrophoneIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { categories as allCategories } from '@/lib/constants';
import { departments } from '@/data/locations'; 
import { subcategories as allSubcategories } from '@/data/subcategories';

const GlobalSearchBar = () => {
  const { searchState, setSearchState } = useSearch();
  const router = useRouter();

  const [keyword, setKeyword] = useState(searchState.keyword);
  const [selectedCategory, setSelectedCategory] = useState(searchState.category);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchState.subcategory);

  useEffect(() => {
    if (selectedCategory) {
      setSubcategories(allSubcategories[selectedCategory] || []);
    } else {
      setSubcategories([]);
    }
    setSelectedSubcategory('');
  }, [selectedCategory]);

  const handleSearch = () => {
    setSearchState(prevState => ({ 
        ...prevState, 
        keyword, 
        category: selectedCategory,
        subcategory: selectedSubcategory
    }));
    router.push('/buscar');
  };
  
  const handleAiSearch = () => console.log("Triggering AI Search...");
  const handleVoiceSearch = () => console.log("Triggering Voice Search...");
  const handleImageSearch = () => console.log("Triggering Image Search...");

  const StyledSelect = ({ icon: Icon, label, options, value, onChange, 'aria-label': ariaLabel, disabled = false }) => (
    <div className="relative flex-shrink-0">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {Icon && <Icon className="w-5 h-5 text-slate-400" />}
      </div>
      <select
        aria-label={ariaLabel}
        className="appearance-none bg-white dark:bg-slate-800 rounded-md h-12 pl-10 pr-8 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">{label}</option>
        {options.map(opt => <option key={opt.id || opt} value={opt.id || opt}>{opt.name || opt}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon className="w-5 h-5 text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-30 bg-gray-100 dark:bg-slate-900/80 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3">
          <div className="flex-grow flex items-center bg-white dark:bg-slate-800 rounded-md h-12 px-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 mx-2" />
            <input
              type="text"
              placeholder="Estoy buscando..."
              className="w-full h-full bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <StyledSelect
            icon={MapPinIcon}
            label="Departamento"
            aria-label="Department"
            options={departments}
            value={searchState.location}
            onChange={(e) => setSearchState(prev => ({...prev, location: e.target.value}))}
          />
          <StyledSelect
            icon={TagIcon}
            label="Categoría"
            aria-label="Category"
            options={allCategories}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
          <StyledSelect
              label="Sub-categoría"
              aria-label="Sub-category"
              options={subcategories}
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={subcategories.length === 0}
            />

          <div className="flex items-center gap-1">
            <button onClick={handleVoiceSearch} aria-label="Search by voice" className="p-3 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <MicrophoneIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <button onClick={handleImageSearch} aria-label="Search by image" className="p-3 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <CameraIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
             <button onClick={handleAiSearch} aria-label="AI Search" className="p-3 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <SparklesIcon className="w-6 h-6 text-blue-500" />
            </button>
            <button onClick={handleSearch} className="flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex-shrink-0">
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchBar; 