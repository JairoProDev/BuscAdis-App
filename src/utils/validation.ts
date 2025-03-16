export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateClassifiedad = (data: any) => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('El título es obligatorio');
  } else if (data.title.length < 10) {
    errors.push('El título debe tener al menos 10 caracteres');
  }

  if (!data.description?.trim()) {
    errors.push('La descripción es obligatoria');
  } else if (data.description.length < 30) {
    errors.push('La descripción debe tener al menos 30 caracteres');
  }

  if (!data.price || data.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }

  if (!data.category_id) {
    errors.push('La categoría es obligatoria');
  }

  if (!data.location) {
    errors.push('La ubicación es obligatoria');
  }

  if (!data.images || data.images.length === 0) {
    errors.push('Debes subir al menos una imagen');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('\n'));
  }
};

