import { Logger } from './logging.service';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

export class ValidationService {
  static validateTitle(title: string): ValidationResult {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('El título es obligatorio');
      Logger.warn('Título vacío detectado');
    } else {
      if (title.length < 10) {
        errors.push('El título debe tener al menos 10 caracteres');
        Logger.warn('Título demasiado corto');
      }
      if (title.length > 100) {
        errors.push('El título no puede exceder los 100 caracteres');
        Logger.warn('Título demasiado largo');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateDescription(description: string): ValidationResult {
    const errors: string[] = [];
    
    if (!description.trim()) {
      errors.push('La descripción es obligatoria');
      Logger.warn('Descripción vacía detectada');
    } else {
      if (description.length < 50) {
        errors.push('La descripción debe tener al menos 50 caracteres para ser más informativa');
        Logger.warn('Descripción demasiado corta');
      }
      if (description.length > 2000) {
        errors.push('La descripción no puede exceder los 2000 caracteres');
        Logger.warn('Descripción demasiado larga');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePrice(price: number): ValidationResult {
    const errors: string[] = [];
    
    if (isNaN(price) || price < 0) {
      errors.push('El precio debe ser un número positivo');
      Logger.warn('Precio inválido detectado');
    }
    if (price > 999999999) {
      errors.push('El precio es demasiado alto');
      Logger.warn('Precio excede el límite permitido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateWhatsApp(whatsapp: string): ValidationResult {
    const errors: string[] = [];
    const whatsappRegex = /^\d{9,}$/;
    
    if (!whatsapp.trim()) {
      errors.push('El número de WhatsApp es obligatorio');
      Logger.warn('Número de WhatsApp vacío');
    } else if (!whatsappRegex.test(whatsapp)) {
      errors.push('Ingresa un número de WhatsApp válido (mínimo 9 dígitos)');
      Logger.warn('Formato de WhatsApp inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLocation(city: string, country: string): ValidationResult {
    const errors: string[] = [];
    
    if (!city.trim()) {
      errors.push('La ciudad es obligatoria');
      Logger.warn('Ciudad no especificada');
    }
    if (!country.trim()) {
      errors.push('El país es obligatorio');
      Logger.warn('País no especificado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateMedia(media: string[]): ValidationResult {
    const errors: string[] = [];
    
    if (!media || media.length === 0) {
      errors.push('Debes subir al menos una imagen');
      Logger.warn('No se han subido imágenes');
    }
    if (media.length > 10) {
      errors.push('No puedes subir más de 10 imágenes');
      Logger.warn('Exceso de imágenes detectado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCategory(category: any): ValidationResult {
    const errors: string[] = [];
    
    if (!category || !category.id) {
      errors.push('Debes seleccionar una categoría');
      Logger.warn('Categoría no seleccionada');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateField(value: any, rules: ValidationRules): ValidationResult {
    const errors: string[] = [];

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push('Este campo es obligatorio');
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Este campo debe tener al menos ${rules.minLength} caracteres`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Este campo no puede exceder los ${rules.maxLength} caracteres`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push('El formato ingresado no es válido');
      }
    }

    if (rules.custom && !rules.custom(value)) {
      errors.push('El valor ingresado no es válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 