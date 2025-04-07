import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  CameraIcon,
  TagIcon,
  MapPinIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
  completed: boolean;
  timestamp?: Date;
}

interface PublishAchievementsProps {
  achievements: Achievement[];
  totalPoints: number;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'first_image',
    title: 'Fotógrafo Novato',
    description: 'Subiste tu primera imagen',
    points: 10,
    icon: CameraIcon,
    completed: false
  },
  {
    id: 'all_fields',
    title: 'Detallista',
    description: 'Completaste todos los campos del formulario',
    points: 20,
    icon: TagIcon,
    completed: false
  },
  {
    id: 'location',
    title: 'Geolocalizador',
    description: 'Añadiste la ubicación exacta',
    points: 15,
    icon: MapPinIcon,
    completed: false
  },
  {
    id: 'description',
    title: 'Comunicador',
    description: 'Escribiste una descripción detallada',
    points: 15,
    icon: ChatBubbleBottomCenterTextIcon,
    completed: false
  }
];

const PublishAchievements: React.FC<PublishAchievementsProps> = ({
  achievements = defaultAchievements,
  totalPoints = 0,
  onAchievementClick,
  className = ''
}) => {
  const handleAchievementClick = (achievement: Achievement) => {
    Logger.debug(`Achievement clicked: ${achievement.title}`);
    onAchievementClick?.(achievement);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Logros de Publicación
        </h3>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-yellow-400" />
          <span className="text-lg font-bold text-gray-900">{totalPoints} pts</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleAchievementClick(achievement)}
              className={`
                relative p-4 rounded-lg cursor-pointer
                ${achievement.completed
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`
                    p-2 rounded-full
                    ${achievement.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  <achievement.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {achievement.description}
                  </p>
                  {achievement.completed && achievement.timestamp && (
                    <p className="text-xs text-green-600 mt-1">
                      Completado el {achievement.timestamp.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span
                    className={`
                      text-sm font-semibold
                      ${achievement.completed
                        ? 'text-green-600'
                        : 'text-gray-500'
                      }
                    `}
                  >
                    +{achievement.points}
                  </span>
                </div>
              </div>

              {achievement.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {achievements.some(a => a.completed) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            ¡Sigue así! Completa más logros para obtener más puntos
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PublishAchievements; 