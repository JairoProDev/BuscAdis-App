import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Logger } from './logging.service';
import { ValidationService } from './validation.service';

export interface FormData {
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    subcategories?: {
      id: string;
      name: string;
      selected?: boolean;
    }[];
  } | null;
  price: {
    amount: number;
    currency: string;
    type: 'fixed' | 'negotiable' | 'free';
  };
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    whatsapp: string;
    email?: string;
    showEmail?: boolean;
  };
  media: string[];
  status: 'draft' | 'publishing' | 'published' | 'error';
  currentStep: number;
  completedSteps: number[];
  lastSaved?: Date;
  errors: {
    [key: string]: string[];
  };
}

interface FormState extends FormData {
  setField: (field: keyof FormData, value: any) => void;
  setNestedField: (path: string[], value: any) => void;
  validateField: (field: string) => boolean;
  validateAll: () => boolean;
  setStep: (step: number) => void;
  completeStep: (step: number) => void;
  clearForm: () => void;
  getProgress: () => number;
}

const INITIAL_STATE: FormData = {
  title: '',
  description: '',
  category: null,
  price: {
    amount: 0,
    currency: 'PEN',
    type: 'fixed'
  },
  location: {
    city: '',
    country: 'Perú'
  },
  contact: {
    whatsapp: '',
    showEmail: false
  },
  media: [],
  status: 'draft',
  currentStep: 1,
  completedSteps: [],
  errors: {}
};

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setField: (field, value) => {
        Logger.debug(`Actualizando campo: ${field}`);
        set(state => ({
          ...state,
          [field]: value,
          lastSaved: new Date()
        }));
      },

      setNestedField: (path, value) => {
        Logger.debug(`Actualizando campo anidado: ${path.join('.')}`);
        set(state => {
          let current = { ...state };
          let currentObj = current;
          for (let i = 0; i < path.length - 1; i++) {
            currentObj[path[i]] = { ...currentObj[path[i]] };
            currentObj = currentObj[path[i]];
          }
          currentObj[path[path.length - 1]] = value;
          return {
            ...current,
            lastSaved: new Date()
          };
        });
      },

      validateField: (field) => {
        const state = get();
        let isValid = true;
        const errors: string[] = [];

        switch (field) {
          case 'title':
            const titleValidation = ValidationService.validateTitle(state.title);
            isValid = titleValidation.isValid;
            errors.push(...titleValidation.errors);
            break;

          case 'description':
            const descValidation = ValidationService.validateDescription(state.description);
            isValid = descValidation.isValid;
            errors.push(...descValidation.errors);
            break;

          case 'price':
            const priceValidation = ValidationService.validatePrice(state.price.amount);
            isValid = priceValidation.isValid;
            errors.push(...priceValidation.errors);
            break;

          case 'whatsapp':
            const whatsappValidation = ValidationService.validateWhatsApp(state.contact.whatsapp);
            isValid = whatsappValidation.isValid;
            errors.push(...whatsappValidation.errors);
            break;

          case 'location':
            const locationValidation = ValidationService.validateLocation(
              state.location.city,
              state.location.country
            );
            isValid = locationValidation.isValid;
            errors.push(...locationValidation.errors);
            break;

          case 'media':
            const mediaValidation = ValidationService.validateMedia(state.media);
            isValid = mediaValidation.isValid;
            errors.push(...mediaValidation.errors);
            break;

          case 'category':
            const categoryValidation = ValidationService.validateCategory(state.category);
            isValid = categoryValidation.isValid;
            errors.push(...categoryValidation.errors);
            break;
        }

        set(state => ({
          ...state,
          errors: {
            ...state.errors,
            [field]: errors
          }
        }));

        if (!isValid) {
          Logger.warning(`Validación fallida para ${field}: ${errors.join(', ')}`);
        }

        return isValid;
      },

      validateAll: () => {
        const state = get();
        const fields = [
          'title',
          'description',
          'price',
          'whatsapp',
          'location',
          'media',
          'category'
        ];

        const results = fields.map(field => get().validateField(field));
        const isValid = results.every(result => result);

        if (isValid) {
          Logger.success('Validación completa exitosa');
        } else {
          Logger.error('Validación completa fallida');
        }

        return isValid;
      },

      setStep: (step) => {
        Logger.info(`Navegando al paso ${step}`);
        set(state => ({
          ...state,
          currentStep: step
        }));
      },

      completeStep: (step) => {
        Logger.success(`Paso ${step} completado`);
        set(state => ({
          ...state,
          completedSteps: [...new Set([...state.completedSteps, step])].sort()
        }));
      },

      clearForm: () => {
        Logger.info('Limpiando formulario');
        set(INITIAL_STATE);
      },

      getProgress: () => {
        const state = get();
        const totalSteps = 5; // Ajustar según el número total de pasos
        return Math.round((state.completedSteps.length / totalSteps) * 100);
      }
    }),
    {
      name: 'publication-form',
      partialize: (state) => ({
        title: state.title,
        description: state.description,
        category: state.category,
        price: state.price,
        location: state.location,
        contact: state.contact,
        media: state.media,
        status: state.status,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps
      })
    }
  )
); 