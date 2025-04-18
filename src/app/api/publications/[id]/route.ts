import { NextResponse } from 'next/server'
import { mongoDbGetById } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Define Publication interface
interface Publication {
  id?: string;
  _id?: string;
  categorySlug?: string; // Database field name
  subcategorySlug?: string; // Database field name
  subSubcategorySlug?: string; // Database field name
  // For backward compatibility
  subcategory?: string;
  subsubcategory?: string;
  [key: string]: unknown; // Allow for other properties with unknown type instead of any
}

// Mapeo de categorías a colecciones
const CATEGORY_COLLECTIONS: Record<string, string> = {
  empleos: 'publications_empleos',
  inmuebles: 'publications_inmuebles',
  vehiculos: 'publications_vehiculos',
  servicios: 'publications_servicios',
  productos: 'publications_productos',
  eventos: 'publications_eventos',
  negocios: 'publications_negocios',
  comunidad: 'publications_comunidad',
};

// Categorías válidas
type ValidCategory = keyof typeof CATEGORY_COLLECTIONS;

// Fallback publication for development environment
const FALLBACK_PUBLICATION: Publication = {
  title: "Publicación de ejemplo",
  description: "Esta es una publicación de ejemplo que se muestra cuando no se encuentra la publicación solicitada (solo en desarrollo).",
  price: 0,
  currency: "PEN",
  categorySlug: "productos",
  location: { city: "Lima", region: "Lima" },
  contactName: "Usuario de Prueba",
  contactPhone: "51999888777",
  status: "active",
  createdAt: new Date().toISOString(),
  images: ["/images/placeholder-buscadis.jpg"],
  premium: true,
  verified: true,
  subcategorySlug: "ejemplo",
  subSubcategorySlug: "muestra"
};

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // Explicitly await the params object before accessing its properties
  const params = await context.params; 
  const id = params.id;

  // Log the ID early for debugging
  console.log(`API Route: Received request for publication ID: ${id}`);
  
  // Keep a reference to the original ID for error logging if needed
  const originalIdForErrorLogging = id; 
  
  try {
    // 'id' is now available from the awaited params
    console.log(`Buscando publicación con ID: ${id}`);
    
    let publication: Publication | null = null;
    
    // Get all query parameters
    const url = new URL(request.url);
    const categoryFromQuery = url.searchParams.get('category');
    const subcategoryFromQuery = url.searchParams.get('subcategory');
    const subsubcategoryFromQuery = url.searchParams.get('subsubcategory');
    
    console.log('Query params:', { 
      categoryFromQuery, 
      subcategoryFromQuery, 
      subsubcategoryFromQuery 
    });
    
    // 1. Si tenemos la categoría, buscar directamente en esa colección
    if (categoryFromQuery && categoryFromQuery in CATEGORY_COLLECTIONS) {
      const collectionName = CATEGORY_COLLECTIONS[categoryFromQuery as ValidCategory];
      console.log(`Buscando en colección específica: ${collectionName}`);
      publication = await mongoDbGetById(collectionName, id);
      
      // If found, update with subcategory and subsubcategory from query if they exist
      if (publication) {
        if (subcategoryFromQuery) {
          publication.subcategorySlug = subcategoryFromQuery;
          publication.subcategory = subcategoryFromQuery; // For backward compatibility
        }
        if (subsubcategoryFromQuery) {
          publication.subSubcategorySlug = subsubcategoryFromQuery;
          publication.subsubcategory = subsubcategoryFromQuery; // For backward compatibility
        }
      }
    } 
    
    // 2. Si no tenemos categoría o no se encontró, buscar en todas las colecciones
    if (!publication) {
      console.log('Buscando en todas las colecciones...');
      for (const [category, collectionName] of Object.entries(CATEGORY_COLLECTIONS)) {
        try {
          const result = await mongoDbGetById(collectionName, id);
          if (result) {
            publication = result as Publication;
            // Ensure the category is set on the publication
            if (!publication.categorySlug) {
              publication.categorySlug = category;
            }
            // Add subcategory and subsubcategory from query if provided
            if (subcategoryFromQuery) {
              publication.subcategorySlug = subcategoryFromQuery;
              publication.subcategory = subcategoryFromQuery; // For backward compatibility
            }
            if (subsubcategoryFromQuery) {
              publication.subSubcategorySlug = subsubcategoryFromQuery;
              publication.subsubcategory = subsubcategoryFromQuery; // For backward compatibility
            }
            console.log(`Publicación encontrada en colección: ${collectionName}`);
            break;
          }
        } catch (err) {
          console.log(`Error al buscar en ${collectionName}:`, err);
          // Continuar con la siguiente colección
        }
      }
    }
    
    // 3. Si no se encuentra la publicación
    if (!publication) {
      console.log(`Publicación no encontrada con ID: ${id}`);
      
      // En producción, retornar 404 con mensaje amigable
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Publication not found',
            errorFriendly: 'No pudimos encontrar la publicación solicitada.',
            id: id,
            status: 404
          }),
          { status: 404 }
        );
      }
      
      // En desarrollo, retornar una publicación de ejemplo para facilitar pruebas
      console.log('Retornando publicación de ejemplo');
      return NextResponse.json({
        ...FALLBACK_PUBLICATION,
        id,
        _fallback: true,
        categorySlug: categoryFromQuery || FALLBACK_PUBLICATION.categorySlug,
        subcategorySlug: subcategoryFromQuery || FALLBACK_PUBLICATION.subcategorySlug,
        subSubcategorySlug: subsubcategoryFromQuery || FALLBACK_PUBLICATION.subSubcategorySlug,
        // For backward compatibility
        subcategory: subcategoryFromQuery || FALLBACK_PUBLICATION.subcategorySlug,
        subsubcategory: subsubcategoryFromQuery || FALLBACK_PUBLICATION.subSubcategorySlug,
        message: "Esta es una publicación de ejemplo que se muestra solo en desarrollo"
      });
    }
    
    // Ensure backward compatibility for frontend that may expect subcategory/subsubcategory
    if (publication.subcategorySlug && !publication.subcategory) {
      publication.subcategory = publication.subcategorySlug;
    }
    
    if (publication.subSubcategorySlug && !publication.subsubcategory) {
      publication.subsubcategory = publication.subSubcategorySlug;
    }
    
    return NextResponse.json(publication);
  } catch (error) {
    // Log the specific error that occurred during the fetch attempt
    console.error(`Error fetching publication with ID ${originalIdForErrorLogging}:`, error);
    
    // Return a proper error response
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch publication',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        errorFriendly: 'Ocurrió un error al intentar obtener la publicación. Por favor, intenta nuevamente.',
        id: originalIdForErrorLogging,
        status: 500
      }),
      { status: 500 }
    );
  }
} 