import { NextResponse } from 'next/server'
import { mongoDbQuery } from '@/lib/mongodb-server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Debug flag
const DEBUG = true;

function logDebug(message: string, data?: unknown) {
  if (DEBUG) {
    console.log(`[Related Publications API Debug] ${message}`, data ? data : '');
  }
}

function logError(message: string, error: unknown) {
  console.error(`[Related Publications API Error] ${message}:`, error);
  if (error && typeof error === 'object' && 'stack' in error) {
    console.error('Stack:', (error as Error).stack);
  }
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

// Endpoint para obtener publicaciones relacionadas
export async function GET(request: Request) {
  try {
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
    
    // Verificar si la categoría existe
    if (!(category in CATEGORY_COLLECTIONS)) {
      return NextResponse.json(
        { error: `Invalid category: ${category}` },
        { status: 400 }
      );
    }
    
    // Obtener la colección correspondiente a la categoría
    const collectionName = CATEGORY_COLLECTIONS[category];
    
    // Crear la consulta para excluir la publicación actual
    const query: Record<string, unknown> = {};
    if (excludeId) {
      query.id = { $ne: excludeId };
    }
    
    // Determinar el límite de resultados
    const limit = limitParam ? parseInt(limitParam, 10) : 6;
    
    logDebug(`Buscando publicaciones relacionadas en categoría ${category}`, {
      collection: collectionName,
      excludeId,
      limit
    });
    
    // Ejecutar la consulta
    const results = await mongoDbQuery(
      collectionName,
      query,
      {
        limit,
        sort: { created_at: -1 } // Ordenar por fecha de creación, más recientes primero
      }
    );
    
    if (!Array.isArray(results)) {
      return NextResponse.json([]);
    }
    
    logDebug(`Se encontraron ${results.length} publicaciones relacionadas`);
    
    return NextResponse.json(results);
  } catch (error) {
    logError('Error al obtener publicaciones relacionadas', error);
    
    // En caso de error, devolver un array vacío para no romper la UI
    return NextResponse.json(
      [],
      { status: 200 }
    );
  }
} 