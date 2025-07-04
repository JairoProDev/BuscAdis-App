'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  WrenchScrewdriverIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  PhoneIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServicioDetailProps {
  publication: PublicationData;
}

export default function ServicioDetail({ publication }: ServicioDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  // Log temporal para depuración
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('DEBUG ServicioDetail publication:', publication);
  }

  // Garantizar que attributes siempre exista como objeto
  const attributes = (publication && (publication as any).attributes) ? (publication as any).attributes : {};

  // Datos principales y secundarios con fallbacks robustos
  const servicioData = {
    categoria: publication.subcategorySlug || 'Servicio',
    duracion: attributes.duracion || 'A consultar',
    experiencia: attributes.experiencia || 'A consultar',
    disponibilidad: attributes.disponibilidad || 'A consultar',
    modalidad: attributes.modalidad || 'A consultar',
    precio: publication.value || 0,
    calificacion: typeof attributes.calificacion === 'number' ? attributes.calificacion : 4.8, // mock si no existe
    trabajosCompletados: typeof attributes.trabajosCompletados === 'number' ? attributes.trabajosCompletados : 150, // mock si no existe
    certificaciones: Array.isArray(attributes.certificaciones) ? attributes.certificaciones : ['Técnico especializado', 'Garantía de servicio'],
    serviciosIncluidos: Array.isArray(attributes.serviciosIncluidos) ? attributes.serviciosIncluidos : ['Diagnóstico gratuito', 'Garantía 30 días', 'Materiales incluidos'],
    herramientasPropias: typeof attributes.herramientasPropias === 'boolean' ? attributes.herramientasPropias : true,
    disponibilidadUrgente: typeof attributes.disponibilidadUrgente === 'boolean' ? attributes.disponibilidadUrgente : true
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
    { id: 'descripcion', label: 'Descripción', icon: DocumentTextIcon },
    { id: 'detalles', label: 'Detalles', icon: WrenchScrewdriverIcon },
    { id: 'experiencia', label: 'Experiencia', icon: StarIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Service Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-purple-600 p-3 rounded-xl">
            <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                🔧 {servicioData.categoria}
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {servicioData.modalidad}
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
                {formatPrice(servicioData.precio)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Service Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{servicioData.calificacion}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">⭐ Calificación</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{servicioData.trabajosCompletados}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Trabajos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{servicioData.experiencia}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Experiencia</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{servicioData.duracion}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Duración</div>
        </div>
      </motion.div>

      {/* Tabbed Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
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
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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

        <div className="p-6">
          {activeTab === 'descripcion' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción del Servicio</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-2">🔧 Servicios incluidos</h5>
                <div className="space-y-2">
                  {servicioData.serviciosIncluidos.map((servicio, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-purple-800 dark:text-purple-200">{servicio}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detalles' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles del Servicio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">💰 Precio</h5>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(servicioData.precio)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">⏰ Disponibilidad</h5>
                    <p className="text-gray-700 dark:text-gray-300">{servicioData.disponibilidad}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experiencia' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Experiencia y Certificaciones</h4>
                <div className="space-y-4">
                  {servicioData.certificaciones.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 dark:text-green-300">{cert}</span>
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 