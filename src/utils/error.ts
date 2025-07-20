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

interface AWSError {
  name: string;
  message: string;
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

  // Error de AWS
  if ((error as AWSError)?.name === 'ConditionalCheckFailedException') {
    return {
      message: 'El recurso no existe o no tienes permiso para acceder',
      code: 'CONDITIONAL_CHECK_FAILED',
      status: 404
    };
  }

  // Error genérico
  return {
    message: 'Ha ocurrido un error inesperado',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
};
