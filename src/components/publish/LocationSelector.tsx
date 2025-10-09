// src/components/publish/LocationSelector.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  MapPinIcon, 
  CheckIcon, 
  ArrowsPointingOutIcon, 
  ArrowPathIcon, 
  XCircleIcon, 
  SunIcon 
} from '@heroicons/react/24/outline'
import { Logger } from '@/services/logging.service'
import { peruLocations, type Department, type Province, type District } from '@/data/peru-locations'

/**
 * @interface LocationInputData
 * Defines the data structure for the location information handled by the component.
 */
export interface LocationInputData {
  countryCode: string;
  department: string;
  province: string;
  district: string;
  address: string;
  reference: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * @interface LocationSelectorProps
 * Defines the props accepted by the LocationSelector component.
 */
interface LocationSelectorProps {
  /** Optional initial value for the location fields. */
  initialValue?: LocationInputData;
  /** Callback function that is triggered on any location data change. */
  onChange: (location: LocationInputData) => void;
  /** Optional CSS classes to apply to the root container. */
  className?: string;
}

/**
 * A comprehensive and reusable location selector component for React applications.
 * It provides dropdowns for country, department, province, and district,
 * text inputs for address and reference, and a dynamic geolocation feature
 * to capture precise map coordinates.
 *
 * @param {LocationSelectorProps} props - The component props.
 * @returns {React.ReactElement} The rendered LocationSelector component.
 */
const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  initialValue,
  onChange,
  className = ''
}) => {
  // --- STATE MANAGEMENT ---
  // Manages all location-related data in a single state object.
  const [location, setLocation] = useState<LocationInputData>(initialValue || {
    countryCode: 'PE',
    department: 'Cusco',
    province: 'Cusco',
    district: '',
    address: '',
    reference: ''
  });

  // Manages the loading state for the geolocation API call.
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  // Manages potential error messages from the geolocation API.
  const [positionError, setPositionError] = useState<string | null>(null);

  // --- LIFECYCLE & INITIALIZATION EFFECTS ---
  // Effect to initialize the form and notify the parent component on mount.
  useEffect(() => {
    if (!initialValue) {
      const defaultLocation = {
        countryCode: 'PE',
        department: 'Cusco',
        province: 'Cusco',
        district: '',
        address: '',
        reference: ''
      };
      setLocation(defaultLocation);
      onChange(defaultLocation);
    }
  }, [initialValue, onChange]);

  // --- DATA DERIVATION (MEMOIZED) ---
  // Using useMemo to prevent re-computation on every render, optimizing performance.
  const departments: Department[] = useMemo(() => 
    location.countryCode === 'PE' ? peruLocations : [], 
    [location.countryCode]
  );
  
  const provinces: Province[] = useMemo(() => {
    if (!location.department) return [];
    return departments.find(d => d.name === location.department)?.provinces || [];
  }, [location.department, departments]);

  const districts: District[] = useMemo(() => {
    if (!location.province) return [];
    return provinces.find(p => p.name === location.province)?.districts || [];
  }, [location.province, provinces]);

  // --- EVENT HANDLERS (STABILIZED WITH useCallback) ---
  // Using useCallback to ensure function references are stable across re-renders.
  
  /**
   * Centralized handler for all input changes. Updates the location state
   * and cascades resets for dependent dropdowns (e.g., changing department resets province).
   */
  const handleLocationChange = useCallback((field: keyof LocationInputData, value: string | number | { lat: number; lng: number }) => {
    let newLocation: LocationInputData = { ...location, [field]: value };

    // Cascade resets for dependent fields
    if (field === 'department') {
      newLocation = { ...newLocation, province: '', district: '' };
    } else if (field === 'province') {
      newLocation = { ...newLocation, district: '' };
    }

    setLocation(newLocation);
    onChange(newLocation);
    Logger.debug(`Location field '${field}' changed`, { value });
  }, [location, onChange]);

  /**
   * Fetches the user's high-accuracy geolocation using the browser's navigator API.
   * Handles loading states and errors gracefully.
   */
  const getHighAccuracyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPositionError('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsLoadingPosition(true);
    setPositionError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        handleLocationChange('coordinates', coords);
        setIsLoadingPosition(false);
        Logger.debug('User high-accuracy position detected', coords);
      },
      (error) => {
        setPositionError(`Error al obtener ubicación: ${error.message}. Intenta de nuevo.`);
        setIsLoadingPosition(false);
        Logger.error('Geolocation error', { error: error.message, code: error.code });
      }
    );
  }, [handleLocationChange]);

  /**
   * Clears the captured coordinates from the state, reverting the UI
   * to its initial state for geolocation.
   */
  const clearCoordinates = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coordinates, ...restOfLocation } = location;
    setLocation(restOfLocation);
    onChange(restOfLocation);
    Logger.debug('User cleared the precise location');
  }, [location, onChange]);

  // --- COMPONENT RENDER ---
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
        <MapPinIcon className="h-5 w-5 mr-2 text-teal-500" />
        Ubicación del Adiso
      </h3>

      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
        {/* Row: Country & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
            <select
              id="country"
              name="country"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={location.countryCode}
              onChange={(e) => handleLocationChange('countryCode', e.target.value)}
            >
              <option value="PE">🇵🇪 Perú</option>
              {/* Add other countries as needed */}
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</label>
            <select
              id="department"
              name="department"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={location.department}
              onChange={(e) => handleLocationChange('department', e.target.value)}
              disabled={departments.length === 0}
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((dep) => <option key={dep.name} value={dep.name}>{dep.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row: Province & District */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provincia</label>
            <select
              id="province"
              name="province"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={location.province}
              onChange={(e) => handleLocationChange('province', e.target.value)}
              disabled={provinces.length === 0}
            >
              <option value="">Selecciona una provincia</option>
              {provinces.map((prov) => <option key={prov.name} value={prov.name}>{prov.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Distrito</label>
            <select
              id="district"
              name="district"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={location.district}
              onChange={(e) => handleLocationChange('district', e.target.value)}
              disabled={districts.length === 0}
            >
              <option value="">Selecciona un distrito</option>
              {districts.map((dist) => <option key={dist.name} value={dist.name}>{dist.name}</option>)}
            </select>
          </div>
        </div>
        
        {/* Fields: Address & Reference */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
          <input
            type="text"
            id="address"
            name="address"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Ej: Av. El Sol 123"
            value={location.address}
            onChange={(e) => handleLocationChange('address', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referencia (Opcional)</label>
          <textarea
            id="reference"
            name="reference"
            rows={2}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Ej: Cerca al paradero 'Puente', frente a una farmacia."
            value={location.reference}
            onChange={(e) => handleLocationChange('reference', e.target.value)}
          />
        </div>

        {/* --- DYNAMIC GEOLOCATION CONTROL PANEL --- */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Publicar adiso en el mapa</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Para que tu adiso aparezca en búsquedas personalizadas y en el mapa.
              </p>
            </div>
            
            <div className="mt-2 min-h-[42px]"> {/* Container to prevent layout shift */}
              
              {/* STATE: RESOLVED - Coordinates have been captured */}
              {location.coordinates && !isLoadingPosition && (
                <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-900/30 rounded-md p-3 text-sm text-teal-800 dark:text-teal-200 shadow-sm transition-all duration-300 ease-in-out">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckIcon className="h-5 w-5 text-teal-500 flex-shrink-0" />
                    <span className="font-mono text-xs truncate" title={`Lat: ${location.coordinates.lat}, Lng: ${location.coordinates.lng}`}>
                      Lat: {location.coordinates.lat.toFixed(5)}, Lng: {location.coordinates.lng.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={getHighAccuracyLocation} 
                      className="p-1 rounded-full hover:bg-teal-200 dark:hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-50 focus:ring-teal-500"
                      aria-label="Actualizar ubicación"
                      title="Actualizar ubicación"
                    >
                      <ArrowPathIcon className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                    </button>
                    <button 
                      type="button" 
                      onClick={clearCoordinates} 
                      className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-50 focus:ring-red-500"
                      aria-label="Quitar ubicación"
                      title="Quitar ubicación"
                    >
                      <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* STATE: INITIAL or LOADING - No coordinates yet */}
              {!location.coordinates && (
                <button
                  type="button"
                  onClick={getHighAccuracyLocation}
                  disabled={isLoadingPosition}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingPosition ? (
                    <>
                      <SunIcon className="w-5 h-5 mr-2 animate-spin" />
                      Detectando...
                    </>
                  ) : (
                    <>
                      <ArrowsPointingOutIcon className="w-5 h-5 mr-2" />
                      Detectar mi ubicación precisa
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Global error display for this section */}
            {positionError && <p className="mt-2 text-sm text-red-600">{positionError}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationSelector;