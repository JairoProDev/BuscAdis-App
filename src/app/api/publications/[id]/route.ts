import { NextResponse } from 'next/server'
import { mongoDbGetById, mongoDbQuery } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

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

// Una publicación de ejemplo para casos donde no se encuentra la real
const FALLBACK_PUBLICATION = {
  id: "sample_fallback",
  title: "Anuncio de ejemplo",
  description: "Este es un anuncio de ejemplo que se muestra cuando no se puede encontrar el anuncio solicitado.",
  price: 1000,
  currency: "USD",
  category: "productos",
  subcategory: "tecnologia",
  location: { city: "Lima", region: "Lima" },
  contactName: "Soporte BuscAdis",
  contactEmail: "soporte@buscadis.com",
  contactPhone: "+51 999 888 777",
  status: "active",
  images: ["/images/sample/product-1.jpg", "/images/sample/product-2.jpg"],
  created_at: new Date().toISOString(),
};

export async function GET(
  request: Request,
  { params: { id } }: { params: { id: string } }
) {
  // Log the ID early for debugging, now that it's directly available
  console.log(`API Route: Received request for publication ID: ${id}`); 
  
  // Keep a reference to the original ID for error logging if needed
  const originalIdForErrorLogging = id; 
  
  try {
    console.log(`Buscando publicación con ID: ${id}`);
    
    let publication = null;
    
    // Si la URL incluye categoría, se puede extraer
    const url = new URL(request.url);
    const categoryFromQuery = url.searchParams.get('category');
    
    // 1. Si tenemos la categoría, buscar directamente en esa colección
    if (categoryFromQuery && categoryFromQuery in CATEGORY_COLLECTIONS) {
      const collectionName = CATEGORY_COLLECTIONS[categoryFromQuery];
      console.log(`Buscando en colección específica: ${collectionName}`);
      publication = await mongoDbGetById(collectionName, id);
    } 
    
    // 2. Si no tenemos categoría o no se encontró, buscar en todas las colecciones
    if (!publication) {
      console.log('Buscando en todas las colecciones...');
      for (const [category, collectionName] of Object.entries(CATEGORY_COLLECTIONS)) {
        try {
          const result = await mongoDbGetById(collectionName, id);
          if (result) {
            publication = result;
            console.log(`Publicación encontrada en colección: ${collectionName}`);
            break;
          }
        } catch (err) {
          console.log(`Error al buscar en ${collectionName}:`, err);
          // Continuar con la siguiente colección
        }
      }
    }
    
    // 3. Buscar publicaciones similares si se necesita
    if (!publication) {
      console.log('Publicación no encontrada en ninguna colección');
      
      // En producción, retornar 404
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Publication not found',
            errorFriendly: 'No pudimos encontrar la publicación solicitada.' 
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
        message: "Esta es una publicación de ejemplo que se muestra solo en desarrollo"
      });
    }
    
    return NextResponse.json(publication);
  } catch (error) {
    // Log the specific error that occurred during the fetch attempt
    // Use the original ID variable captured earlier for clarity in logs
    console.error(`Error fetching publication with ID ${originalIdForErrorLogging}:`, error);
    
    // Always return a 500 error if the fetch itself failed, regardless of environment
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch publication',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        errorFriendly: 'Ocurrió un error al intentar obtener la publicación. Por favor, intenta nuevamente.' 
      }),
      { status: 500 }
    );
  }
} 