import { NextRequest, NextResponse } from 'next/server'
import { mongoDbGetById } from '@/lib/mongodb-server'
import dbConnect from '@/lib/dbConnect'
import { getPublicationModel } from '@/lib/models/Publication'

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

// Determine which collection to use based on ID or category
function getCollectionFromId(id: string): string {
  // Simple heuristic: check if ID has category prefix
  if (id.startsWith('inmuebles_')) return 'inmuebles';
  if (id.startsWith('vehiculos_')) return 'vehiculos';
  if (id.startsWith('empleos_')) return 'empleos';
  if (id.startsWith('servicios_')) return 'servicios';
  if (id.startsWith('productos_')) return 'productos';
  if (id.startsWith('eventos_')) return 'eventos';
  if (id.startsWith('negocios_')) return 'negocios';
  if (id.startsWith('comunidad_')) return 'comunidad';
  
  // Default to inmuebles if no prefix found
  return 'inmuebles';
}

// Helper function to search across all collections
async function findPublicationInAllCollections(publicationId: string) {
  const categories = ['inmuebles', 'vehiculos', 'empleos', 'servicios', 'productos', 'eventos', 'negocios', 'comunidad'];
  
  for (const category of categories) {
    try {
      const model = getPublicationModel(category);
      const publication = await model.findOne({
        $or: [
          { _id: publicationId },
          { publicationId: publicationId },
          { id: publicationId }
        ]
      }).lean();
      
      if (publication) {
        return { publication, category };
      }
    } catch (error) {
      console.log(`No publication found in ${category} collection`);
      continue;
    }
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Publication ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Try to find the publication in all collections
    const result = await findPublicationInAllCollections(id);
    
    if (!result) {
      // Fallback publication data structure
      const FALLBACK_PUBLICATION = {
        id: id,
        title: 'Publicación no encontrada',
        description: 'Esta publicación podría haber sido eliminada o no existe.',
        price: 0,
        currency: 'PEN',
        categorySlug: 'general',
        subcategorySlug: 'otros',
        location: {
          department: 'Lima',
          province: 'Lima',
          district: 'Lima'
        },
        contact: {
          phone: '',
          email: '',
          name: 'Usuario'
        },
        images: [],
        attributes: {},
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(FALLBACK_PUBLICATION);
    }
    
    const { publication: publicationData } = result;
    
    // Ensure we have a single publication object (not an array)
    const publication = Array.isArray(publicationData) ? publicationData[0] : publicationData;
    
    // Format the publication for frontend consumption
    const formattedPublication = {
      id: (publication as any)?._id?.toString() || (publication as any)?.id || id,
      title: publication.title || 'Sin título',
      description: publication.description || '',
      price: publication.amount || publication.price || 0,
      currency: publication.currency || 'PEN',
      categorySlug: publication.categorySlug || publication.category,
      subcategorySlug: publication.subcategorySlug || publication.subcategory,
      subSubcategorySlug: publication.subSubcategorySlug,
      location: publication.location || {},
      contact: publication.contact || {},
      images: publication.images || [],
      attributes: publication.attributes || {},
      isActive: publication.isActive !== false,
      createdAt: publication.createdAt || new Date().toISOString(),
      updatedAt: publication.updatedAt || publication.createdAt || new Date().toISOString(),
      views: publication.views || 0,
      favorites: publication.favorites || 0
    };
    
    return NextResponse.json({ publication: formattedPublication });
  } catch (error) {
    console.error('Error fetching publication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    await dbConnect();
    
    // Find which collection contains this publication
    const result = await findPublicationInAllCollections(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      );
    }
    
    const { category } = result;
    const model = getPublicationModel(category);
    
    const updatedPublication = await model.findOneAndUpdate(
      {
        $or: [
          { _id: id },
          { publicationId: id },
          { id: id }
        ]
      },
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    
    return NextResponse.json(updatedPublication);
  } catch (error) {
    console.error('Error updating publication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    await dbConnect();
    
    // Find which collection contains this publication
    const result = await findPublicationInAllCollections(id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      );
    }
    
    const { category } = result;
    const model = getPublicationModel(category);
    
    await model.findOneAndDelete({
      $or: [
        { _id: id },
        { publicationId: id },
        { id: id }
      ]
    });
    
    return NextResponse.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 