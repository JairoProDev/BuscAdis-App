'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Location, LocationSelectorProps } from '@/types/publish'
import { MapPinIcon } from '@heroicons/react/24/outline'

const cities = [
  { name: 'Bogotá', state: 'Cundinamarca' },
  { name: 'Medellín', state: 'Antioquia' },
  { name: 'Cali', state: 'Valle del Cauca' },
  { name: 'Barranquilla', state: 'Atlántico' },
  { name: 'Cartagena', state: 'Bolívar' },
  // Añade más ciudades según necesites
];

export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState<typeof cities[0] | null>(null);

  useEffect(() => {
    if (value?.city) {
      const city = cities.find(c => c.name === value.city);
      if (city) {
        setSelectedCity(city);
        setSearch(city.name);
      }
    }
  }, [value]);

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleCitySelect = (city: typeof cities[0]) => {
    setSelectedCity(city);
    setSearch(city.name);
    setShowSuggestions(false);
    onChange({
      city: city.name,
      state: city.state,
      country: 'Colombia'
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="location" className="block text-sm font-medium text-primary-700 mb-2">
          Ubicación
        </label>
        
        <div className="relative">
          <input
            id="location"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="Busca tu ciudad"
          />
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
        </div>

        {showSuggestions && search && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-primary-100 max-h-60 overflow-auto"
          >
            {filteredCities.length > 0 ? (
              <ul className="py-2">
                {filteredCities.map((city) => (
                  <li key={`${city.name}-${city.state}`}>
                    <button
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-2 text-left hover:bg-primary-50 transition-colors"
                    >
                      <span className="font-medium text-primary-900">{city.name}</span>
                      <span className="text-sm text-primary-600 ml-2">{city.state}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-primary-600">
                No se encontraron resultados
              </div>
            )}
          </motion.div>
        )}
      </div>

      {selectedCity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-primary-50 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 p-1.5">
              <MapPinIcon className="w-full h-full text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-primary-900">
                {selectedCity.name}
              </h4>
              <p className="text-sm text-primary-600">
                {selectedCity.state}, Colombia
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 