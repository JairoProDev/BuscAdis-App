import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { sequentialId: string } }
) {
  try {
    const { sequentialId } = params;
    
    if (!sequentialId || isNaN(Number(sequentialId))) {
      return NextResponse.json(
        { error: 'Sequential ID inválido' },
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

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const publication = await collection.findOne({ 
        sequentialId: parseInt(sequentialId),
        status: 'active'
      });

      if (publication) {
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
    console.error('Error fetching publication by sequential ID:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



