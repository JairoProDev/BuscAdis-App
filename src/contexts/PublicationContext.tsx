'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProcessedImage } from '@/services/image.service';

// Define types for the publication form data
export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  timestamp?: Date;
}

export interface PriceData {
  amount: number;
  currency: string;
  type: string;
}

export interface LocationData {
  city: string;
  country: string;
  district?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface FormData {
  title?: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  price?: PriceData;
  location?: LocationData;
  images?: ProcessedImage[];
  contactInfo?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
}

// State definition
interface PublicationState {
  currentStep: number;
  formData: FormData;
  achievements: Achievement[];
  totalPoints: number;
  isSubmitting: boolean;
  error: string | null;
  isSuccess: boolean;
}

// Initial state
const initialState: PublicationState = {
  currentStep: 1,
  formData: {},
  achievements: [
    {
      id: 'title_added',
      title: 'Título Descriptivo',
      description: 'Añadiste un título claro y descriptivo',
      points: 10,
      completed: false
    },
    {
      id: 'desc_added',
      title: 'Descripción Detallada',
      description: 'Añadiste una descripción completa',
      points: 15,
      completed: false
    },
    {
      id: 'images_added',
      title: 'Imágenes Subidas',
      description: 'Añadiste imágenes a tu publicación',
      points: 20,
      completed: false
    },
    {
      id: 'location_added',
      title: 'Ubicación Añadida',
      description: 'Especificaste la ubicación exacta',
      points: 15,
      completed: false
    }
  ],
  totalPoints: 0,
  isSubmitting: false,
  error: null,
  isSuccess: false
};

// Define action types
type ActionType = 
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM'; payload: Partial<FormData> }
  | { type: 'COMPLETE_ACHIEVEMENT'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: boolean };

// Reducer function
function publicationReducer(state: PublicationState, action: ActionType): PublicationState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'UPDATE_FORM':
      const updatedFormData = {
        ...state.formData,
        ...action.payload
      };
      
      // Check for achievements
      const updatedAchievements = [...state.achievements];
      let pointsEarned = 0;
      
      // Check title achievement
      if (updatedFormData.title && updatedFormData.title.length >= 10) {
        const titleAchievement = updatedAchievements.find(a => a.id === 'title_added');
        if (titleAchievement && !titleAchievement.completed) {
          titleAchievement.completed = true;
          titleAchievement.timestamp = new Date();
          pointsEarned += titleAchievement.points;
        }
      }
      
      // Check description achievement
      if (updatedFormData.description && updatedFormData.description.length >= 30) {
        const descAchievement = updatedAchievements.find(a => a.id === 'desc_added');
        if (descAchievement && !descAchievement.completed) {
          descAchievement.completed = true;
          descAchievement.timestamp = new Date();
          pointsEarned += descAchievement.points;
        }
      }
      
      // Check images achievement
      if (updatedFormData.images && updatedFormData.images.length > 0) {
        const imagesAchievement = updatedAchievements.find(a => a.id === 'images_added');
        if (imagesAchievement && !imagesAchievement.completed) {
          imagesAchievement.completed = true;
          imagesAchievement.timestamp = new Date();
          pointsEarned += imagesAchievement.points;
        }
      }
      
      // Check location achievement
      if (updatedFormData.location && updatedFormData.location.city) {
        const locationAchievement = updatedAchievements.find(a => a.id === 'location_added');
        if (locationAchievement && !locationAchievement.completed) {
          locationAchievement.completed = true;
          locationAchievement.timestamp = new Date();
          pointsEarned += locationAchievement.points;
        }
      }
      
      return {
        ...state,
        formData: updatedFormData,
        achievements: updatedAchievements,
        totalPoints: state.totalPoints + pointsEarned
      };
    
    case 'COMPLETE_ACHIEVEMENT':
      const achievementId = action.payload;
      const achievementIndex = state.achievements.findIndex(a => a.id === achievementId);
      
      if (achievementIndex === -1 || state.achievements[achievementIndex].completed) {
        return state;
      }
      
      const newAchievements = [...state.achievements];
      newAchievements[achievementIndex] = {
        ...newAchievements[achievementIndex],
        completed: true,
        timestamp: new Date()
      };
      
      return {
        ...state,
        achievements: newAchievements,
        totalPoints: state.totalPoints + newAchievements[achievementIndex].points
      };
    
    case 'RESET_FORM':
      return initialState;
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isSubmitting: false
      };
    
    case 'SET_SUCCESS':
      return {
        ...state,
        isSuccess: action.payload,
        isSubmitting: false
      };
    
    default:
      return state;
  }
}

// Create action creators
export const publicationActions = {
  setStep: (step: number) => ({ type: 'SET_STEP', payload: step } as const),
  updateForm: (data: Partial<FormData>) => ({ type: 'UPDATE_FORM', payload: data } as const),
  completeAchievement: (id: string) => ({ type: 'COMPLETE_ACHIEVEMENT', payload: id } as const),
  resetForm: () => ({ type: 'RESET_FORM' } as const),
  setSubmitting: (isSubmitting: boolean) => ({ type: 'SET_SUBMITTING', payload: isSubmitting } as const),
  setError: (error: string | null) => ({ type: 'SET_ERROR', payload: error } as const),
  setSuccess: (isSuccess: boolean) => ({ type: 'SET_SUCCESS', payload: isSuccess } as const)
};

// Create context
type PublicationContextType = {
  state: PublicationState;
  dispatch: React.Dispatch<ActionType>;
};

const PublicationContext = createContext<PublicationContextType | undefined>(undefined);

// Create context provider
export function PublicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(publicationReducer, initialState);
  
  return (
    <PublicationContext.Provider value={{ state, dispatch }}>
      {children}
    </PublicationContext.Provider>
  );
}

// Create hook for using the context
export function usePublication() {
  const context = useContext(PublicationContext);
  
  if (context === undefined) {
    throw new Error('usePublication must be used within a PublicationProvider');
  }
  
  return context;
} 