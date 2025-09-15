import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug requerido' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
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

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      // Buscar por título que contenga el slug
      const publications = await collection.find({ 
        status: 'active',
        $or: [
          { title: slugRegex },
          { 'titleSlug': slug },
          { 'titleSlug': { $regex: slug, $options: 'i' } }
        ]
      }).limit(1).toArray();

      if (publications.length > 0) {
        const publication = publications[0];
        // Convertir ObjectId a string
        publication._id = publication._id.toString();
        
        return NextResponse.json({
          success: true,
          publication
        });
      }
    }

    return NextResponse.json(
      { error: 'Publicación no encontrada' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching publication by slug:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



