import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

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

    const client = await connectToDatabase;
    const db = client.db();
    const collections = [
      'publications_empleos',
      'publications_inmuebles', 
      'publications_vehiculos',
      'publications_servicios',
      'publications_productos',
      'publications_eventos',
      'publications_negocios',
      'publications_comunidad'
    ];

    // Crear regex para búsqueda flexible del slug
    const slugRegex = new RegExp(slug.replace(/-/g, '[-\\s]*'), 'i');

    let publication: any = null;

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      publication = await collection.findOne({ slug });
      if (publication) {
        break;
      }
    }

    if (publication) {
      // Convert ObjectId to string for JSON serialization
      publication._id = publication._id.toString();
      return NextResponse.json(publication);
    } else {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching publication by slug:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



