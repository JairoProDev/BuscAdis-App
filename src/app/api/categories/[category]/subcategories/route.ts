import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Get subcategories for a specific category
export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const categoryId = params.category

    // Static subcategories mapping
    const subcategories = {
      'empleos': [
        { id: 'empleos-tecnologia', name: 'Tecnología', count: 23 },
        { id: 'empleos-administrativa', name: 'Administración', count: 45 },
        { id: 'empleos-salud', name: 'Salud', count: 18 },
        { id: 'empleos-educacion', name: 'Educación', count: 15 },
        { id: 'empleos-hosteleria', name: 'Hostelería', count: 32 },
        { id: 'empleos-construccion', name: 'Construcción', count: 19 },
      ],
      'inmuebles': [
        { id: 'inmuebles-casas', name: 'Casas', count: 76 },
        { id: 'inmuebles-departamentos', name: 'Departamentos', count: 118 },
        { id: 'inmuebles-terrenos', name: 'Terrenos', count: 34 },
        { id: 'inmuebles-locales', name: 'Locales Comerciales', count: 29 },
      ],
      'vehiculos': [
        { id: 'vehiculos-autos', name: 'Autos', count: 103 },
        { id: 'vehiculos-motos', name: 'Motos', count: 48 },
        { id: 'vehiculos-camionetas', name: 'Camionetas', count: 33 },
      ],
      'servicios': [
        { id: 'servicios-profesionales', name: 'Profesionales', count: 87 },
        { id: 'servicios-hogar', name: 'Hogar', count: 56 },
        { id: 'servicios-tecnicos', name: 'Técnicos', count: 47 },
        { id: 'servicios-belleza', name: 'Belleza', count: 19 },
      ],
      'productos': [
        { id: 'productos-tecnologia', name: 'Tecnología', count: 94 },
        { id: 'productos-muebles', name: 'Muebles', count: 67 },
        { id: 'productos-electrodomesticos', name: 'Electrodomésticos', count: 52 },
        { id: 'productos-ropa', name: 'Ropa y Accesorios', count: 105 },
      ],
      'eventos': [
        { id: 'eventos-conciertos', name: 'Conciertos', count: 21 },
        { id: 'eventos-teatro', name: 'Teatro', count: 14 },
        { id: 'eventos-conferencias', name: 'Conferencias', count: 18 },
        { id: 'eventos-festivales', name: 'Festivales', count: 20 },
      ],
      'negocios': [
        { id: 'negocios-franquicias', name: 'Franquicias', count: 15 },
        { id: 'negocios-traspasos', name: 'Traspasos', count: 27 },
        { id: 'negocios-inversiones', name: 'Inversiones', count: 31 },
      ],
      'comunidad': [
        { id: 'comunidad-voluntariado', name: 'Voluntariado', count: 12 },
        { id: 'comunidad-donaciones', name: 'Donaciones', count: 8 },
        { id: 'comunidad-eventos', name: 'Eventos Comunitarios', count: 15 },
      ]
    }

    // Check if we have static subcategories for this category
    if (subcategories[categoryId as keyof typeof subcategories]) {
      return NextResponse.json(subcategories[categoryId as keyof typeof subcategories])
    }

    // If no static subcategories, try to get from database
    const results = await mongoDbQuery('subcategories', { categoryId }, {})
    
    if (results && results.length > 0) {
      return NextResponse.json(results)
    }

    // Return empty array if no subcategories found
    return NextResponse.json([])
  } catch (error: any) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { error: `Failed to fetch subcategories: ${error.message}` },
      { status: 500 }
    )
  }
} 