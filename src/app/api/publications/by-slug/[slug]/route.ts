import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
const UNIFIED_COLLECTION = 'adisos'

// Cache de conexión
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    cachedClient = client
    cachedDb = db
    
    Logger.info('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    Logger.error('Failed to connect to MongoDB', { error })
    throw error
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requerido' },
        { status: 400 }
      );
    }

    Logger.debug('GET /api/publications/by-slug received', { slug })

    const { db } = await connectToDatabase()
    const collection = db.collection(UNIFIED_COLLECTION)

    // Buscar por slug en la colección unificada
    const publication = await collection.findOne({ slug });

    Logger.debug('Publication by slug query', { 
      slug, 
      found: !!publication 
    });

    if (publication) {
      // Convert ObjectId to string for JSON serialization
      publication._id = publication._id.toString();
      
      Logger.info(`Found publication by slug: ${slug}`, {
        id: publication._id,
        category: publication.category
      });
      
      return NextResponse.json(publication);
    } else {
      Logger.info(`Publication not found by slug: ${slug}`);
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }
  } catch (error) {
    Logger.error('Error fetching publication by slug', { error, slug });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



