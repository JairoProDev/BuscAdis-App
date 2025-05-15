import { NextResponse } from 'next/server';
import { getServerMongoClient } from '@/lib/mongodb-server';
import { ObjectId } from 'mongodb';

// Mapa de categorías a colecciones de MongoDB
const CATEGORY_TO_COLLECTION = {
  'inmuebles': 'publications_inmuebles',
  'vehiculos': 'publications_vehiculos',
  'empleos': 'publications_empleos',
  'servicios': 'publications_servicios',
  'productos': 'publications_productos',
  'eventos': 'publications_eventos',
  'negocios': 'publications_negocios',
  'comunidad': 'publications_comunidad'
};

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    
    // Verificar si la categoría existe
    if (!Object.keys(CATEGORY_TO_COLLECTION).includes(categoryId)) {
      return NextResponse.json(
        { message: 'Categoría no válida' },
        { status: 400 }
      );
    }
    
    const collectionName = CATEGORY_TO_COLLECTION[categoryId as keyof typeof CATEGORY_TO_COLLECTION];
    const { client, db } = await getServerMongoClient();
    
    // Comprobar si existe la revista para esta categoría
    const magazinesCollection = db.collection('magazines_by_category');
    const latestMagazine = await magazinesCollection
      .find({ categoryId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    // Obtener las últimas publicaciones de esta categoría
    const publicationsCollection = db.collection(collectionName);
    const recentPublications = await publicationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    // Procesar las publicaciones para enviar al cliente
    const processedPublications = recentPublications.map(pub => ({
      id: pub._id.toString(),
      title: pub.title,
      description: pub.description,
      price: pub.amount,
      currency: pub.currency,
      images: pub.images || [],
      location: pub.location,
      createdAt: pub.createdAt,
      attributes: pub.attributes || {}
    }));
    
    await client.close();
    
    // Si hay una revista, devolver la información
    if (latestMagazine.length > 0) {
      const magazine = latestMagazine[0];
      return NextResponse.json({ 
        magazine: {
          _id: magazine._id.toString(),
          categoryId: magazine.categoryId,
          pdfUrl: magazine.pdfUrl,
          fileId: magazine.fileId.toString(),
          publicationCount: magazine.publicationCount,
          createdAt: magazine.createdAt,
          lastUpdated: magazine.lastUpdated || magazine.createdAt,
          filename: magazine.filename
        },
        publications: processedPublications,
        status: 'success'
      });
    } else {
      // No hay revista pero devolvemos las publicaciones para mostrar
      return NextResponse.json({ 
        magazine: null,
        publications: processedPublications,
        status: 'no_magazine'
      });
    }
  } catch (error) {
    console.error('[Magazine API] Error fetching category magazine:', error);
    return NextResponse.json(
      { message: 'Error al obtener la revista por categoría', error: (error as Error).message },
      { status: 500 }
    );
  }
} 