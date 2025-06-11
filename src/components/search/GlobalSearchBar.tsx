'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronDownIcon,
  CameraIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

const GlobalSearchBar = () => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [country, setCountry] = useState('PE');
  const [department, setDepartment] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');

  // Placeholder data
  const categories = [
    { id: 'inmuebles', name: 'Inmuebles' },
    { id: 'vehiculos', name: 'Vehículos' },
    { id: 'empleos', name: 'Empleos' },
  ];

  const CustomSelect = ({ icon: Icon, label, options, 'aria-label': ariaLabel }) => (
    <div className="flex items-center bg-white dark:bg-slate-800 rounded-md px-3 h-12 flex-shrink-0">
      {Icon && <Icon className="w-5 h-5 text-slate-400 mr-2" />}
      <select
        aria-label={ariaLabel}
        className="appearance-none bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none w-full h-full pr-8"
      >
        <option value="">{label}</option>
        {options.map(opt => <option key={opt.id || opt} value={opt.id || opt}>{opt.name || opt}</option>)}
      </select>
      <ChevronDownIcon className="w-5 h-5 text-slate-400 pointer-events-none -ml-6" />
    </div>
  );

  return (
    <div className="sticky top-0 z-30 bg-slate-900/70 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0" >
                   <Image src="/logo.png" alt="BuscAdis Logo" width={32} height={32} />
                   <span className="font-bold text-xl ml-2 text-white hidden md:inline">BuscAdis</span>
                </Link>

                {/* Main Search Area */}
                <div className="flex-grow flex items-center gap-2">
                    {/* Free text input */}
                    <div className="flex-grow flex items-center bg-white dark:bg-slate-800 rounded-md px-3 h-12">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Estoy buscando..."
                            className="w-full h-full bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none"
                        />
                         <button aria-label="Search by voice" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <MicrophoneIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button aria-label="Search by image" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <CameraIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>

                    {/* Selectors */}
                    <CustomSelect
                        icon={MapPinIcon}
                        label="Ubicación"
                        aria-label="Location"
                        options={[{ id: 'lima', name: 'Lima' }, { id: 'cusco', name: 'Cusco' }]}
                    />
                     <CustomSelect
                        label="Categoría"
                        aria-label="Category"
                        options={categories}
                    />

                    {/* Search Button */}
                    <button className="flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex-shrink-0">
                        <span>Buscar</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GlobalSearchBar; 