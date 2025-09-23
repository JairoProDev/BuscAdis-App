import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Logger } from './logging.service';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  timestamp?: Date;
}

interface AchievementWithTimestamp extends Achievement {
  timestamp?: Date;
}

interface AchievementProgress {
  achievements: Achievement[];
  totalPoints: number;
  lastAchievement?: AchievementWithTimestamp;
}

interface AchievementStore extends AchievementProgress {
  unlockAchievement: (id: string) => void;
  checkImageUpload: (imageCount: number) => void;
  checkFormCompletion: (fields: Record<string, unknown>) => void;
  checkLocationAdded: (location: Record<string, unknown>) => void;
  checkDescription: (description: string) => void;
  resetProgress: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_image',
    name: 'Fotógrafo Novato',
    description: 'Subiste tu primera imagen',
    points: 10,
    icon: '📸',
    unlocked: false
  },
  {
    id: 'image_collection',
    name: 'Coleccionista',
    description: 'Subiste 5 imágenes',
    points: 20,
    icon: '🖼️',
    unlocked: false
  },
  {
    id: 'all_fields',
    name: 'Detallista',
    description: 'Completaste todos los campos del formulario',
    points: 20,
    icon: '✅',
    unlocked: false
  },
  {
    id: 'location',
    name: 'Geolocalizador',
    description: 'Añadiste la ubicación exacta',
    points: 15,
    icon: '📍',
    unlocked: false
  },
  {
    id: 'description_pro',
    name: 'Comunicador Pro',
    description: 'Escribiste una descripción de más de 100 palabras',
    points: 25,
    icon: '📝',
    unlocked: false
  }
];

export const useAchievements = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      totalPoints: 0,
      lastAchievement: undefined,

      unlockAchievement: (id: string) => {
        const { achievements, totalPoints } = get();
        const achievement = achievements.find(a => a.id === id);

        if (achievement && !achievement.unlocked) {
          Logger.success(`Logro desbloqueado: ${achievement.name}`);
          
          const updatedAchievements = achievements.map(a =>
            a.id === id
              ? { ...a, unlocked: true, timestamp: new Date() }
              : a
          );

          set({
            achievements: updatedAchievements,
            totalPoints: totalPoints + achievement.points,
            lastAchievement: { ...achievement, unlocked: true, timestamp: new Date() } as AchievementWithTimestamp
          });
        }
      },

      checkImageUpload: (imageCount: number) => {
        const { unlockAchievement } = get();

        if (imageCount === 1) {
          unlockAchievement('first_image');
        }
        if (imageCount >= 5) {
          unlockAchievement('image_collection');
        }

        Logger.debug(`Verificando logros de imágenes: ${imageCount} imágenes`);
      },

      checkFormCompletion: (fields: Record<string, unknown>) => {
        const requiredFields = [
          'title',
          'description',
          'category',
          'price',
          'location',
          'contact'
        ];

        const allFieldsCompleted = requiredFields.every(
          field => fields[field] && fields[field].toString().trim() !== ''
        );

        if (allFieldsCompleted) {
          get().unlockAchievement('all_fields');
          Logger.debug('Formulario completado, logro desbloqueado');
        }
      },

      checkLocationAdded: (location: Record<string, unknown>) => {
        if (
          location &&
          typeof location === 'object' &&
          'lat' in location &&
          'lng' in location
        ) {
          get().unlockAchievement('location');
          Logger.debug(`Ubicación añadida: ${JSON.stringify(location)}`);
        }
      },

      checkDescription: (description: string) => {
        const wordCount = description.trim().split(/\s+/).length;

        if (wordCount >= 100) {
          get().unlockAchievement('description_pro');
          Logger.debug(`Descripción detallada: ${wordCount} palabras`);
        }
      },

      resetProgress: () => {
        Logger.debug('Reiniciando progreso de logros');
        set({
          achievements: INITIAL_ACHIEVEMENTS,
          totalPoints: 0,
          lastAchievement: undefined
        });
      }
    }),
    {
      name: 'publish-achievements',
      skipHydration: false
    }
  )
);

// Middleware para logging
useAchievements.subscribe((state, prevState) => {
  if (state.totalPoints !== prevState.totalPoints) {
    Logger.info(
      `Puntos actualizados: ${prevState.totalPoints} → ${state.totalPoints}`
    );
  }
});