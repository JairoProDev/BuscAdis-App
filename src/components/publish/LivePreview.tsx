'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { PublicationFormData } from '@/types/publication';
import Image from 'next/image';
interface LivePreviewProps {
  formData: PublicationFormData;
}

const LivePreview: React.FC<LivePreviewProps> = ({ formData }) => {
  // Validaciones defensivas para asegurar que todos los datos estén bien definidos
  const safeAd = {
    title: formData?.title || '',
    description: formData?.description || '',
    categorySlug: formData?.categorySlug || '',
    amount: formData?.amount || null,
    negotiable: formData?.negotiable || false,
    location: {
      district: formData?.location?.district || '',
      province: formData?.location?.province || ''
    },
    contact: {
      phones: Array.isArray(formData?.contact?.phones) ? formData.contact.phones : ['']
    },
    images: Array.isArray(formData?.images) ? formData.images : []
  };

  const safeAchievements = {
    completed: [],
    points: 0,
    badges: []
  };

  const getCompletionItems = () => {
    const items = [
      { key: 'title', label: 'Título', completed: !!safeAd.title && safeAd.title.length >= 10 },
      { key: 'description', label: 'Descripción', completed: !!safeAd.description && safeAd.description.length >= 30 },
      { key: 'category', label: 'Categoría', completed: !!safeAd.categorySlug },
      { key: 'price', label: 'Precio', completed: safeAd.amount !== null && safeAd.amount > 0 },
      { key: 'location', label: 'Ubicación', completed: !!safeAd.location?.district || !!safeAd.location?.province },
      { key: 'contact', label: 'Contacto', completed: !!safeAd.contact?.phones?.[0] },
      { key: 'images', label: 'Imágenes', completed: !!safeAd.images?.length }
    ];
    return items;
  };

  const completionItems = getCompletionItems();
  const completedCount = completionItems.filter(item => item.completed).length;
  const totalItems = completionItems.length;

  // Mostrar nombre de categoría si está disponible
  const categoryName = formData?.categoryName || safeAd.categorySlug;

  return (
    <div className="space-y-4">
      {/* Header de preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            Vista Previa
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">En vivo</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Preview del anuncio */}
        <motion.div 
          layout
          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
        >
          {/* Título */}
          <div className="mb-2">
            {safeAd.title ? (
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{safeAd.title}</h4>
            ) : (
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            )}
          </div>

          {/* Precio */}
          <div className="mb-2">
            {safeAd.amount ? (
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                S/. {safeAd.amount.toLocaleString()}
                {safeAd.negotiable && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(Negociable)</span>}
              </div>
            ) : (
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-3">
            {safeAd.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{safeAd.description}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            {categoryName && (
              <span className="flex items-center bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                <TagIcon className="w-3 h-3 mr-1" />
                {categoryName}
              </span>
            )}
            
            {(safeAd.location?.district || safeAd.location?.province) && (
              <span className="flex items-center bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {safeAd.location.district || safeAd.location.province}
              </span>
            )}

            <span className="flex items-center bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Hoy
            </span>
          </div>

          {/* Imágenes */}
          {safeAd.images && safeAd.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {safeAd.images.slice(0, 3).map((img: string, idx: number) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`Imagen ${idx + 1}`}
                  className="rounded object-cover h-16 w-full"
                  width={128}
                  height={64}
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* Contacto */}
          {safeAd.contact?.phones?.[0] && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {safeAd.contact.phones[0]}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Lista de completitud */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount}/{totalItems}
          </span>
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
              <motion.div
                initial={false}
                animate={{ 
                  scale: item.completed ? 1 : 0.8,
                  opacity: item.completed ? 1 : 0.5 
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.completed 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {item.completed ? '✓' : '○'}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamificación rápida */}
      {safeAchievements.points > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{safeAchievements.points}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Puntos acumulados</div>
            
            {safeAchievements.badges.length > 0 && (
              <div className="mt-2 flex justify-center space-x-1">
                {safeAchievements.badges.slice(0, 3).map((badge: string, index: number) => (
                  <span key={index} className="text-lg">
                    {badge === 'oro' ? '🥇' : badge === 'plata' ? '🥈' : '🥉'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview; 