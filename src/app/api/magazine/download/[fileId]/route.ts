import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    // Get the file ID from the URL
    const fileId = params.fileId;
    
    if (!fileId || !ObjectId.isValid(fileId)) {
      return NextResponse.json(
        { message: 'ID de archivo inválido' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Create GridFS bucket
    const gridFSBucket = new GridFSBucket(db, { bucketName: 'magazines' });
    
    // Get file info
    const file = await db.collection('magazines.files').findOne({ _id: new ObjectId(fileId) });
    
    if (!file) {
      await client.close();
      return NextResponse.json(
        { message: 'Archivo no encontrado' },
        { status: 404 }
      );
    }
    
    // Create download stream
    const downloadStream = gridFSBucket.openDownloadStream(new ObjectId(fileId));
    
    // Collect chunks
    const chunks: Buffer[] = [];
    
    // Create a promise to handle stream
    const streamToBuffer = new Promise<Buffer>((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      downloadStream.on('error', (error) => reject(error));
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    // Wait for stream to finish
    const buffer = await streamToBuffer;
    
    // Close MongoDB connection
    await client.close();
    
    // Create response with PDF content
    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });
    
    return response;
  } catch (error) {
    console.error('[Magazine API] Error downloading file:', error);
    return NextResponse.json(
      { message: 'Error al descargar el archivo', error: (error as Error).message },
      { status: 500 }
    );
  }
} 