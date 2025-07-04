'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  PhoneIcon,
  TicketIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventoDetailProps {
  publication: PublicationData;
}

export default function EventoDetail({ publication }: EventoDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  const eventoData = {
    fechaEvento: '2024-03-15', // From publication attributes
    horaInicio: '20:00', // From publication attributes
    horaFin: '02:00', // From publication attributes
    capacidad: 500, // From publication attributes
    entradas: 350, // Available tickets
    tipoEvento: 'Concierto', // From publication
    categoria: 'Música', // From publication
    precio: publication.value || 0,
    edadMinima: 18,
    dresscode: 'Casual elegante',
    incluye: ['Entrada', 'Barra libre', 'DJ en vivo'],
    organizador: 'Eventos Lima',
    venue: 'Club Central',
    musica: ['Rock', 'Pop', 'Electronic'],
    servicios: ['Seguridad', 'Valet parking', 'Cloakroom']
  };

  const formatPrice = (value: number) => {
    if (!value || value === 0) return 'Entrada gratuita';
    return `S/ ${value.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Hace algunos días';
    }
  };

  const formatEventDate = (date: string) => {
    try {
      return format(new Date(date), 'EEEE, d MMMM yyyy', { locale: es });
    } catch {
      return date;
    }
  };

  const tabs = [
    { id: 'descripcion', label: 'Descripción', icon: DocumentTextIcon },
    { id: 'detalles', label: 'Detalles', icon: CalendarIcon },
    { id: 'entradas', label: 'Entradas', icon: TicketIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-pink-600 p-3 rounded-xl">
            <MusicalNoteIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-medium">
                🎉 {eventoData.tipoEvento}
              </span>
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                {eventoData.categoria}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {publication.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {formatEventDate(eventoData.fechaEvento)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {eventoData.horaInicio} - {eventoData.horaFin}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                {formatPrice(eventoData.precio)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Event Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{eventoData.entradas}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Entradas disponibles</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{eventoData.capacidad}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Capacidad total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{eventoData.edadMinima}+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Edad mínima</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{eventoData.horaInicio}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Hora inicio</div>
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
                      ? 'border-pink-500 text-pink-600 dark:text-pink-400'
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
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción del Evento</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <h5 className="font-medium text-pink-900 dark:text-pink-300 mb-2">🎵 Géneros musicales</h5>
                <div className="flex flex-wrap gap-2">
                  {eventoData.musica.map((genero, index) => (
                    <span key={index} className="bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm">
                      {genero}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detalles' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles del Evento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Organizador</p>
                    <p className="font-medium text-gray-900 dark:text-white">{eventoData.organizador}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Venue</p>
                    <p className="font-medium text-gray-900 dark:text-white">{eventoData.venue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dress Code</p>
                    <p className="font-medium text-gray-900 dark:text-white">{eventoData.dresscode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {publication.location?.district || 'Lima'}, {publication.location?.province || 'Lima'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Servicios incluidos</h5>
                <div className="space-y-2">
                  {eventoData.servicios.map((servicio, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{servicio}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entradas' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Información de Entradas</h4>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {formatPrice(eventoData.precio)}
                    </div>
                    <p className="text-green-800 dark:text-green-200 mb-4">por entrada</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">Disponibles:</span> {eventoData.entradas}
                      </div>
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">Total:</span> {eventoData.capacidad}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Incluye</h5>
                <div className="space-y-2">
                  {eventoData.incluye.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
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
                <h5 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">🎫 Información importante</h5>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Las entradas son intransferibles</li>
                  <li>• Se requiere identificación válida</li>
                  <li>• No se permiten reembolsos</li>
                  <li>• El evento se realizará sin importar el clima</li>
                  <li>• Prohibido el ingreso con bebidas externas</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 