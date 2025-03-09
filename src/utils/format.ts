export const formatPrice = (amount: number, type: string = 'fixed'): string => {
  if (type === 'free') return 'Gratis';
  
  const formatted = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(amount);
  
  return type === 'negotiable' ? `${formatted} (Negociable)` : formatted;
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
