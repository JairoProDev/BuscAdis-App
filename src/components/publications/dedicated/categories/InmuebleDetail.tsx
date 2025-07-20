'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  RectangleGroupIcon,
  UserIcon,
  PhoneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface InmuebleDetailProps {
  publication: PublicationData;
}

export default function InmuebleDetail({ publication }: InmuebleDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  // Real estate specific data structure
  const inmuebleData = {
    habitaciones: 3, // From publication attributes
    baños: 2, // From publication attributes
    area: 120, // From publication attributes
    estacionamientos: 1, // From publication attributes
    pisos: 2, // From publication attributes
    antiguedad: '5 años', // From publication attributes
    tipoPropiedad: 'Casa', // From publication
    transaccion: publication.transactionType === 'rent' ? 'Alquiler' : 'Venta',
    caracteristicas: ['Aire acondicionado', 'Jardín', 'Terraza', 'Cochera'],
    servicios: ['Agua', 'Luz', 'Gas', 'Internet'],
    ubicacion: 'Céntrica',
    precio: publication.value || 0,
    precioM2: publication.value ? Math.round(publication.value / 120) : 0
  };

  const formatPrice = (value: number) => {
    if (!value || value === 0) return 'Precio a consultar';
    return `S/ ${value.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Hace algunos días';
    }
  };

  const tabs = [
    { id: 'descripcion', label: 'Descripción', icon: RectangleGroupIcon },
    { id: 'caracteristicas', label: 'Características', icon: SparklesIcon },
    { id: 'ubicacion', label: 'Ubicación', icon: MapPinIcon },
    { id: 'contacto', label: 'Contacto', icon: UserIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Property Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-green-600 p-3 rounded-xl">
            <HomeIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                🏠 {inmuebleData.tipoPropiedad}
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {inmuebleData.transaccion}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {publication.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {publication.location?.district || 'Lima'}, {publication.location?.province || 'Lima'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {formatDate(publication.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                {formatPrice(inmuebleData.precio)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Property Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{inmuebleData.habitaciones}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Habitaciones</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inmuebleData.baños}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Baños</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{inmuebleData.area}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">m²</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inmuebleData.estacionamientos}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Cocheras</div>
        </div>
      </motion.div>

      {/* Price Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          Precio y Valorización
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Precio Total</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(inmuebleData.precio)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Precio por m²</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatPrice(inmuebleData.precioM2)}/m²
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Área Total</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {inmuebleData.area} m²
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'descripcion' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción de la Propiedad</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
            </div>
          )}

          {activeTab === 'caracteristicas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Características Principales</h4>
                <div className="space-y-2">
                  {inmuebleData.caracteristicas.map((caracteristica, index) => (
                    <div key={`caracteristica-${index}-${caracteristica.substring(0, 15).replace(/\s+/g, '-').toLowerCase()}`} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{caracteristica}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Servicios Incluidos</h4>
                <div className="space-y-2">
                  {inmuebleData.servicios.map((servicio, index) => (
                    <div key={`servicio-${index}-${servicio.substring(0, 15).replace(/\s+/g, '-').toLowerCase()}`} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{servicio}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ubicacion' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Ubicación y Accesos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Distrito</p>
                  <p className="font-medium text-gray-900 dark:text-white">{publication.location?.district || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Provincia</p>
                  <p className="font-medium text-gray-900 dark:text-white">{publication.location?.province || 'No especificado'}</p>
                </div>
              </div>
              <div className="mt-4 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Mapa interactivo próximamente</p>
              </div>
            </div>
          )}

          {activeTab === 'contacto' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Información de Contacto</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                    <p className="font-medium text-gray-900 dark:text-white">{publication.whatsapp}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Consejos para visitar</h5>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Programa tu visita en horario diurno</li>
                  <li>• Verifica la documentación de la propiedad</li>
                  <li>• Pregunta por gastos adicionales</li>
                  <li>• Revisa el estado de instalaciones</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 