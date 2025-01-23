import { NextResponse } from 'next/server'

// Simulación de base de datos de sugerencias populares
const popularSuggestions = {
  inmuebles: [
    'departamento en alquiler',
    'casa en venta',
    'oficinas comerciales',
    'terrenos',
    'locales comerciales'
  ],
  vehiculos: [
    'autos usados',
    'camionetas 4x4',
    'motos',
    'vehículos comerciales',
    'repuestos'
  ],
  empleos: [
    'trabajo remoto',
    'desarrollador web',
    'vendedor',
    'administrativo',
    'profesionales IT'
  ],
  servicios: [
    'plomero',
    'electricista',
    'jardinero',
    'profesor particular',
    'diseñador gráfico'
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  const category = searchParams.get('category')?.toLowerCase() || ''

  let suggestions: string[] = []

  if (query) {
    // Filtrar sugerencias basadas en la consulta
    const allSuggestions = category 
      ? popularSuggestions[category as keyof typeof popularSuggestions] || []
      : Object.values(popularSuggestions).flat()

    suggestions = allSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query))
      .slice(0, 5)
  }

  return NextResponse.json({ suggestions })
} 