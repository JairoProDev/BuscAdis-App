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
    // Properly await and access the category parameter
    const categoryId = params.category;
    
    // Mapping of category collections for counting
    const categoryCollections = {
      'empleos': 'publications_empleos',
      'inmuebles': 'publications_inmuebles',
      'vehiculos': 'publications_vehiculos',
      'servicios': 'publications_servicios',
      'productos': 'publications_productos',
      'eventos': 'publications_eventos',
      'negocios': 'publications_negocios',
      'comunidad': 'publications_comunidad'
    };

    // Static subcategories mapping - will be populated with real counts
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

    // Check if we have static subcategories for this category
    if (subcategories[categoryId as keyof typeof subcategories]) {
      // Get the collection name for this category
      const collectionName = categoryCollections[categoryId as keyof typeof categoryCollections];
      
      if (collectionName) {
        try {
          // Get the subcategories for this category
          const subcatsForCategory = subcategories[categoryId as keyof typeof subcategories];
          
          // Update counts for each subcategory
          const updatedSubcats = await Promise.all(
            subcatsForCategory.map(async (subcat) => {
              const subcatName = subcat.name.toLowerCase();
              try {
                // Query the database for documents with this subcategory
                const results = await mongoDbQuery(
                  collectionName, 
                  { subcategory: subcatName }, 
                  { count: true }
                );
                
                // Update the count
                return {
                  ...subcat,
                  count: typeof results === 'number' ? results : 
                         (Array.isArray(results) ? results.length : 0)
                };
              } catch (err) {
                console.error(`Error counting subcategory ${subcatName}:`, err);
                return subcat; // Return original subcat if there's an error
              }
            })
          );
          
          return NextResponse.json(updatedSubcats);
        } catch (error) {
          console.error(`Error counting subcategories for ${categoryId}:`, error);
          // Fall back to static subcategories without counts
          return NextResponse.json(subcategories[categoryId as keyof typeof subcategories]);
        }
      }
      
      // If no collection name found, return static subcategories
      return NextResponse.json(subcategories[categoryId as keyof typeof subcategories]);
    }

    // If no static subcategories, try to get from database
    const results = await mongoDbQuery('subcategories', { categoryId }, {});
    
    if (results && results.length > 0) {
      return NextResponse.json(results);
    }

    // Return empty array if no subcategories found
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: `Failed to fetch subcategories: ${error.message}` },
      { status: 500 }
    );
  }
} 