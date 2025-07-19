'use client';

import { Fragment, useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronLeftIcon, MapPinIcon, GlobeAmericasIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';
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

export type Selection = {
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
  onLocationSelect: (selection: Partial<Selection>) => void;
  onClose: () => void;
  initialSelection?: Partial<Selection>;
}

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

// --- MAIN COMPONENT ---

const LocationSelector = ({ onClose, onLocationSelect, initialSelection = {} }: LocationSelectorProps) => {
  const [selection, setSelection] = useState<Selection>({
    continent: null, country: null, department: null, province: null, district: null,
    ...initialSelection
  });
  const [level, setLevel] = useState<Level>('continent');
  const [searchTerm, setSearchTerm] = useState('');
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');
  const [isOpen, setIsOpen] = useState(true);

  const peruDefault: Selection = useMemo(() => ({
      continent: { id: 'sa', name: 'América del Sur' },
      country: { id: 'pe', name: 'Perú' },
      department: null,
      province: null,
      district: null,
  }), []);

  useEffect(() => {
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
  }, [initialSelection, peruDefault]);
  
  const currentList = useMemo(() => {
    let list: Location[] = [];

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
  }, [level, selection, searchTerm]);

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
        handleClose();
      }
    } else {
        // This is a final selection (district), close the modal
        onLocationSelect(newSelection);
        handleClose();
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
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 150); // Wait for animation
  };
  
  const handleGeolocation = async () => {
    setGeolocationStatus('loading');
    
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      // Simple reverse geocoding logic for Peru
      // In a real app, you'd use a geocoding service
      const estimatedLocation: Selection = {
        continent: { id: 'sa', name: 'América del Sur' },
        country: { id: 'pe', name: 'Perú' },
        department: { id: 'cusco', name: 'Cusco' }, // Default to Cusco for demo
        province: null,
        district: null,
      };

      setSelection(estimatedLocation);
      setLevel('province');
      setGeolocationStatus('success');
      
      // Auto-confirm after 2 seconds
      setTimeout(() => {
        onLocationSelect(estimatedLocation);
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      setGeolocationStatus('error');
      setTimeout(() => setGeolocationStatus('idle'), 3000);
    }
  };

  const getTitle = () => {
    const titles: Record<Level, string> = {
      continent: 'Selecciona una ubicación',
      country: 'Países',
      department: 'Departamentos',
      province: 'Provincias',
      district: 'Distritos'
    };
    return titles[level] || 'Selecciona una ubicación';
  };

  const Header = () => (
    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {level !== 'continent' && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        )}
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {getTitle()}
        </h2>
      </div>
      <button
        onClick={handleClose}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        aria-label="Cerrar"
      >
        <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
      </button>
    </div>
  );

  const Breadcrumbs = () => (
    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-2 text-sm">
        {HIERARCHY.map((h, index) => {
          const item = selection[h];
          const isActive = h === level;
          const isCompleted = item !== null;
          
          if (!isCompleted && !isActive) return null;
          
          return (
            <Fragment key={h}>
              {index > 0 && (
                <span className="text-slate-400 dark:text-slate-500">/</span>
              )}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`px-2 py-1 rounded transition-colors ${
                  isActive 
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                {item?.name || LEVEL_NAMES[h]}
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );

  const QuickPicks = () => (
    <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-3">
        {/* Geolocation Button */}
        <button
          onClick={handleGeolocation}
          disabled={geolocationStatus === 'loading'}
          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {geolocationStatus === 'loading' ? (
            <ArrowPathIcon className="w-5 h-5 text-teal-500 animate-spin" />
          ) : geolocationStatus === 'success' ? (
            <CheckIcon className="w-5 h-5 text-green-500" />
          ) : (
            <MapPinIcon className="w-5 h-5 text-teal-500 group-hover:text-teal-600" />
          )}
          <div className="text-left">
            <div className="font-medium text-slate-800 dark:text-slate-100">
              {geolocationStatus === 'loading' && 'Detectando ubicación...'}
              {geolocationStatus === 'success' && 'Ubicación detectada'}
              {geolocationStatus === 'error' && 'Error al detectar ubicación'}
              {geolocationStatus === 'idle' && 'Usar mi ubicación actual'}
            </div>
            {geolocationStatus === 'idle' && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Detectar automáticamente tu ubicación
              </div>
            )}
          </div>
        </button>

        {/* Quick Access - Peru Departments */}
        {level === 'department' && selection.country?.id === 'pe' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'cusco', name: 'Cusco' },
              { id: 'lima', name: 'Lima' },
              { id: 'arequipa', name: 'Arequipa' },
              { id: 'piura', name: 'Piura' }
            ].map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleSelect(dept)}
                className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 text-left"
              >
                <GlobeAmericasIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {dept.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl transition-all">
                <Header />
                <Breadcrumbs />
                <QuickPicks />
                
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={`Buscar en ${currentList.length} ${LEVEL_NAMES[level].toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Results List */}
                <div className="max-h-96 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, x: animationDirection === 'forward' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: animationDirection === 'forward' ? -20 : 20 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-2"
                    >
                      {currentList.length === 0 ? (
                        <div className="text-center py-8">
                          <GlobeAmericasIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 dark:text-slate-400">
                            No se encontraron resultados
                          </p>
                        </div>
                      ) : (
                        currentList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center group-hover:from-teal-200 group-hover:to-cyan-200 dark:group-hover:from-teal-800/50 dark:group-hover:to-cyan-800/50 transition-all duration-200">
                              {level === 'country' ? (
                                <span className="text-lg">{getCountryFlag(item.id)}</span>
                              ) : (
                                <MapPinIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {LEVEL_NAMES[level].slice(0, -1)} {/* Remove 's' */}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer with Confirm Button */}
                {Object.values(selection).some(v => v !== null) && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                      onClick={handleConfirmSelection}
                      className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      Confirmar Selección
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LocationSelector;