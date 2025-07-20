export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validatePublication = (data: unknown) => {
  const errors: string[] = [];

  const publication = data as Record<string, unknown>;

  if (!publication.title || typeof publication.title !== 'string' || !publication.title.trim()) {
    errors.push('El título es obligatorio');
  } else if (publication.title.length < 10) {
    errors.push('El título debe tener al menos 10 caracteres');
  }

  if (!publication.description || typeof publication.description !== 'string' || !publication.description.trim()) {
    errors.push('La descripción es obligatoria');
  } else if (publication.description.length < 30) {
    errors.push('La descripción debe tener al menos 30 caracteres');
  }

  if (!publication.price || typeof publication.price !== 'number' || publication.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }

  if (!publication.category_id) {
    errors.push('La categoría es obligatoria');
  }

  if (!publication.location) {
    errors.push('La ubicación es obligatoria');
  }

  if (!publication.images || !Array.isArray(publication.images) || publication.images.length === 0) {
    errors.push('Debes subir al menos una imagen');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('\n'));
  }
};

