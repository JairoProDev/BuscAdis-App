import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb-server';
import { Logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isFavorite } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de publicación requerido' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB || 'buscadis');
    const collection = db.collection('publications');

    // Update the publication's engagement metrics
    const updateOperation = isFavorite
      ? { $inc: { 'engagement.saves': 1 } }
      : { $inc: { 'engagement.saves': -1 } };

    const result = await collection.updateOne(
      { _id: id },
      updateOperation
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      );
    }

    Logger.info('Favorite status updated', { 
      publicationId: id, 
      isFavorite 
    });

    return NextResponse.json({ 
      success: true, 
      isFavorite,
      message: isFavorite ? 'Agregado a favoritos' : 'Removido de favoritos'
    });

  } catch (error) {
    console.error('Error updating favorite status:', error);
    Logger.error('Error updating favorite status', { error });
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
