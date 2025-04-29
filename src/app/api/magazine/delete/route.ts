import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

export async function DELETE(request: Request) {
  try {
    const { fileId, magazineId } = await request.json();

    if (!fileId || !magazineId) {
      return NextResponse.json(
        { message: 'IDs son necesarios para eliminar la revista' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Create GridFS bucket
    const gridFSBucket = new GridFSBucket(db, { bucketName: 'magazines' });
    
    // Delete file from GridFS
    try {
      await gridFSBucket.delete(new ObjectId(fileId));
      console.log(`[Magazine API] Deleted file ${fileId} from GridFS`);
    } catch (error) {
      console.error(`[Magazine API] Error deleting file ${fileId} from GridFS:`, error);
      // Continue to delete the record even if file deletion fails
    }
    
    // Delete magazine record from database
    const magazinesCollection = db.collection('magazines');
    const result = await magazinesCollection.deleteOne({ _id: new ObjectId(magazineId) });
    
    // Close connection
    await client.close();
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'No se encontró la revista para eliminar' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Revista eliminada correctamente'
    });
  } catch (error) {
    console.error('[Magazine API] Error deleting magazine:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la revista', error: (error as Error).message },
      { status: 500 }
    );
  }
} 