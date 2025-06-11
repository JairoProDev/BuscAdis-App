'use client';

import { Fragment, useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronLeftIcon, MapPinIcon, GlobeAmericasIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { geoData as rawGeoData } from '@/data/geo';
import { getCountryFlag } from '@/utils/getCountryFlag';

// --- TYPES & STRUCTURES ---

type Location = { id: string; name: string };

type LocationData = Record<string, Location[]>;

type GeoData = {
    continents: Location[];
    countries: LocationData;
    departments: LocationData;
    provinces: LocationData;
    districts: LocationData;
};

const geoData: GeoData = rawGeoData;

type Selection = {
  continent: Location | null;
  country: Location | null;
  department: Location | null;
  province: Location | null;
  district: Location | null;
};

const HIERARCHY = ['continent', 'country', 'department', 'province', 'district'] as const;
type Level = typeof HIERARCHY[number];

const LEVEL_DATA_KEYS: Record<Level, keyof GeoData> = {
    continent: 'continents',
    country: 'countries',
    department: 'departments',
    province: 'provinces',
    district: 'districts'
};

const LEVEL_NAMES: Record<Level, string> = {
    continent: 'Continentes',
    country: 'Países',
    department: 'Departamentos',
    province: 'Provincias',
    district: 'Distritos'
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (selection: Partial<Selection>) => void;
  initialSelection?: Partial<Selection>;
}

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

// --- MAIN COMPONENT ---

const LocationSelector = ({ isOpen, onClose, onLocationSelect, initialSelection = {} }: LocationSelectorProps) => {
  const [selection, setSelection] = useState<Selection>({
    continent: null, country: null, department: null, province: null, district: null,
    ...initialSelection
  });
  const [level, setLevel] = useState<Level>('continent');
  const [searchTerm, setSearchTerm] = useState('');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');

  const peruDefault: Selection = useMemo(() => ({
      continent: { id: 'sa', name: 'América del Sur' },
      country: { id: 'pe', name: 'Perú' },
      department: null,
      province: null,
      district: null,
  }), []);

  useEffect(() => {
    if (isOpen) {
        // Reset search term on open
        setSearchTerm('');

        const hasInitial = initialSelection && Object.values(initialSelection).filter(v => v !== null).length > 0;

        if (hasInitial) {
             let startingLevel: Level = 'continent';
            if (initialSelection?.district) startingLevel = 'district';
            else if (initialSelection?.province) startingLevel = 'district';
            else if (initialSelection?.department) startingLevel = 'province';
            else if (initialSelection?.country) startingLevel = 'department';
            else if (initialSelection?.continent) startingLevel = 'country';
            
            setLevel(startingLevel);
            setSelection({ 
                continent: null, country: null, department: null, province: null, district: null,
                ...initialSelection 
            });
        } else {
            // Default to Peru
            setSelection(peruDefault);
            setLevel('department');
        }
    }
  }, [isOpen, initialSelection, peruDefault]);
  
  const currentList = useMemo(() => {
    let list: Location[] = [];
    if (!isOpen) return [];

    switch (level) {
      case 'continent':
        list = geoData.continents;
        break;
      case 'country':
        list = selection.continent ? geoData.countries[selection.continent.id] || [] : [];
        break;
      case 'department':
        list = selection.country ? geoData.departments[selection.country.id] || [] : [];
        break;
      case 'province':
        list = selection.department ? geoData.provinces[selection.department.id] || [] : [];
        break;
      case 'district':
        list = selection.province ? geoData.districts[selection.province.id] || [] : [];
        break;
    }
    
    if (!searchTerm) return list;
    return list.filter(item => item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  }, [level, selection, searchTerm, isOpen]);

  const handleSelect = (item: Location) => {
    setAnimationDirection('forward');
    const newSelection: Selection = { ...selection, [level]: item };
    
    const currentLevelIndex = HIERARCHY.indexOf(level);
    for (let i = currentLevelIndex + 1; i < HIERARCHY.length; i++) {
        const levelToClear = HIERARCHY[i];
        newSelection[levelToClear] = null;
    }
    
    setSelection(newSelection);

    const nextLevelIndex = currentLevelIndex + 1;
    if (nextLevelIndex < HIERARCHY.length) {
      const nextLevel = HIERARCHY[nextLevelIndex];
      const nextDataKey = LEVEL_DATA_KEYS[nextLevel];
      
      const nextList = nextDataKey === 'continents' 
        ? geoData.continents 
        : (geoData[nextDataKey] as LocationData)[item.id] || [];

      if (nextList.length > 0) {
        setLevel(nextLevel);
      } else {
        // This is a final selection, close the modal
        onLocationSelect(newSelection);
        onClose();
      }
    } else {
        // This is a final selection (district), close the modal
        onLocationSelect(newSelection);
        onClose();
    }
    setSearchTerm('');
  };

  const handleBack = () => {
    setAnimationDirection('backward');
    const currentLevelIndex = HIERARCHY.indexOf(level);
    if (currentLevelIndex > 0) { 
      setLevel(HIERARCHY[currentLevelIndex - 1]);
    }
  };
  
  const handleBreadcrumbClick = (clickedIndex: number) => {
    setAnimationDirection('backward');
    setLevel(HIERARCHY[clickedIndex]);
  };
  
  const handleConfirmSelection = () => {
    onLocationSelect(selection);
    onClose();
  };
  
  const handleQuickPick = (quickSelection: Selection) => {
    onLocationSelect(quickSelection);
    onClose();
  }

  const findLocation = (locations: Location[] | undefined, name: string | undefined): Location | null => {
    if (!name || !locations) return null;
    
    const normalizedSearchName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    console.log(`🔍 Buscando: "${name}" (normalizado: "${normalizedSearchName}")`);
    
    // Primero: búsqueda exacta
    let found = locations.find(loc => {
      const normalizedLocName = loc.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normalizedLocName === normalizedSearchName;
    });
    
    if (found) {
      console.log(`✅ Encontrado exacto: ${found.name}`);
      return found;
    }
    
    // Segundo: búsqueda parcial (remueve palabras comunes)
    const cleanSearchName = normalizedSearchName
      .replace(/\b(departamento|provincia|distrito|region|de|del|la|las|los|el)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    found = locations.find(loc => {
      const cleanLocName = loc.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\b(departamento|provincia|distrito|region|de|del|la|las|los|el)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanLocName === cleanSearchName || 
             cleanLocName.includes(cleanSearchName) || 
             cleanSearchName.includes(cleanLocName);
    });
    
    if (found) {
      console.log(`✅ Encontrado parcial: ${found.name} (buscaba: ${name})`);
      return found;
    }
    
    // Tercero: búsqueda por similitud (para casos como Cuzco vs Cusco)
    found = locations.find(loc => {
      const normalizedLocName = loc.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      // Revisa si son muy similares (diferencia de 1-2 caracteres)
      return levenshteinDistance(normalizedLocName, normalizedSearchName) <= 2;
    });
    
    if (found) {
      console.log(`✅ Encontrado similar: ${found.name} (buscaba: ${name})`);
      return found;
    }
    
    console.log(`❌ No encontrado: "${name}" en`, locations.map(l => l.name));
    return null;
  };

  // Función auxiliar para calcular distancia de edición
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleGeolocation = async () => {
      setGeolocationStatus('loading');
      if (!navigator.geolocation) {
          setGeolocationStatus('error');
          console.error("Geolocation is not supported by this browser.");
          return;
      }

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              try {
                  const { latitude, longitude } = position.coords;
                  console.log(`📍 Coordenadas obtenidas: ${latitude}, ${longitude}`);
                  
                  const response = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
                  
                  if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                  }

                  const data = await response.json();
                  console.log('🗺️ Datos de Google Maps:', data.location);
                  
                  if (data.error || !data.location) {
                    throw new Error(data.error || 'Invalid location data from API');
                  }

                  const { country, department, province, district } = data.location;
                  
                  // --- Match API response to our geoData ---
                  const newSelection: Selection = { continent: null, country: null, department: null, province: null, district: null };
                  let deepestLevel: Level = 'continent';

                  // 1. Find Country and its Continent
                  const allCountries = Object.values(geoData.countries).flat();
                  const foundCountry = findLocation(allCountries, country?.name);
                  
                  if (foundCountry) {
                      newSelection.country = foundCountry;
                      const continentId = Object.keys(geoData.countries).find(key => geoData.countries[key as keyof typeof geoData.countries].some(c => c.id === foundCountry.id));
                      if (continentId) {
                          newSelection.continent = geoData.continents.find(c => c.id === continentId) || null;
                          deepestLevel = 'country';
                      }
                  } else {
                    throw new Error(`Could not match country: ${country?.name}`);
                  }
                  
                  // 2. Find Department
                  if (newSelection.country) {
                    const departmentData = geoData.departments[newSelection.country.id];
                    const foundDepartment = findLocation(departmentData, department?.name);
                    if (foundDepartment) {
                        newSelection.department = foundDepartment;
                        deepestLevel = 'department';
                        console.log(`🏛️ Departamento encontrado: ${foundDepartment.name}`);
                    }
                  }
                  
                  // 3. Find Province
                  if (newSelection.department) {
                    const provinceData = geoData.provinces[newSelection.department.id];
                    const foundProvince = findLocation(provinceData, province?.name);
                    if (foundProvince) {
                        newSelection.province = foundProvince;
                        deepestLevel = 'province';
                        console.log(`🏛️ Provincia encontrada: ${foundProvince.name}`);
                    }
                  }
                  
                  // 4. Find District
                  if (newSelection.province) {
                    const districtData = geoData.districts[newSelection.province.id];
                    const foundDistrict = findLocation(districtData, district?.name);
                    if (foundDistrict) {
                        newSelection.district = foundDistrict;
                        deepestLevel = 'district';
                        console.log(`🏘️ Distrito encontrado: ${foundDistrict.name}`);
                    }
                  }
                  
                  console.log('🎯 Selección final:', newSelection);
                  
                  // --- Update UI ---
                  setSelection(newSelection);
                  const nextLevelIndex = HIERARCHY.indexOf(deepestLevel) + 1;
                  if (nextLevelIndex < HIERARCHY.length) {
                    setLevel(HIERARCHY[nextLevelIndex]);
                  } else {
                    // Si llegamos al nivel más profundo, auto-confirmar
                    onLocationSelect(newSelection);
                    onClose();
                  }
                  setAnimationDirection('forward');
                  setGeolocationStatus('success');

              } catch (error) {
                  console.error("Geolocation processing error:", error);
                  setGeolocationStatus('error');
              }
          },
          (error) => {
              console.error("Browser geolocation error:", error.message);
              setGeolocationStatus('error')
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
      );
  };

  const getTitle = () => {
    switch (level) {
      case 'continent': return 'Selecciona una ubicación';
      case 'country': return `Países en ${selection.continent?.name}`;
      case 'department': return `Departamentos en ${selection.country?.name}`;
      case 'province': return `Provincias en ${selection.department?.name}`;
      case 'district': return `Distritos en ${selection.province?.name}`;
      default: return 'Seleccionar Ubicación';
    }
  };

  const animationVariants = {
    initial: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0
    }),
  };

  // --- SUBCOMPONENTS ---

  const Header = () => (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
      <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-0 disabled:pointer-events-none" disabled={level === 'continent'} aria-label="Go Back">
        <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
      </button>
      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-800 text-center truncate px-2">
        {getTitle()}
      </Dialog.Title>
      <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
        <XMarkIcon className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
  
  const Breadcrumbs = () => (
    <div className="flex items-center flex-wrap gap-x-1 text-sm text-gray-500 py-2.5 bg-gray-50 -mx-6 px-6 border-b border-gray-200 min-h-[40px]">
      {HIERARCHY.map((l, index) => {
        const loc = selection[l];
        if (!loc) return null;
        return (
          <Fragment key={loc.id}>
            <button onClick={() => handleBreadcrumbClick(index)} className="hover:text-blue-600 hover:underline transition-colors disabled:text-gray-800 disabled:font-medium disabled:no-underline disabled:cursor-default" disabled={level === l}>
              {l === 'country' && <span className='mr-1.5 text-lg'>{getCountryFlag(loc.id)}</span>}
              {loc.name}
            </button>
            {selection[HIERARCHY[index+1]] && <span className="text-gray-400">/</span>}
          </Fragment>
        )
      })}
    </div>
  );

  const QuickPicks = () => (
    <div className='mb-4'>
        <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Accesos Rápidos</h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <button onClick={() => handleQuickPick({ continent: {id: 'sa', name: 'América del Sur'}, country: {id: 'pe', name: 'Perú'}, department: {id: 'PE-CUS', name: 'Cusco'}, province: null, district: null})} className='flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition-all'>
                <MapPinIcon className='h-5 w-5 text-blue-500 flex-shrink-0'/>
                <div>
                    <p className='font-semibold text-gray-800'>Cusco</p>
                    <p className='text-xs text-gray-500'>Departamento, Perú</p>
                </div>
            </button>
             <button onClick={() => handleQuickPick({ continent: {id: 'sa', name: 'América del Sur'}, country: {id: 'pe', name: 'Perú'}, department: {id: 'PE-LIM', name: 'Lima'}, province: null, district: null})} className='flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border transition-all'>
                <MapPinIcon className='h-5 w-5 text-blue-500 flex-shrink-0'/>
                <div>
                    <p className='font-semibold text-gray-800'>Lima</p>
                    <p className='text-xs text-gray-500'>Departamento, Perú</p>
                </div>
            </button>
        </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col h-[70vh] overflow-hidden">
                <div className="p-6 pb-0">
                  <Header />
                </div>
                <Breadcrumbs />

                <div className="flex-grow flex flex-col min-h-0 p-6 pt-2">
                  <button
                      onClick={handleGeolocation}
                      disabled={geolocationStatus === 'loading'}
                      className="w-full flex items-center justify-center gap-2.5 mb-4 p-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-wait"
                  >
                      {geolocationStatus === 'loading' ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      ) : (
                          <GlobeAmericasIcon className="h-5 w-5" />
                      )}
                      Usar mi ubicación actual
                  </button>
                  
                  {level === 'continent' && <QuickPicks />}
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Buscar en ${currentList.length} ${LEVEL_NAMES[level]}...`}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="flex-grow overflow-hidden relative">
                    <AnimatePresence initial={false} custom={animationDirection}>
                      <motion.div
                        key={level}
                        custom={animationDirection}
                        variants={animationVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                        className="absolute top-0 left-0 w-full h-full overflow-y-auto -mr-3 pr-3"
                      >
                        {currentList.length > 0 ? (
                          currentList.map(item => (
                            <button key={item.id} onClick={() => handleSelect(item)} className="w-full text-left p-3 flex justify-between items-center hover:bg-blue-50 rounded-lg transition-colors duration-150">
                              <span className='text-gray-700 flex items-center'>
                                {level === 'country' && <span className='mr-3 text-2xl'>{getCountryFlag(item.id)}</span>}
                                {item.name}
                              </span>
                              <ChevronLeftIcon className="h-5 w-5 text-gray-400 transform rotate-180" />
                            </button>
                          ))
                        ) : (
                          <div className='text-center py-10 px-4'>
                              <MapPinIcon className='h-12 w-12 text-gray-300 mx-auto mb-2'/>
                              <p className='font-semibold text-gray-700'>No hay resultados</p>
                              <p className='text-sm text-gray-500'>{searchTerm ? `No se encontró nada para "${searchTerm}"` : `No hay ${LEVEL_NAMES[level]} disponibles.`}</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-auto p-6 pt-4 border-t border-gray-200">
                    <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed" onClick={handleConfirmSelection} disabled={!selection.continent}>
                        Confirmar Selección
                    </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationSelector;