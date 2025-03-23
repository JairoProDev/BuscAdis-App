'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Logger } from '../services/logging.service';
import { Price } from '../components/publish/PriceInput';
import { Location } from '../components/publish/LocationSelector';
import { PublicationCategory } from '../types/publications';

interface FormData {
  title?: string;
  description?: string;
  category_id?: string;
  subcategory_id?: string;
  subsubcategory_id?: string;
  category_type?: PublicationCategory;
  price?: Price;
  location?: Location;
  images?: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  completedAt?: Date;
}

interface PublicationState {
  currentStep: number;
  formData: FormData;
  isValid: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  achievements: Achievement[];
  totalPoints: number;
}

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM'; payload: Partial<FormData> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'COMPLETE_ACHIEVEMENT'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: PublicationState = {
  currentStep: 1,
  formData: {},
  isValid: false,
  errors: {},
  isSubmitting: false,
  achievements: [
    {
      id: 'first_image',
      title: 'Fotógrafo Principiante',
      description: 'Subiste tu primera imagen',
      points: 10,
      completed: false,
    },
    {
      id: 'all_fields',
      title: 'Detallista',
      description: 'Completaste todos los campos requeridos',
      points: 20,
      completed: false,
    },
    {
      id: 'location_added',
      title: 'Ubicación Precisa',
      description: 'Agregaste la ubicación exacta',
      points: 15,
      completed: false,
    },
    {
      id: 'detailed_description',
      title: 'Buen Comunicador',
      description: 'Escribiste una descripción detallada',
      points: 25,
      completed: false,
    },
  ],
  totalPoints: 0,
};

function publicationReducer(state: PublicationState, action: Action): PublicationState {
  switch (action.type) {
    case 'SET_STEP':
      Logger.info(`Cambiando al paso ${action.payload}`);
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'UPDATE_FORM':
      Logger.info('Actualizando formulario', { updates: action.payload });
      const newFormData = {
        ...state.formData,
        ...action.payload,
      };

      // Verificar logros
      const newAchievements = state.achievements.map(achievement => {
        if (achievement.completed) return achievement;

        let shouldComplete = false;
        switch (achievement.id) {
          case 'first_image':
            shouldComplete = !!newFormData.images?.length;
            break;
          case 'all_fields':
            shouldComplete = !!(
              newFormData.title &&
              newFormData.description &&
              newFormData.category_id &&
              newFormData.price &&
              newFormData.location
            );
            break;
          case 'location_added':
            shouldComplete = !!(
              newFormData.location?.latitude &&
              newFormData.location?.longitude
            );
            break;
          case 'detailed_description':
            shouldComplete = !!(
              newFormData.description &&
              newFormData.description.length >= 200
            );
            break;
        }

        if (shouldComplete && !achievement.completed) {
          Logger.info(`Logro desbloqueado: ${achievement.title}`);
          return {
            ...achievement,
            completed: true,
            completedAt: new Date(),
          };
        }
        return achievement;
      });

      // Calcular puntos totales
      const totalPoints = newAchievements.reduce(
        (total, achievement) => total + (achievement.completed ? achievement.points : 0),
        0
      );

      return {
        ...state,
        formData: newFormData,
        achievements: newAchievements,
        totalPoints,
      };

    case 'SET_ERRORS':
      Logger.warn('Errores de validación encontrados', { errors: action.payload });
      return {
        ...state,
        errors: action.payload,
        isValid: Object.keys(action.payload).length === 0,
      };

    case 'SET_IS_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'COMPLETE_ACHIEVEMENT':
      Logger.info(`Completando logro: ${action.payload}`);
      const updatedAchievements = state.achievements.map(achievement =>
        achievement.id === action.payload
          ? { ...achievement, completed: true, completedAt: new Date() }
          : achievement
      );

      return {
        ...state,
        achievements: updatedAchievements,
        totalPoints: updatedAchievements.reduce(
          (total, achievement) => total + (achievement.completed ? achievement.points : 0),
          0
        ),
      };

    case 'RESET_STATE':
      Logger.info('Reiniciando estado de publicación');
      return initialState;

    default:
      return state;
  }
}

const PublicationContext = createContext<{
  state: PublicationState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const publicationActions = {
  setStep: (step: number) => ({ type: 'SET_STEP', payload: step } as const),
  updateForm: (formData: Partial<FormData>) =>
    ({ type: 'UPDATE_FORM', payload: formData } as const),
  setErrors: (errors: Record<string, string>) =>
    ({ type: 'SET_ERRORS', payload: errors } as const),
  setIsSubmitting: (isSubmitting: boolean) =>
    ({ type: 'SET_IS_SUBMITTING', payload: isSubmitting } as const),
  completeAchievement: (achievementId: string) =>
    ({ type: 'COMPLETE_ACHIEVEMENT', payload: achievementId } as const),
  resetState: () => ({ type: 'RESET_STATE' } as const),
};

export function PublicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(publicationReducer, initialState);

  return (
    <PublicationContext.Provider value={{ state, dispatch }}>
      {children}
    </PublicationContext.Provider>
  );
}

export function usePublication() {
  const context = useContext(PublicationContext);
  if (!context) {
    throw new Error('usePublication debe ser usado dentro de un PublicationProvider');
  }
  return context;
} 