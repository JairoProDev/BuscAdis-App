import { NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

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

// Endpoint para obtener publicaciones relacionadas
export async function GET(request: Request) {
  try {
    Logger.debug('GET /api/publications/related received')
    
    // Obtener parámetros de la consulta
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const excludeId = url.searchParams.get('excludeId');
    const limitParam = url.searchParams.get('limit');
    
    // Validar parámetros
    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }
    
    // Conectar a la base de datos
    const { db } = await connectToDatabase()
    const collection = db.collection(UNIFIED_COLLECTION)
    
    // Crear la consulta para excluir la publicación actual y filtrar por categoría
    const query: Record<string, unknown> = {
      category: category // Filtrar por categoría (empleos, inmuebles, etc.)
    };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    // Determinar el límite de resultados
    const limit = limitParam ? parseInt(limitParam, 10) : 6;
    
    Logger.debug('Related publications query', {
      category,
      excludeId,
      limit,
      query
    });
    
    // Ejecutar la consulta
    const results = await collection
      .find(query)
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación, más recientes primero
      .limit(limit)
      .toArray();
    
    Logger.info(`Found ${results.length} related publications for category ${category}`, {
      category,
      total: results.length
    });
    
    return NextResponse.json(results);
  } catch (error) {
    Logger.error('Error al obtener publicaciones relacionadas', { error });
    
    // En caso de error, devolver un array vacío para no romper la UI
    return NextResponse.json(
      [],
      { status: 200 }
    );
  }
} 