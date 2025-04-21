import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh

// Get subcategories for a specific category
export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    // Properly await and access the category parameter
    const categoryId = params.category;

    // Static subcategories definition - used exclusively
    const subcategories = {
      'empleos': [
        { id: 'empleos-tecnologia', name: 'Tecnología', count: 0 },
        { id: 'empleos-administrativa', name: 'Administración', count: 0 },
        { id: 'empleos-salud', name: 'Salud', count: 0 },
        { id: 'empleos-educacion', name: 'Educación', count: 0 },
        { id: 'empleos-hosteleria', name: 'Hostelería', count: 0 },
        { id: 'empleos-construccion', name: 'Construcción', count: 0 },
      ],
      'inmuebles': [
        { id: 'inmuebles-casas', name: 'Casas', count: 0 },
        { id: 'inmuebles-departamentos', name: 'Departamentos', count: 0 },
        { id: 'inmuebles-terrenos', name: 'Terrenos', count: 0 },
        { id: 'inmuebles-locales', name: 'Locales Comerciales', count: 0 },
      ],
      'vehiculos': [
        { id: 'vehiculos-autos', name: 'Autos', count: 0 },
        { id: 'vehiculos-motos', name: 'Motos', count: 0 },
        { id: 'vehiculos-camionetas', name: 'Camionetas', count: 0 },
      ],
      'servicios': [
        { id: 'servicios-profesionales', name: 'Profesionales', count: 0 },
        { id: 'servicios-hogar', name: 'Hogar', count: 0 },
        { id: 'servicios-tecnicos', name: 'Técnicos', count: 0 },
        { id: 'servicios-belleza', name: 'Belleza', count: 0 },
      ],
      'productos': [
        { id: 'productos-tecnologia', name: 'Tecnología', count: 0 },
        { id: 'productos-muebles', name: 'Muebles', count: 0 },
        { id: 'productos-electrodomesticos', name: 'Electrodomésticos', count: 0 },
        { id: 'productos-ropa', name: 'Ropa y Accesorios', count: 0 },
      ],
      'eventos': [
        { id: 'eventos-conciertos', name: 'Conciertos', count: 0 },
        { id: 'eventos-teatro', name: 'Teatro', count: 0 },
        { id: 'eventos-conferencias', name: 'Conferencias', count: 0 },
        { id: 'eventos-festivales', name: 'Festivales', count: 0 },
      ],
      'negocios': [
        { id: 'negocios-franquicias', name: 'Franquicias', count: 0 },
        { id: 'negocios-traspasos', name: 'Traspasos', count: 0 },
        { id: 'negocios-inversiones', name: 'Inversiones', count: 0 },
      ],
      'comunidad': [
        { id: 'comunidad-voluntariado', name: 'Voluntariado', count: 0 },
        { id: 'comunidad-donaciones', name: 'Donaciones', count: 0 },
        { id: 'comunidad-eventos', name: 'Eventos Comunitarios', count: 0 },
      ]
    };

    // Check if we have subcategories for this category
    if (subcategories[categoryId as keyof typeof subcategories]) {
      return NextResponse.json(subcategories[categoryId as keyof typeof subcategories]);
    }

    // Return empty array if no subcategories found for this category
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error processing subcategories:', error);
    return NextResponse.json(
      { error: `Failed to process subcategories: ${error.message}` },
      { status: 500 }
    );
  }
} 