import { NextResponse } from 'next/server'

// Simulación de búsquedas tendencia
const trendingSearches = {
  general: [
    'trabajo remoto',
    'departamentos en alquiler',
    'autos usados',
    'servicios de limpieza',
    'clases particulares'
  ],
  inmuebles: [
    'departamentos 2 dormitorios',
    'casas con jardín',
    'alquiler temporal',
    'oficinas coworking',
    'locales céntricos'
  ],
  vehiculos: [
    'SUV familiar',
    'autos 0km',
    'pick up usadas',
    'motos scooter',
    'camionetas 4x4'
  ],
  empleos: [
    'programador react',
    'diseñador UX/UI',
    'vendedor part-time',
    'community manager',
    'soporte técnico'
  ],
  servicios: [
    'reparación celulares',
    'plomero urgente',
    'clases inglés online',
    'diseño web',
    'mudanzas'
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')?.toLowerCase() || 'general'

  const trending = trendingSearches[category as keyof typeof trendingSearches] || trendingSearches.general

  return NextResponse.json({ trending })
} 