import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, TrophyIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
}

interface PublishGameElementsProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
  achievements: Achievement[];
}

export default function PublishGameElements({
  progress,
  currentStep,
  totalSteps,
  achievements
}: PublishGameElementsProps) {
  const calculateQuality = (progress: number): string => {
    if (progress < 40) return '¡Buen comienzo! 🌱';
    if (progress < 70) return '¡Va tomando forma! 🌿';
    if (progress < 90) return '¡Casi perfecto! 🌳';
    return '¡Excelente trabajo! ⭐';
  };

  const renderAchievement = (achievement: Achievement) => {
    if (achievement.unlocked) {
      Logger.info(`¡Felicitaciones! Has desbloqueado: ${achievement.title}`);
    }

    return (
      <motion.div
        key={achievement.id}
        className={`flex items-center gap-3 p-4 rounded-xl ${
          achievement.unlocked
            ? 'bg-primary-50 border-2 border-primary-200'
            : 'bg-gray-50 border-2 border-gray-200 opacity-50'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`p-2 rounded-lg ${
          achievement.unlocked ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {achievement.icon}
        </div>
        <div>
          <h4 className="font-medium text-sm">{achievement.title}</h4>
          <p className="text-xs text-gray-600">{achievement.description}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Quality Indicator */}
      <div className="text-center">
        <motion.p
          className="text-lg font-medium text-primary-700"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {calculateQuality(progress)}
        </motion.p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between px-4">
        <span className="text-sm text-gray-600">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary-700">
          {progress}% Completado
        </span>
      </div>

      {/* Achievements */}
      <div className="grid gap-3">
        {achievements.map(renderAchievement)}
      </div>

      {/* Motivation Message */}
      <motion.div
        className="text-center text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ¡Cada paso cuenta para crear un anuncio excepcional! 🚀
      </motion.div>
    </div>
  );
} 