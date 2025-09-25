export class MagazineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MagazineError';
  }

  static NotFound(message = 'Magazine not found') {
    return new MagazineError(message, 'MAGAZINE_NOT_FOUND', 404);
  }

  static InvalidCategory(message = 'Invalid category specified') {
    return new MagazineError(message, 'INVALID_CATEGORY', 400);
  }

  static GenerationFailed(message = 'Failed to generate magazine') {
    return new MagazineError(message, 'GENERATION_FAILED', 500);
  }

  static StorageError(message = 'Failed to store magazine') {
    return new MagazineError(message, 'STORAGE_ERROR', 500);
  }
}