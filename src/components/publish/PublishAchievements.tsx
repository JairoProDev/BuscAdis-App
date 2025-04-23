'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';

interface PublishAchievementsProps {
  achievements: string[];
  totalPoints: number;
  badges?: string[];
  showConfetti?: boolean;
}

const PublishAchievements: React.FC<PublishAchievementsProps> = ({
  achievements = [],
  totalPoints = 0,
  badges = [],
  showConfetti = false
}) => {
  const [confettiPlayed, setConfettiPlayed] = useState(false);

  useEffect(() => {
    if (showConfetti && !confettiPlayed) {
      setConfettiPlayed(true);
      
      // Trigger confetti animation
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [showConfetti, confettiPlayed]);

  // Determine progress level
  const getLevel = () => {
    if (totalPoints >= 100) return 'Experto';
    if (totalPoints >= 80) return 'Avanzado';
    if (totalPoints >= 50) return 'Intermedio';
    if (totalPoints >= 30) return 'Principiante';
    return 'Novato';
  };

  // Badge information
  const badgeInfo = {
    bronce: { color: 'from-amber-300 to-amber-600', name: 'Publicador de Bronce' },
    plata: { color: 'from-slate-300 to-slate-500', name: 'Publicador de Plata' },
    oro: { color: 'from-yellow-300 to-yellow-600', name: 'Publicador de Oro' }
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Logros</h2>
        <div className="bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm font-medium">
          {totalPoints} puntos
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Nivel: {getLevel()}</span>
          <span>{totalPoints}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-primary-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(totalPoints, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievements list */}
      <div className="space-y-3 mb-6">
        <AchievementItem 
          title="Categoría seleccionada" 
          description="Clasificaste correctamente tu anuncio"
          completed={achievements.includes('category')}
          points={10}
        />
        <AchievementItem 
          title="Detalles completos" 
          description="Añadiste un título y descripción detallados"
          completed={achievements.includes('details')}
          points={15}
        />
        <AchievementItem 
          title="Ubicación exacta" 
          description="Especificaste dónde se encuentra"
          completed={achievements.includes('location')}
          points={10}
        />
        <AchievementItem 
          title="Imágenes de calidad" 
          description="Subiste varias imágenes de tu producto"
          completed={achievements.includes('images')}
          points={20}
        />
        <AchievementItem 
          title="Información de contacto" 
          description="Proporcionaste datos para que te contacten"
          completed={achievements.includes('contact')}
          points={10}
        />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Insignias obtenidas</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map(badge => 
              badgeInfo[badge as keyof typeof badgeInfo] && (
                <motion.div
                  key={badge}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badgeInfo[badge as keyof typeof badgeInfo].color} flex items-center justify-center shadow-md`}>
                    <TrophyIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs mt-1 text-center text-gray-600">
                    {badgeInfo[badge as keyof typeof badgeInfo].name}
                  </span>
                </motion.div>
              )
            )}
          </div>
        </div>
      )}

      {/* Calls to action */}
      {totalPoints < 100 && (
        <div className="mt-4 bg-blue-50 p-3 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FireIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">¡Mejora tu anuncio!</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {totalPoints < 30 && "Añade más detalles para que tu anuncio destaque."}
                  {totalPoints >= 30 && totalPoints < 50 && "¡Buen comienzo! Añade imágenes de calidad para atraer más interesados."}
                  {totalPoints >= 50 && totalPoints < 80 && "¡Vas muy bien! Completa la información de contacto para facilitar la comunicación."}
                  {totalPoints >= 80 && totalPoints < 100 && "¡Casi perfecto! Finaliza los últimos detalles para maximizar las posibilidades de venta."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPoints >= 100 && (
        <div className="mt-4 bg-green-50 p-3 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <StarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">¡Anuncio perfecto!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Has creado un anuncio con toda la información necesaria. ¡Maximizarás tus posibilidades de éxito!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for individual achievement items
const AchievementItem = ({ title, description, completed, points }: { 
  title: string; 
  description: string;
  completed: boolean;
  points: number;
}) => (
  <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${completed ? 'bg-green-50' : 'bg-gray-50'}`}>
    <div className="flex items-start">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${completed ? 'bg-green-500' : 'bg-gray-300'}`}>
        {completed ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M5.25 9.55L2.45 6.75L1.4 7.8L5.25 11.65L12.25 4.65L11.2 3.6L5.25 9.55Z" fill="currentColor"/>
          </svg>
        ) : null}
      </div>
      <div>
        <p className={`text-sm font-medium ${completed ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-xs ${completed ? 'text-gray-600' : 'text-gray-400'}`}>{description}</p>
      </div>
    </div>
    <div className={`ml-4 text-sm font-medium ${completed ? 'text-green-600' : 'text-gray-400'}`}>
      +{points}
    </div>
  </div>
);

export default PublishAchievements; 