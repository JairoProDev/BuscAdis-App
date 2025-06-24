'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, FireIcon, StarIcon, GiftIcon } from '@heroicons/react/24/solid';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
}

interface PublishAchievementsProps {
  achievements: {
    completed: string[];
    points: number;
    badges: string[];
  };
  quality: number;
  onNewPublication?: () => void;
}

const PublishAchievements: React.FC<PublishAchievementsProps> = ({
  achievements,
  quality,
  onNewPublication
}) => {
  // Validación defensiva para asegurar que achievements esté bien definido
  const safeAchievements = {
    completed: Array.isArray(achievements?.completed) ? achievements.completed : [],
    points: achievements?.points || 0,
    badges: Array.isArray(achievements?.badges) ? achievements.badges : []
  };

  const availableAchievements: Achievement[] = [
    {
      id: 'category',
      name: 'Clasificador Experto',
      description: 'Seleccionaste la categoría perfecta',
      icon: '🎯',
      points: 10,
      unlocked: safeAchievements.completed.includes('category')
    },
    {
      id: 'details',
      name: 'Narrador Maestro',
      description: 'Escribiste una descripción detallada',
      icon: '📝',
      points: 15,
      unlocked: safeAchievements.completed.includes('details')
    },
    {
      id: 'location',
      name: 'Explorador Local',
      description: 'Añadiste ubicación específica',
      icon: '📍',
      points: 10,
      unlocked: safeAchievements.completed.includes('location')
    },
    {
      id: 'images',
      name: 'Fotógrafo Pro',
      description: 'Subiste imágenes de calidad',
      icon: '📸',
      points: 20,
      unlocked: safeAchievements.completed.includes('images')
    },
    {
      id: 'contact',
      name: 'Comunicador',
      description: 'Proporcionaste información de contacto',
      icon: '📞',
      points: 10,
      unlocked: safeAchievements.completed.includes('contact')
    },
    {
      id: 'published',
      name: 'Publicador Exitoso',
      description: '¡Publicaste tu primer anuncio!',
      icon: '🚀',
      points: 50,
      unlocked: safeAchievements.completed.includes('published')
    }
  ];

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'bronce':
        return { name: 'Bronce', icon: '🥉', color: 'text-amber-600' };
      case 'plata':
        return { name: 'Plata', icon: '🥈', color: 'text-gray-600' };
      case 'oro':
        return { name: 'Oro', icon: '🥇', color: 'text-yellow-600' };
      case 'publicado':
        return { name: 'Primera Publicación', icon: '🎉', color: 'text-green-600' };
      default:
        return { name: badge, icon: '🏆', color: 'text-blue-600' };
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
      {/* Resumen de puntos y calidad */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{safeAchievements.points}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center">
              <FireIcon className="w-4 h-4 mr-1 text-orange-500" />
              Puntos totales
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${qualityInfo.color}`}>{quality}%</div>
            <div className={`text-sm px-2 py-1 rounded-full ${qualityInfo.bg} ${qualityInfo.color}`}>
              {qualityInfo.level}
            </div>
          </div>
        </div>
      </div>

      {/* Insignias obtenidas */}
      {safeAchievements.badges.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Insignias Desbloqueadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeAchievements.badges.map((badge, index) => {
              const badgeInfo = getBadgeInfo(badge);
              return (
                <motion.div
                  key={badge}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={`flex items-center px-3 py-1 rounded-full bg-gray-50 border ${badgeInfo.color}`}
                >
                  <span className="mr-1">{badgeInfo.icon}</span>
                  <span className="text-xs font-medium">{badgeInfo.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de logros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Logros Desbloqueados
        </h3>
        <div className="space-y-3">
          {availableAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center p-3 rounded-lg transition-all ${
                achievement.unlocked 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200 opacity-60'
              }`}
            >
              <div className="text-2xl mr-3">{achievement.icon}</div>
              <div className="flex-1">
                <div className={`font-medium ${achievement.unlocked ? 'text-green-900' : 'text-gray-600'}`}>
                  {achievement.name}
                </div>
                <div className={`text-sm ${achievement.unlocked ? 'text-green-700' : 'text-gray-500'}`}>
                  {achievement.description}
                </div>
              </div>
              <div className={`text-sm font-bold ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                +{achievement.points} pts
              </div>
              {achievement.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2"
                >
                  ✅
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Próximos objetivos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <GiftIcon className="w-5 h-5 mr-2 text-blue-600" />
          Próximos Objetivos
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>🎯 Publica 5 anuncios para desbloquear "Vendedor Activo" (+100 pts)</li>
          <li>📈 Recibe 10 vistas para desbloquear "Popular" (+50 pts)</li>
          <li>💬 Responde 3 mensajes para desbloquear "Comunicativo" (+30 pts)</li>
        </ul>
      </div>

      {/* Botón para nueva publicación */}
      {onNewPublication && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewPublication}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium"
        >
          🎯 Publicar Otro Anuncio (+Más Puntos)
        </motion.button>
      )}
    </div>
  );
};

export default PublishAchievements; 