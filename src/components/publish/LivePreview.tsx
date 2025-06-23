'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  TagIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { PublicationFormData } from '@/types/publication';

interface LivePreviewProps {
  ad: PublicationFormData;
  quality: number;
  achievements: {
    completed: string[];
    points: number;
    badges: string[];
  };
}

const LivePreview: React.FC<LivePreviewProps> = ({ ad, quality, achievements }) => {
  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-blue-600';
    if (quality >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCompletionItems = () => {
    const items = [
      { key: 'title', label: 'Título', completed: !!ad.title && ad.title.length >= 10 },
      { key: 'description', label: 'Descripción', completed: !!ad.description && ad.description.length >= 30 },
      { key: 'category', label: 'Categoría', completed: !!ad.categorySlug },
      { key: 'price', label: 'Precio', completed: ad.amount !== null && ad.amount > 0 },
      { key: 'location', label: 'Ubicación', completed: !!ad.location?.district || !!ad.location?.province },
      { key: 'contact', label: 'Contacto', completed: !!ad.contact?.phones?.[0] },
      { key: 'images', label: 'Imágenes', completed: !!ad.images?.length }
    ];
    return items;
  };

  const completionItems = getCompletionItems();
  const completedCount = completionItems.filter(item => item.completed).length;
  const totalItems = completionItems.length;
  const completionPercentage = (completedCount / totalItems) * 100;

  return (
    <div className="space-y-4">
      {/* Header de preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2" />
            Vista Previa
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">En vivo</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Preview del anuncio */}
        <motion.div 
          layout
          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          {/* Título */}
          <div className="mb-2">
            {ad.title ? (
              <h4 className="font-semibold text-gray-900 line-clamp-2">{ad.title}</h4>
            ) : (
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            )}
          </div>

          {/* Precio */}
          <div className="mb-2">
            {ad.amount ? (
              <div className="text-lg font-bold text-blue-600">
                S/. {ad.amount.toLocaleString()}
                {ad.negotiable && <span className="text-sm text-gray-500 ml-1">(Negociable)</span>}
              </div>
            ) : (
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-3">
            {ad.description ? (
              <p className="text-sm text-gray-600 line-clamp-3">{ad.description}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {ad.categorySlug && (
              <span className="flex items-center bg-gray-200 px-2 py-1 rounded">
                <TagIcon className="w-3 h-3 mr-1" />
                {ad.categorySlug}
              </span>
            )}
            
            {(ad.location?.district || ad.location?.province) && (
              <span className="flex items-center bg-gray-200 px-2 py-1 rounded">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {ad.location.district || ad.location.province}
              </span>
            )}

            <span className="flex items-center bg-gray-200 px-2 py-1 rounded">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Hoy
            </span>
          </div>

          {/* Contacto */}
          {ad.contact?.phones?.[0] && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {ad.contact.phones[0]}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Medidor de calidad */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Calidad del Anuncio</span>
          <span className={`text-sm font-bold ${getQualityColor(quality)}`}>
            {quality}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            className={`h-2 rounded-full transition-all duration-500 ${
              quality >= 80 ? 'bg-green-500' :
              quality >= 60 ? 'bg-blue-500' :
              quality >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${quality}%` }}
          />
        </div>

        <div className="flex items-center justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(quality / 20)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lista de completitud */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm text-gray-500">
            {completedCount}/{totalItems}
          </span>
        </div>

        <div className="space-y-2">
          {completionItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <motion.div
                initial={false}
                animate={{ 
                  scale: item.completed ? 1 : 0.8,
                  opacity: item.completed ? 1 : 0.5 
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.completed 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.completed ? '✓' : '○'}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamificación rápida */}
      {achievements.points > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{achievements.points}</div>
            <div className="text-sm text-purple-700">Puntos acumulados</div>
            
            {achievements.badges.length > 0 && (
              <div className="mt-2 flex justify-center space-x-1">
                {achievements.badges.slice(0, 3).map((badge, index) => (
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