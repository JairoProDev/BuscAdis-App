import { NextResponse } from 'next/server';
import { ObjectId, GridFSBucket } from 'mongodb';
import { getServerMongoClient } from '@/lib/mongodb-server';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    console.log('[Magazine Download API] Starting file download...');
    
    // Get the file ID from the URL
    const fileId = params.fileId;
    
    if (!fileId || !ObjectId.isValid(fileId)) {
      console.log('[Magazine Download API] Invalid file ID:', fileId);
      return NextResponse.json(
        { message: 'ID de archivo inválido' },
        { status: 400 }
      );
    }
    
    console.log(`[Magazine Download API] Fetching file with ID: ${fileId}`);
    
    // Connect to MongoDB using our server client
    const { client, db } = await getServerMongoClient();
    
    // Create GridFS bucket
    const gridFSBucket = new GridFSBucket(db, { bucketName: 'magazines' });
    
    // Get file info
    const file = await db.collection('magazines.files').findOne({ _id: new ObjectId(fileId) });
    
    if (!file) {
      console.log(`[Magazine Download API] File not found with ID: ${fileId}`);
      await client.close();
      return NextResponse.json(
        { message: 'Archivo no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`[Magazine Download API] Found file: ${file.filename}, size: ${file.length} bytes`);
    
    // Create download stream
    const downloadStream = gridFSBucket.openDownloadStream(new ObjectId(fileId));
    
    // Collect chunks
    const chunks: Buffer[] = [];
    
    // Create a promise to handle stream
    const streamToBuffer = new Promise<Buffer>((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      downloadStream.on('error', (error) => {
        console.error('[Magazine Download API] Stream error:', error);
        reject(error);
      });
      downloadStream.on('end', () => {
        console.log(`[Magazine Download API] Stream completed, received ${chunks.length} chunks`);
        resolve(Buffer.concat(chunks));
      });
    });
    
    // Wait for stream to finish
    const buffer = await streamToBuffer;
    console.log(`[Magazine Download API] Buffer created with size: ${buffer.length} bytes`);
    
    // Close MongoDB connection
    await client.close();
    
    // Create response with PDF content
    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });
    
    console.log(`[Magazine Download API] Response prepared, sending file: ${file.filename}`);
    return response;
  } catch (error) {
    console.error('[Magazine Download API] Error downloading file:', error);
    return NextResponse.json(
      { message: 'Error al descargar el archivo', error: (error as Error).message },
      { status: 500 }
    );
  }
} 