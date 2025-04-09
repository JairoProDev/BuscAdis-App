// frontend/src/utils/date.ts
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`Fecha inválida: ${dateString}`);
      return 'Fecha no disponible';
    }
    
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha no disponible';
  }
};
  
export const timeAgo = (dateString: string | undefined | null): string => {
  if (!dateString) return 'hace un momento';
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`Fecha inválida para timeAgo: ${dateString}`);
      return 'hace un momento';
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return `hace ${interval} ${unit}${interval !== 1 ? 's' : ''}`;
      }
    }
    
    return 'hace un momento';
  } catch (error) {
    console.error('Error al calcular timeAgo:', error);
    return 'hace un momento';
  }
};