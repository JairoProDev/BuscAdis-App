'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  StarIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  PhoneIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductoDetailProps {
  publication: PublicationData;
}

export default function ProductoDetail({ publication }: ProductoDetailProps) {
  const [activeTab, setActiveTab] = useState('descripcion');

  const productoData = {
    marca: 'Sony', // From publication
    modelo: 'WH-1000XM4', // From publication
    condicion: 'Nuevo', // From publication attributes
    garantia: '12 meses', // From publication attributes
    origen: 'Nacional', // From publication attributes
    precio: publication.value || 0,
    stock: 5,
    envioGratis: true,
    devolucion: '30 días',
    caracteristicas: ['Cancelación de ruido', 'Bluetooth 5.0', 'Batería 30 horas'],
    incluye: ['Audífonos', 'Cable USB-C', 'Estuche', 'Manual'],
    vendedor: 'Tienda oficial',
    calificacionVendedor: 4.9
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
    { id: 'especificaciones', label: 'Especificaciones', icon: ShoppingBagIcon },
    { id: 'garantia', label: 'Garantía', icon: ShieldCheckIcon },
    { id: 'contacto', label: 'Contacto', icon: PhoneIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-orange-600 p-3 rounded-xl">
            <ShoppingBagIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                📦 {productoData.marca}
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {productoData.condicion}
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
                {formatPrice(productoData.precio)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{productoData.stock}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">En Stock</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{productoData.garantia}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Garantía</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{productoData.envioGratis ? 'GRATIS' : 'Costo extra'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Envío</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{productoData.devolucion}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Devolución</div>
        </div>
      </motion.div>

      {/* Seller Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-600" />
          Información del Vendedor
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{productoData.vendedor}</p>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{productoData.calificacionVendedor} calificación</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatPrice(productoData.precio)}
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
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
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
              <h4 className="font-semibold text-gray-900 dark:text-white">Descripción del Producto</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {publication.description}
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-2">📦 Incluye en la caja</h5>
                <div className="space-y-2">
                  {productoData.incluye.map((item) => (
                    <div key={`incluye-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-orange-800 dark:text-orange-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'especificaciones' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Especificaciones Técnicas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Marca</span>
                    <span className="font-medium text-gray-900 dark:text-white">{productoData.marca}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Modelo</span>
                    <span className="font-medium text-gray-900 dark:text-white">{productoData.modelo}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Origen</span>
                    <span className="font-medium text-gray-900 dark:text-white">{productoData.origen}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Características principales</h5>
                <div className="space-y-2">
                  {productoData.caracteristicas.map((caracteristica) => (
                    <div key={`caracteristica-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{caracteristica}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'garantia' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Garantía y Devoluciones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-300">Garantía</span>
                    </div>
                    <p className="text-green-800 dark:text-green-200">{productoData.garantia} garantía oficial</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TruckIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-300">Devolución</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">{productoData.devolucion} para devoluciones</p>
                  </div>
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
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">🛒 Consejos de compra</h5>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Verifica la autenticidad del producto</li>
                  <li>• Solicita factura o boleta</li>
                  <li>• Revisa los términos de garantía</li>
                  <li>• Pregunta por métodos de pago seguros</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 