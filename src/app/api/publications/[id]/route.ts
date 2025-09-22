import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, Db, ObjectId } from 'mongodb'

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
    
    const db = await getDb()
    const collection = db.collection(COLLECTION)
    
    // Try different search strategies
    let publication = null
    
    // 1. Try by sequentialId (if numeric)
    const numericId = Number(id)
    if (Number.isFinite(numericId)) {
      publication = await collection.findOne({ sequentialId: numericId })
    }
    
    // 2. Try by MongoDB ObjectId (if valid ObjectId format)
    if (!publication && /^[0-9a-fA-F]{24}$/.test(id)) {
      publication = await collection.findOne({ _id: new ObjectId(id) })
    }
    
    // 3. Try by string id field
    if (!publication) {
      publication = await collection.findOne({ id: id })
    }

    if (!publication) {
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
    
    // publication is already defined above
    
    // Format the publication for frontend consumption
    const formattedPublication = {
      id: publication._id || publication.id || id,
      sequentialId: publication.sequentialId || null,
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
    
    const db = await getDb()
    const collection = db.collection(COLLECTION)
    const exists = await collection.findOne({ $or: [{ _id: new ObjectId(id) }, { id }, { sequentialId: Number(id) }] }).catch(() => null)
    if (!exists) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      );
    }
    await collection.updateOne(
      { $or: [{ _id: new ObjectId(id) }, { id }, { sequentialId: Number(id) }] },
      { $set: { ...body, updatedAt: new Date() } }
    )
    const updated = await collection.findOne({ $or: [{ _id: new ObjectId(id) }, { id }, { sequentialId: Number(id) }] })
    return NextResponse.json(updated);
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
    
    const db = await getDb()
    const collection = db.collection(COLLECTION)
    const exists = await collection.findOne({ $or: [{ _id: new ObjectId(id) }, { id }, { sequentialId: Number(id) }] }).catch(() => null)
    if (!exists) {
      return NextResponse.json(
        { error: 'Publication not found' },
        { status: 404 }
      );
    }
    await collection.deleteOne({ $or: [{ _id: new ObjectId(id) }, { id }, { sequentialId: Number(id) }] })
    return NextResponse.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 