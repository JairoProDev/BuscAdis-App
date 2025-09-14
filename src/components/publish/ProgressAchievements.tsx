'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { PublicationFormData } from '@/types/publication';

interface ProgressAchievementsProps {
  formData: PublicationFormData;
  quality: number;
}

const ProgressAchievements: React.FC<ProgressAchievementsProps> = ({ formData, quality }) => {
  // Defensive: Normalize ad data
  const safeAd = {
    title: formData?.title?.trim() || '',
    description: formData?.description?.trim() || '',
    categorySlug: formData?.categorySlug || '',
    subcategorySlug: formData?.subcategorySlug || '',
    amount: typeof formData?.amount === 'number' ? formData.amount : null,
    negotiable: !!formData?.negotiable,
    location: {
      district: formData?.location?.district || '',
      province: formData?.location?.province || '',
      address: formData?.location?.address || '',
    },
    contact: {
      phones: Array.isArray(formData?.contact?.phones) ? formData.contact.phones : [''],
      email: formData?.contact?.email || '',
    },
    images: Array.isArray(formData?.images) ? formData.images : [],
  };

  // Completion logic
  const completionItems = [
    {
      key: 'category',
      label: 'Categoría',
      completed: !!safeAd.categorySlug && !!safeAd.subcategorySlug,
    },
    {
      key: 'details',
      label: 'Título y descripción',
      completed:
        !!safeAd.title && safeAd.title.length >= 10 && !!safeAd.description && safeAd.description.length >= 30,
    },
    {
      key: 'location',
      label: 'Ubicación',
      completed: !!safeAd.location.district && !!safeAd.location.address,
    },
    {
      key: 'images',
      label: 'Imágenes (min. 2)',
      completed: Array.isArray(safeAd.images) && safeAd.images.length >= 2,
    },
    {
      key: 'contact',
      label: 'Contacto',
      completed: !!safeAd.contact.phones?.[0],
    },
    {
      key: 'price',
      label: 'Precio',
      completed: safeAd.amount !== null,
    },
  ];

  const completedCount = completionItems.filter((item) => item.completed).length;
  const totalItems = completionItems.length;

  // Achievement logic
  const achievements = useMemo(() => {
    const completed: string[] = [];
    let points = 0;
    let badges: string[] = [];

    if (completionItems[0].completed) {
      completed.push('category');
      points += 10;
    }
    if (completionItems[1].completed) {
      completed.push('details');
      points += 20;
    }
    if (completionItems[2].completed) {
      completed.push('location');
      points += 10;
    }
    if (completionItems[3].completed) {
      completed.push('images');
      points += 20;
    }
    if (completionItems[4].completed) {
      completed.push('contact');
      points += 10;
    }
    if (completionItems[5].completed) {
      completed.push('price');
      points += 10;
    }

    // Badges
    if (points >= 50) badges.push('bronce');
    if (points >= 80) badges.push('plata');
    if (points >= 100) badges.push('oro');

    return { completed, points, badges };
  }, [formData]);

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'bronce':
        return { name: 'Bronce', icon: '🥉', color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'plata':
        return { name: 'Plata', icon: '🥈', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'oro':
        return { name: 'Oro', icon: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { name: badge, icon: '🏆', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  const getQualityLevel = (quality: number) => {
    if (quality >= 80) return { level: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (quality >= 60) return { level: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (quality >= 40) return { level: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Básico', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const qualityInfo = getQualityLevel(quality);

  return (
    <div className="space-y-6">
      {/* Calidad del anuncio */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Calidad del anuncio</h3>
          <div className="flex items-center">
            {[1,2,3,4,5].map((star) => (
              <StarIcon 
                key={star}
                className={`h-5 w-5 ${star <= Math.ceil(quality/20) 
                  ? 'text-yellow-500 dark:text-yellow-400' 
                  : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-yellow-300 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${quality}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>Básico</span>
          <span>Promedio</span>
          <span>Excelente</span>
        </div>
      </div>

      {/* Progreso y logros en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso visual */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
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
                    opacity: item.completed ? 1 : 0.5,
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    item.completed
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.completed ? <CheckIcon className="w-4 h-4" /> : <span className="font-bold">–</span>}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Logros y gamificación */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-1.5" />
            Logros desbloqueados
          </h3>
          <div className="space-y-3 mb-4">
            {completionItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                  <span
                    className={`h-3 w-3 rounded-full mr-1.5 ${
                      achievements.completed.includes(item.key)
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  ></span>
                  {item.label}
                </span>
                {achievements.completed.includes(item.key) ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Puntos acumulados */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
            <div className="flex items-center">
              <FireIcon className="h-4 w-4 text-orange-500 mr-1.5" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Puntos acumulados</span>
            </div>
            <span className="text-xs font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-white px-3 py-1 rounded-full">
              {achievements.points} pts
            </span>
          </div>

          {/* Insignias */}
          {achievements.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {achievements.badges.map((badge) => {
                const badgeInfo = getBadgeInfo(badge);
                return (
                  <motion.div
                    key={badge}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring" }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${badgeInfo.bg} text-white shadow-md`}
                  >
                    <CheckIcon className="h-5 w-5" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Resumen de calidad y puntos */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{achievements.points}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <FireIcon className="w-4 h-4 mr-1 text-orange-500" />
              Puntos totales
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${qualityInfo.color}`}>{quality}%</div>
            <div className={`text-sm px-2 py-1 rounded-full ${qualityInfo.bg} ${qualityInfo.color}`}>
              {qualityInfo.level}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAchievements;
