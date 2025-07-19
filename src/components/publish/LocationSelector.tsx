'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { LocationData } from '@/contexts/PublicationContext'
import { MapPinIcon, GlobeAltIcon, MapIcon, BuildingOffice2Icon, HomeIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Logger } from '@/services/logging.service'

interface LocationSelectorProps {
  initialValue?: LocationData
  onChange: (location: LocationData) => void
  className?: string
}

// Add provinces and districts
const countries = [
  { code: 'PE', name: 'Perú', icon: '🇵🇪' },
  { code: 'CO', name: 'Colombia', icon: '🇨🇴' },
  { code: 'MX', name: 'México', icon: '🇲🇽' },
  { code: 'CL', name: 'Chile', icon: '🇨🇱' },
  { code: 'AR', name: 'Argentina', icon: '🇦🇷' },
  { code: 'ES', name: 'España', icon: '🇪🇸' }
]

const cities = {
  'PE': [
    { name: 'Lima', provinces: ['Lima Metropolitana', 'Lima Provincia'] },
    { name: 'Arequipa', provinces: ['Arequipa', 'Camaná', 'Caravelí'] },
    { name: 'Cusco', provinces: ['Cusco', 'Calca', 'Anta', 'Urubamba'] },
    { name: 'Piura', provinces: ['Piura', 'Sullana', 'Paita'] },
    { name: 'Trujillo', provinces: ['Trujillo', 'Ascope', 'Pacasmayo'] },
    { name: 'Chiclayo', provinces: ['Chiclayo', 'Ferreñafe', 'Lambayeque'] },
    { name: 'Iquitos', provinces: ['Maynas', 'Alto Amazonas'] },
    { name: 'Huancayo', provinces: ['Huancayo', 'Chupaca', 'Concepción'] }
  ],
  'CO': [
    { name: 'Bogotá', provinces: ['Bogotá D.C.'] },
    { name: 'Medellín', provinces: ['Antioquia'] },
    { name: 'Cali', provinces: ['Valle del Cauca'] },
    { name: 'Barranquilla', provinces: ['Atlántico'] },
    { name: 'Cartagena', provinces: ['Bolívar'] },
  ],
  'MX': [
    { name: 'Ciudad de México', provinces: ['CDMX'] },
    { name: 'Guadalajara', provinces: ['Jalisco'] },
    { name: 'Monterrey', provinces: ['Nuevo León'] },
    { name: 'Puebla', provinces: ['Puebla'] },
    { name: 'Tijuana', provinces: ['Baja California'] },
  ],
  'CL': [
    { name: 'Santiago', provinces: ['Región Metropolitana'] },
    { name: 'Valparaíso', provinces: ['Valparaíso'] },
    { name: 'Concepción', provinces: ['Biobío'] },
    { name: 'La Serena', provinces: ['Coquimbo'] },
    { name: 'Antofagasta', provinces: ['Antofagasta'] },
  ],
  'AR': [
    { name: 'Buenos Aires', provinces: ['Buenos Aires'] },
    { name: 'Córdoba', provinces: ['Córdoba'] },
    { name: 'Rosario', provinces: ['Santa Fe'] },
    { name: 'Mendoza', provinces: ['Mendoza'] },
    { name: 'La Plata', provinces: ['Buenos Aires'] },
  ],
  'ES': [
    { name: 'Madrid', provinces: ['Comunidad de Madrid'] },
    { name: 'Barcelona', provinces: ['Cataluña'] },
    { name: 'Valencia', provinces: ['Comunidad Valenciana'] },
    { name: 'Sevilla', provinces: ['Andalucía'] },
    { name: 'Zaragoza', provinces: ['Aragón'] },
  ]
};

// Common districts for Peruvian cities
const districts = {
  'Cusco': ['Cusco', 'Wanchaq', 'Santiago', 'San Sebastián', 'San Jerónimo', 'Saylla', 'Poroy', 'Ccorca'],
  'Lima Metropolitana': ['Miraflores', 'San Isidro', 'Barranco', 'San Borja', 'La Molina', 'Surco', 'Surquillo', 'Jesús María', 'Cercado de Lima', 'Breña'],
  'Arequipa': ['Cercado', 'Cayma', 'Cerro Colorado', 'Yanahuara', 'José Luis Bustamante y Rivero', 'Paucarpata', 'Sachaca'],
  'default': ['Centro', 'Norte', 'Sur', 'Este', 'Oeste']
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  initialValue: value,
  onChange,
  className = ''
}) => {
  const [location, setLocation] = useState<LocationData>(value || {
    city: '',
    country: 'PE',
    district: '',
    reference: ''
  });

  const [useMap, setUseMap] = useState(false);
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [province, setProvince] = useState<string>('');
  const [userPosition, setUserPosition] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);

  // Get user's geolocation
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPositionError('Tu navegador no soporta geolocalización');
      return;
    }
    
    setIsLoadingPosition(true);
    setPositionError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        
        // Update location with coordinates
        const updatedLocation = {
          ...location,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        };
        setLocation(updatedLocation);
        onChange(updatedLocation);
        setIsLoadingPosition(false);
        
        Logger.debug('User position detected', { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
      },
      (error) => {
        setPositionError('Error al obtener tu ubicación: ' + error.message);
        setIsLoadingPosition(false);
        Logger.error('Geolocation error', { error: error.message });
      },
      { enableHighAccuracy: true }
    );
  }, [location, onChange]);

  // Update provinces when city changes
  useEffect(() => {
    if (location.country && location.city) {
      const country = location.country as keyof typeof cities;
      const cityData = cities[country]?.find(c => c.name === location.city);
      
      if (cityData) {
        setAvailableProvinces(cityData.provinces);
        // Reset province if not in the list
        if (!cityData.provinces.includes(province)) {
          setProvince('');
        }
      } else {
        setAvailableProvinces([]);
      }
    }
  }, [location.country, location.city, province]);

  // Update districts when province changes
  useEffect(() => {
    if (province) {
      // Check if we have specific districts for this province
      if (districts[province as keyof typeof districts]) {
        setAvailableDistricts(districts[province as keyof typeof districts]);
      } else {
        // Use default districts
        setAvailableDistricts(districts.default);
      }
    }
  }, [province]);

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    const updatedLocation = {
      ...location,
      country: newCountry,
      city: '', // Reset city when country changes
      district: '', // Reset district too
      province: ''
    };
    setLocation(updatedLocation);
    setProvince('');
    onChange(updatedLocation);
    Logger.debug('Country changed', { country: newCountry });
  }, [location, onChange]);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    const updatedLocation = {
      ...location,
      city: newCity,
      district: '', // Reset district when city changes
      province: ''
    };
    setLocation(updatedLocation);
    setProvince('');
    onChange(updatedLocation);
    Logger.debug('City changed', { city: newCity });
  }, [location, onChange]);

  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setProvince(newProvince);
    
    const updatedLocation = {
      ...location,
      province: newProvince,
      district: '' // Reset district when province changes
    };
    setLocation(updatedLocation);
    onChange(updatedLocation);
    Logger.debug('Province changed', { province: newProvince });
  }, [location, onChange]);

  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const updatedLocation = {
      ...location,
      district: newDistrict
    };
    setLocation(updatedLocation);
    onChange(updatedLocation);
    Logger.debug('District changed', { district: newDistrict });
  }, [location, onChange]);

  const handleReferenceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newReference = e.target.value;
    const updatedLocation = {
      ...location,
      reference: newReference
    };
    setLocation(updatedLocation);
    onChange(updatedLocation);
  }, [location, onChange]);

  const handleCustomCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    const updatedLocation = {
      ...location,
      city: newCity
    };
    setLocation(updatedLocation);
    onChange(updatedLocation);
  }, [location, onChange]);

  const handleToggleMap = useCallback(() => {
    setUseMap(!useMap);
    Logger.debug('Map toggled', { useMap: !useMap });
    
    // If turning on map and no position yet, get user location
    if (!useMap && !userPosition) {
      getUserLocation();
    }
  }, [useMap, userPosition, getUserLocation]);

  const availableCities = location.country ? (cities[location.country as keyof typeof cities]?.map(city => city.name) || []) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-primary-500" />
          Ubicación de tu anuncio
        </h3>
        <button
          type="button"
          onClick={handleToggleMap}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          {useMap ? (
            <>
              <GlobeAltIcon className="h-5 w-5 mr-1 text-primary-500" />
              Lista
            </>
          ) : (
            <>
              <MapIcon className="h-5 w-5 mr-1 text-primary-500" />
              Mapa
            </>
          )}
        </button>
      </div>

      {!useMap ? (
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-500" />
              País
            </label>
            <select
              id="country"
              name="country"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white text-gray-900"
              value={location.country}
              onChange={handleCountryChange}
            >
              <option value="">Selecciona un país</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.icon} {country.name}
                </option>
              ))}
            </select>
          </div>

          {location.country && (
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 flex items-center">
                <BuildingOffice2Icon className="h-4 w-4 mr-1 text-gray-500" />
                Ciudad
              </label>
              <select
                id="city"
                name="city"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white text-gray-900"
                value={availableCities.includes(location.city) ? location.city : ''}
                onChange={handleCityChange}
              >
                <option value="">Selecciona una ciudad</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="other">Otra ciudad...</option>
              </select>
            </div>
          )}

          {location.city === 'other' && (
            <div>
              <label htmlFor="customCity" className="block text-sm font-medium text-gray-700 flex items-center">
                <BuildingOffice2Icon className="h-4 w-4 mr-1 text-gray-500" />
                Nombre de la ciudad
              </label>
              <input
                type="text"
                id="customCity"
                name="customCity"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                placeholder="Nombre de la ciudad"
                onChange={handleCustomCityChange}
              />
            </div>
          )}

          {location.city && location.city !== 'other' && (
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 flex items-center">
                <MapIcon className="h-4 w-4 mr-1 text-gray-500" />
                Provincia
              </label>
              <select
                id="province"
                name="province"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white text-gray-900"
                value={province}
                onChange={handleProvinceChange}
              >
                <option value="">Selecciona una provincia</option>
                {availableProvinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          )}

          {province && (
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 flex items-center">
                <HomeIcon className="h-4 w-4 mr-1 text-gray-500" />
                Distrito
              </label>
              <select
                id="district"
                name="district"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white text-gray-900"
                value={location.district || ''}
                onChange={handleDistrictChange}
              >
                <option value="">Selecciona un distrito</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          )}

          {location.city && (
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
                Referencia (opcional)
              </label>
              <textarea
                id="reference"
                name="reference"
                rows={2}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                placeholder="Ej: Cerca al mercado central, a 2 cuadras del parque..."
                value={location.reference || ''}
                onChange={handleReferenceChange}
              />
            </div>
          )}

          {!location.district && location.city && province && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Selecciona un distrito</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Por favor, selecciona un distrito para continuar con tu publicación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {isLoadingPosition ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Obteniendo tu ubicación actual...</p>
            </div>
          ) : positionError ? (
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                </div>
              </div>
              <p className="text-sm text-red-700">{positionError}</p>
              <button
                type="button"
                onClick={getUserLocation}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : userPosition ? (
            <div>
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ubicación detectada</h4>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-primary-500 mr-2" />
                  <p className="text-sm text-gray-600">
                    Latitud: {userPosition.lat.toFixed(6)}, Longitud: {userPosition.lng.toFixed(6)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Esta información no será visible para el público, solo la usamos para mostrar tu anuncio en el mapa.</p>
              </div>
              
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <MapIcon className="mx-auto h-12 w-12 text-primary-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Integración de mapa en desarrollo</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Pronto podrás ver y ajustar tu ubicación exacta en un mapa interactivo.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Por favor, completa también la información de ubicación en la pestaña Lista:</p>
                <button
                  type="button"
                  onClick={handleToggleMap}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <GlobeAltIcon className="h-5 w-5 mr-1 text-primary-500" />
                  Ir a selección por Lista
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin ubicación detectada</h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Queremos mostrar tu anuncio en el mapa para que más personas puedan encontrarlo.
              </p>
              <button
                type="button"
                onClick={getUserLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Detectar mi ubicación
              </button>
            </div>
          )}
        </div>
      )}

      {location.city && location.country && location.district && (
        <div className="bg-green-50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Ubicación completa ✅</h3>
              <div className="mt-2 text-sm text-green-700">
                <p className="font-medium">
                  {location.district}, {location.city}, {countries.find(c => c.code === location.country)?.name || location.country}
                </p>
                {location.reference && (
                  <p className="mt-1 text-xs italic">Referencia: {location.reference}</p>
                )}
                {location.coordinates && (
                  <p className="mt-1 text-xs">🗺️ Ubicación exacta detectada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSelector 