/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: 'PEN')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'PEN'): string => {
  if (amount === 0) return 'Gratis';
  
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a price with currency and optional negotiable flag
 */
export const formatPrice = (price: { amount: number | null, currency: string, negotiable?: boolean }) => {
  if (!price || price.amount === null || price.amount === undefined) return 'Consultar';
  if (price.amount === 0 && !price.negotiable) return 'Gratis';
  
  const formatted = formatCurrency(price.amount, price.currency);
  return price.negotiable ? `${formatted} (Negociable)` : formatted;
};

export const formatPhoneNumber = (phone: string): string => {
  // Eliminar todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Si es un número peruano (9 dígitos)
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

// Exportación por defecto de todas las funciones de formato
const formatUtils = {
  formatCurrency,
  formatPrice,
  formatPhoneNumber
};

export default formatUtils;
