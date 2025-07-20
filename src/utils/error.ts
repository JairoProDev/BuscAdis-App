export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status
    };
  }



  // Error genérico
  return {
    message: 'Ha ocurrido un error inesperado',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
};
