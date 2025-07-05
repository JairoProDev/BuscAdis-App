'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TruckIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CogIcon,
  SparklesIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VehiculoDetailProps {
  publication: PublicationData;
}

export default function VehiculoDetail({ publication }: VehiculoDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  // Log temporal para depuración
  if (typeof window !== 'undefined') {
     
    console.log('DEBUG VehiculoDetail publication:', publication);
  }

  // Garantizar que attributes siempre exista como objeto
  const attributes = (publication && (publication as any).attributes) ? (publication as any).attributes : {};

  // Función robusta para extraer y formatear el kilometraje
  function getKilometraje(raw: any): string {
    if (raw === undefined || raw === null) return 'A consultar';
    const num = typeof raw === 'string' ? parseInt(raw.replace(/[^\d]/g, '')) : Number(raw);
    if (isNaN(num) || num <= 0) return 'A consultar';
    return `${num.toLocaleString()} km`;
  }

  // Datos principales y secundarios con fallbacks robustos
  const vehiculoData = {
    año: attributes.ano || attributes.año || 'A consultar',
    kilometraje: getKilometraje(attributes.kilometraje),
    combustible: attributes.tipo_combustible || 'A consultar',
    transmision: attributes.transmision || 'A consultar',
    color: attributes.color || 'A consultar',
    cilindrada: attributes.cilindrada_cc || 'A consultar',
    estado: attributes.estado || 'A consultar',
    marca: attributes.marca || publication.marca || 'A consultar',
    modelo: attributes.modelo || publication.modelo || 'A consultar',
    version: attributes.version || 'A consultar',
    precio: publication.value || 0,
    negociable: typeof attributes.negociable === 'boolean' ? attributes.negociable : true,
    financiamiento: typeof attributes.financiamiento === 'boolean' ? attributes.financiamiento : true,
    documentos: Array.isArray(attributes.documentos) ? attributes.documentos : ['SOAT vigente', 'Revisión técnica', 'Tarjeta de propiedad'],
    extras: Array.isArray(attributes.extras) ? attributes.extras : ['Aire acondicionado', 'Dirección hidráulica', 'Alarma', 'Radio MP3'],
    mantenimiento: attributes.mantenimiento || 'Al día',
    accidentes: attributes.accidentes || 'Sin accidentes'
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

  const formatKilometraje = (km: number) => {
    return `${km.toLocaleString()} km`;
  };

  const tabs = [
    { id: 'descripcion', label: 'Descripción', icon: DocumentTextIcon },
    { id: 'especificaciones', label: 'Especificaciones', icon: CogIcon },
    { id: 'estado', label: 'Estado', icon: ShieldCheckIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Vehicle Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-red-600 p-3 rounded-xl">
            <TruckIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                🚗 {vehiculoData.marca} {vehiculoData.modelo}
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {vehiculoData.año}
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
                {formatPrice(vehiculoData.precio)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vehicle Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{vehiculoData.año}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Año</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vehiculoData.kilometraje}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Kilometraje</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{vehiculoData.combustible}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Combustible</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{vehiculoData.transmision}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Transmisión</div>
        </div>
      </motion.div>

      {/* Price and Financing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
          Precio y Financiamiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Precio</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(vehiculoData.precio)}
            </p>
            {vehiculoData.negociable && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                Negociable
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Financiamiento</p>
            <div className="flex items-center gap-2">
              {vehiculoData.financiamiento ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Disponible
                </span>
              ) : (
                <span className="text-gray-500">No disponible</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estado</p>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
              {vehiculoData.estado}
            </span>
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
                      ? 'border-red-500 text-red-600 dark:text-red-400'
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
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción del Vehículo</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">🚗 Detalles principales</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Marca:</span> {vehiculoData.marca}
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Modelo:</span> {vehiculoData.modelo}
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Versión:</span> {vehiculoData.version}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'especificaciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Especificaciones Técnicas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Motor</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehiculoData.cilindrada}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Combustible</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehiculoData.combustible}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Transmisión</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehiculoData.transmision}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Color</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehiculoData.color}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Equipamiento</h4>
                <div className="space-y-2">
                  {vehiculoData.extras.map((extra, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{extra}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'estado' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Estado del Vehículo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-300">Mantenimiento</span>
                    </div>
                    <p className="text-green-800 dark:text-green-200">{vehiculoData.mantenimiento}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">Accidentes</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">{vehiculoData.accidentes}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Documentación</h4>
                <div className="space-y-2">
                  {vehiculoData.documentos.map((documento, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{documento}</span>
                    </div>
                  ))}
                </div>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h5 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Consejos de seguridad</h5>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Revisa físicamente el vehículo antes de comprar</li>
                  <li>• Verifica la documentación original</li>
                  <li>• Solicita prueba de manejo</li>
                  <li>• Considera una inspección técnica</li>
                  <li>• Negocia en lugar público y seguro</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 