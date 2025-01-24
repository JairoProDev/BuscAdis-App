interface Category {
  description: string;
  icon: string;
  stats: string[];
  gradient: string;
}

export const categories: Record<string, Category> = {
  'Empleos': {
    description: 'Encuentra tu próxima oportunidad laboral',
    icon: '💼',
    stats: ['2K+ empleos', 'Empresas top', 'Salarios competitivos'],
    gradient: 'from-blue-500/10 to-blue-600/5'
  },
  'Inmuebles': {
    description: 'Propiedades para comprar o alquilar',
    icon: '🏠',
    stats: ['10K+ propiedades', '500+ agentes', 'Cobertura nacional'],
    gradient: 'from-emerald-500/10 to-emerald-600/5'
  },
  'Vehículos': {
    description: 'Compra y venta de vehículos',
    icon: '🚗',
    stats: ['5K+ vehículos', 'Todas las marcas', 'Financiación disponible'],
    gradient: 'from-red-500/10 to-red-600/5'
  },
  'Servicios': {
    description: 'Servicios profesionales verificados',
    icon: '🛠️',
    stats: ['8K+ profesionales', 'Reseñas verificadas', 'Garantía de servicio'],
    gradient: 'from-purple-500/10 to-purple-600/5'
  },
  'Productos': {
    description: 'Todo tipo de productos nuevos y usados',
    icon: '📦',
    stats: ['15K+ productos', 'Envíos seguros', 'Garantía de compra'],
    gradient: 'from-amber-500/10 to-amber-600/5'
  },
  'Turismo': {
    description: 'Experiencias y destinos únicos',
    icon: '✈️',
    stats: ['1K+ destinos', 'Paquetes completos', 'Mejores precios'],
    gradient: 'from-cyan-500/10 to-cyan-600/5'
  },
  'Eventos': {
    description: 'Eventos y entretenimiento',
    icon: '🎉',
    stats: ['500+ eventos', 'Venta de entradas', 'Eventos exclusivos'],
    gradient: 'from-pink-500/10 to-pink-600/5'
  },
  'Educación': {
    description: 'Cursos y formación profesional',
    icon: '📚',
    stats: ['3K+ cursos', 'Certificaciones', 'Online y presencial'],
    gradient: 'from-indigo-500/10 to-indigo-600/5'
  },
  'Mascotas': {
    description: 'Todo para tus compañeros peludos',
    icon: '🐾',
    stats: ['1K+ anuncios', 'Veterinarios', 'Productos y servicios'],
    gradient: 'from-teal-500/10 to-teal-600/5'
  }
}; 