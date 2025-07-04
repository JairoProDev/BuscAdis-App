'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhoneIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NegocioDetailProps {
  publication: PublicationData;
}

export default function NegocioDetail({ publication }: NegocioDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  const negocioData = {
    tipoNegocio: 'Franquicia', // From publication
    sector: 'Alimentación', // From publication
    inversion: publication.value || 0,
    roi: '15-20%', // From publication attributes
    experiencia: 'No requerida', // From publication attributes
    capacitacion: 'Incluida', // From publication attributes
    soporte: '24/7',
    territorioExclusivo: true,
    financiamiento: true,
    tiempoRecuperation: '18-24 meses',
    empleados: '3-5 personas',
    horarios: 'Flexible',
    beneficios: ['Marca reconocida', 'Marketing incluido', 'Capacitación completa'],
    requisitos: ['Capital inicial', 'Local comercial', 'Dedicación tiempo completo'],
    incluye: ['Equipamiento', 'Inventario inicial', 'Manual operativo']
  };

  const formatPrice = (value: number) => {
    if (!value || value === 0) return 'Inversión a consultar';
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
    { id: 'inversion', label: 'Inversión', icon: BanknotesIcon },
    { id: 'retorno', label: 'Retorno', icon: ArrowTrendingUpIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Business Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <BuildingOfficeIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                💼 {negocioData.tipoNegocio}
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {negocioData.sector}
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
                {formatPrice(negocioData.inversion)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Business Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{negocioData.roi}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">ROI estimado</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{negocioData.tiempoRecuperation}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Recuperación</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{negocioData.empleados}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Personal</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{negocioData.experiencia}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Experiencia</div>
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
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
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
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción del Negocio</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <h5 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">💼 Beneficios incluidos</h5>
                <div className="space-y-2">
                  {negocioData.beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm text-indigo-800 dark:text-indigo-200">{beneficio}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inversion' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles de Inversión</h4>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {formatPrice(negocioData.inversion)}
                    </div>
                    <p className="text-green-800 dark:text-green-200">inversión inicial</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 dark:text-green-400 font-medium">Financiamiento:</span> {negocioData.financiamiento ? 'Disponible' : 'No disponible'}
                    </div>
                    <div>
                      <span className="text-green-600 dark:text-green-400 font-medium">Capacitación:</span> {negocioData.capacitacion}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Inversión incluye</h5>
                <div className="space-y-2">
                  {negocioData.incluye.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'retorno' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Proyección de Retorno</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBarIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">ROI Anual</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{negocioData.roi}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-300">Recuperación</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{negocioData.tiempoRecuperation}</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Requisitos</h5>
                <div className="space-y-2">
                  {negocioData.requisitos.map((requisito, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{requisito}</span>
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">📊 Datos importantes</h5>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Evalúa cuidadosamente el plan de negocio</li>
                  <li>• Solicita estados financieros de otras franquicias</li>
                  <li>• Verifica la experiencia del franquiciador</li>
                  <li>• Asesórate con un abogado especializado</li>
                  <li>• Considera el territorio y la competencia</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 