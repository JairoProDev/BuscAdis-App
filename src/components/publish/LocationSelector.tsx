// src/components/publish/LocationSelector.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MapPinIcon, GlobeAltIcon, MapIcon, BuildingOffice2Icon, CheckIcon, ArrowsPointingOutIcon, SunIcon } from '@heroicons/react/24/outline'
import { Logger } from '@/services/logging.service'
import { peruLocations, type Department, type Province, type District } from '@/data/peru-locations'

// Definimos la estructura de datos que manejará el componente
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

interface LocationSelectorProps {
  initialValue?: LocationInputData;
  onChange: (location: LocationInputData) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  initialValue,
  onChange,
  className = ''
}) => {
  const [location, setLocation] = useState<LocationInputData>(initialValue || {
    countryCode: 'PE',
    department: 'Cusco',
    province: 'Cusco',
    district: '',
    address: '',
    reference: ''
  });

  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);

  // Initialize with default values and notify parent
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

  // Reset to Cusco when country changes to Peru
  useEffect(() => {
    if (location.countryCode === 'PE' && !location.department) {
      const newLocation = {
        ...location,
        department: 'Cusco',
        province: 'Cusco',
        district: ''
      };
      setLocation(newLocation);
      onChange(newLocation);
    }
  }, [location.countryCode, location.department, onChange]);

  // Initialize Cusco on mount if no initial value
  useEffect(() => {
    if (!initialValue && location.countryCode === 'PE' && !location.department) {
      const newLocation = {
        ...location,
        department: 'Cusco',
        province: 'Cusco',
        district: ''
      };
      setLocation(newLocation);
      onChange(newLocation);
    }
  }, []);

  // --- Lógica de Derivación de Datos Optimizada con useMemo ---

  const departments: Department[] = useMemo(() => {
    // Por ahora solo tenemos Perú, pero está listo para expandirse
    if (location.countryCode === 'PE') {
      return peruLocations;
    }
    // Para otros países, retornar array vacío por ahora
    return [];
  }, [location.countryCode]);

  const provinces: Province[] = useMemo(() => {
    if (!location.department) return [];
    const selectedDept = departments.find(d => d.name === location.department);
    return selectedDept?.provinces || [];
  }, [location.department, departments]);

  const districts: District[] = useMemo(() => {
    if (!location.province) return [];
    const selectedProv = provinces.find(p => p.name === location.province);
    return selectedProv?.districts || [];
  }, [location.province, provinces]);

  // --- Manejador de Cambios Centralizado ---

  const handleLocationChange = useCallback((field: keyof LocationInputData, value: any) => {
    let newLocation: LocationInputData = { ...location, [field]: value };

    // Lógica de reseteo para selectores dependientes
    if (field === 'countryCode') {
      // Reset all location fields when country changes
      newLocation = { 
        ...newLocation, 
        department: '', 
        province: '', 
        district: '',
        address: '',
        reference: ''
      };
    } else if (field === 'department') {
      newLocation = { ...newLocation, province: '', district: '' };
    } else if (field === 'province') {
      newLocation = { ...newLocation, district: '' };
    }

    setLocation(newLocation);
    onChange(newLocation);
    Logger.debug(`Location field '${field}' changed to`, { value });
  }, [location, onChange]);

  // --- Lógica de Geolocalización ---

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
        // Opcional: Podrías llamar a una API de geocodificación inversa aquí para autocompletar los campos.
      },
      (error) => {
        setPositionError(`No se pudo obtener la ubicación: ${error.message}. Por favor, selecciona manualmente.`);
        setIsLoadingPosition(false);
        Logger.error('Geolocation error', { error: error.message });
      }
    );
  }, [handleLocationChange]);

  // --- Renderizado del Componente ---

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-teal-500" />
          Ubicación del Adiso
        </h3>
      </div>

      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Fila: País y Departamento */}
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
              <option value="BO">🇧🇴 Bolivia</option>
              <option value="CL">🇨🇱 Chile</option>
              <option value="CO">🇨🇴 Colombia</option>
              <option value="EC">🇪🇨 Ecuador</option>
              <option value="MX">🇲🇽 México</option>
              <option value="AR">🇦🇷 Argentina</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="US">🇺🇸 Estados Unidos</option>
              <option value="ES">🇪🇸 España</option>
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
              {departments.map((dep: Department) => <option key={dep.name} value={dep.name}>{dep.name}</option>)}
            </select>
          </div>
        </div>

        {/* Fila: Provincia y Distrito */}
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
              {provinces.map((prov: Province) => <option key={prov.name} value={prov.name}>{prov.name}</option>)}
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
              {districts.map((dist: District) => <option key={dist.name} value={dist.name}>{dist.name}</option>)}
            </select>
          </div>
        </div>

        {/* Fila: Dirección y Referencia */}
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

        {/* Fila: Geolocalización y Coordenadas */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Ubicación en el mapa</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Opcional pero recomendado. Permite que tu adiso aparezca en búsquedas por mapa.
              </p>
            </div>
            <button
              type="button"
              onClick={getHighAccuracyLocation}
              disabled={isLoadingPosition}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
            >
              {isLoadingPosition ? (
                <SunIcon className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5 mr-2" />
              )}
              {isLoadingPosition ? 'Detectando...' : 'Detectar mi ubicación precisa'}
            </button>
          </div>
          {positionError && <p className="mt-2 text-sm text-red-600">{positionError}</p>}
          {location.coordinates && (
            <div className="mt-3 bg-teal-50 dark:bg-teal-900/20 rounded-md p-3 text-sm text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-teal-500" />
              <span>
                Coordenadas capturadas: Lat {location.coordinates.lat.toFixed(5)}, Lng {location.coordinates.lng.toFixed(5)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSelector;