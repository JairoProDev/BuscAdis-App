import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
const COLLECTION = 'adisos'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function getDb() {
  if (cachedClient && cachedDb) return cachedDb
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  cachedClient = client
  cachedDb = client.db(MONGODB_DB)
  return cachedDb
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sequentialId: string }> }
) {
  try {
    const params = await context.params;
    const { sequentialId } = params;
    
    if (!sequentialId || isNaN(Number(sequentialId))) {
      return NextResponse.json(
        { error: 'Sequential ID inválido' },
        { status: 400 }
      );
    }

    const db = await getDb()
    const collection = db.collection(COLLECTION)
    
    const publication = await collection.findOne({ 
      sequentialId: parseInt(sequentialId),
      status: 'active'
    });

    if (!publication) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    // Format the publication for frontend consumption
    const formattedPublication = {
      id: publication._id || publication.id || sequentialId,
      sequentialId: publication.sequentialId,
      title: publication.title || 'Sin título',
      description: publication.description || '',
      price: publication.amount || publication.price || 0,
      currency: publication.currency || 'PEN',
      categorySlug: publication.categorySlug || publication.category || '',
      subcategorySlug: publication.subcategorySlug || publication.subcategory || null,
      subSubcategorySlug: publication.subSubcategorySlug || publication.subsubcategory || null,
      location: typeof publication.location === 'string' ? { city: publication.location, country: 'Perú' } : (publication.location || { city: '', country: 'Perú' }),
      contact: publication.contact || {
        name: publication.contactName || '',
        phone: publication.contactPhone || '',
        email: publication.contactEmail || ''
      },
      images: Array.isArray(publication.images) ? publication.images : [],
      status: publication.status || 'active',
      premium: publication.premium || false,
      createdAt: publication.createdAt || publication.created_at || new Date().toISOString(),
      updatedAt: publication.updatedAt || publication.updated_at || publication.createdAt || new Date().toISOString(),
      views: publication.views || 0,
      featured: publication.featured || false,
      attributes: publication.attributes || {},
      isActive: publication.isActive !== false,
    };
    
    return NextResponse.json({ publication: formattedPublication });
  } catch (error) {
    console.error('Error fetching publication by sequential ID:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}