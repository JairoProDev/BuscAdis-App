'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  SparklesIcon,
  DocumentTextIcon,
  PhoneIcon,
  UsersIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComunidadDetailProps {
  publication: PublicationData;
}

export default function ComunidadDetail({ publication }: ComunidadDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  const comunidadData = {
    tipoComunidad: 'Grupo de apoyo', // From publication
    categoria: 'Bienestar', // From publication
    miembros: 150, // From publication attributes
    actividad: 'Muy activa', // From publication attributes
    modalidad: 'Presencial y virtual', // From publication attributes
    frecuencia: 'Semanal', // From publication attributes
    gratuito: true,
    edadPromedio: '25-45 años',
    requisitos: 'Ninguno',
    horarios: 'Martes y jueves 7:00 PM',
    actividades: ['Reuniones grupales', 'Talleres', 'Eventos sociales'],
    beneficios: ['Apoyo emocional', 'Networking', 'Desarrollo personal'],
    organizadores: ['Psicólogo certificado', 'Voluntarios entrenados'],
    temas: ['Ansiedad', 'Relaciones', 'Crecimiento personal']
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
    { id: 'comunidad', label: 'Comunidad', icon: UserGroupIcon },
    { id: 'actividades', label: 'Actividades', icon: SparklesIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-teal-600 p-3 rounded-xl">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-medium">
                🤝 {comunidadData.tipoComunidad}
              </span>
              <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full text-sm font-medium">
                {comunidadData.categoria}
              </span>
              {comunidadData.gratuito && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  Gratuito
                </span>
              )}
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
                <UsersIcon className="w-4 h-4" />
                {comunidadData.miembros} miembros
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{comunidadData.miembros}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Miembros</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{comunidadData.actividad}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Actividad</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{comunidadData.frecuencia}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Encuentros</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{comunidadData.modalidad}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Modalidad</div>
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
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
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
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción de la Comunidad</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                <h5 className="font-medium text-teal-900 dark:text-teal-300 mb-2">🎯 Temas que tratamos</h5>
                <div className="flex flex-wrap gap-2">
                  {comunidadData.temas.map((tema, index) => (
                    <span key={index} className="bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm">
                      {tema}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comunidad' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Sobre Nuestra Comunidad</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Edad promedio</p>
                    <p className="font-medium text-gray-900 dark:text-white">{comunidadData.edadPromedio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Requisitos</p>
                    <p className="font-medium text-gray-900 dark:text-white">{comunidadData.requisitos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Horarios</p>
                    <p className="font-medium text-gray-900 dark:text-white">{comunidadData.horarios}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Modalidad</p>
                    <p className="font-medium text-gray-900 dark:text-white">{comunidadData.modalidad}</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Organizadores</h5>
                <div className="space-y-2">
                  {comunidadData.organizadores.map((organizador, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <HandRaisedIcon className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{organizador}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actividades' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Nuestras Actividades</h4>
                <div className="space-y-4">
                  {comunidadData.actividades.map((actividad, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <SparklesIcon className="w-5 h-5 text-teal-600" />
                        <span className="font-medium text-gray-900 dark:text-white">{actividad}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Beneficios de participar</h5>
                <div className="space-y-2">
                  {comunidadData.beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{beneficio}</span>
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
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                <h5 className="font-medium text-teal-900 dark:text-teal-300 mb-2">🤝 Cómo unirse</h5>
                <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-1">
                  <li>• Contáctanos por WhatsApp para más información</li>
                  <li>• La primera sesión es gratuita para conocernos</li>
                  <li>• No hay compromisos a largo plazo</li>
                  <li>• Respetamos la privacidad y confidencialidad</li>
                  <li>• Ambiente inclusivo y libre de juicios</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 