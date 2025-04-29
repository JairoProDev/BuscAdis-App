import { NextResponse } from 'next/server';
import { getServerMongoClient } from '@/lib/mongodb-server';
import { generatePdfMagazine } from '@/features/magazine/services/pdf-generator.service';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    const { client, db } = await getServerMongoClient();
    
    // Fetch active publications from all collections
    const collections = [
      'publications_inmuebles',
      'publications_vehiculos',
      'publications_empleos',
      'publications_servicios', 
      'publications_productos',
      'publications_eventos',
      'publications_negocios',
      'publications_comunidad'
    ];
    
    console.log('[Magazine API] Fetching publications from all collections...');
    
    let allPublications = [];
    let totalPublications = 0;
    
    // Fetch from each collection
    for (const collectionName of collections) {
      try {
        // Check if collection exists
        const collectionList = await db.listCollections({ name: collectionName }).toArray();
        if (collectionList.length === 0) {
          console.log(`[Magazine API] Collection ${collectionName} does not exist, skipping...`);
          continue;
        }
        
        const collection = db.collection(collectionName);
        const pubsFromCollection = await collection.find({}).toArray();
        
        if (pubsFromCollection.length > 0) {
          console.log(`[Magazine API] Found ${pubsFromCollection.length} publications in ${collectionName}`);
          
          // Add category field to each document based on collection name
          const categoryName = collectionName.replace('publications_', '');
          const processedPublications = pubsFromCollection.map(pub => ({
            ...pub,
            categorySlug: pub.categorySlug || categoryName
          }));
          
          allPublications = [...allPublications, ...processedPublications];
          totalPublications += pubsFromCollection.length;
        }
      } catch (err) {
        console.error(`[Magazine API] Error fetching from ${collectionName}:`, err);
      }
    }
    
    if (allPublications.length === 0) {
      await client.close();
      return NextResponse.json(
        { message: 'No hay publicaciones disponibles para generar la revista' },
        { status: 400 }
      );
    }
    
    console.log(`[Magazine API] Generating magazine with ${allPublications.length} total publications`);
    
    // Group publications by category for better organization
    const groupedPublications = allPublications.reduce((acc, pub) => {
      const category = pub.categorySlug || 'otros';
      if (!acc[category]) acc[category] = [];
      acc[category].push(pub);
      return acc;
    }, {});
    
    // Convert to array format expected by pdf generator
    const categoriesArray = Object.entries(groupedPublications).map(([categoryName, publications]) => ({
      categoryName,
      publications
    }));

    // Generate PDF
    const pdfBuffer = await generatePdfMagazine(categoriesArray);
    
    // Create a unique filename and timestamp
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `buscadis-revista-${timestamp}.pdf`;
    
    // Store PDF in MongoDB GridFS
    const gridFSBucket = new GridFSBucket(db, { bucketName: 'magazines' });
    
    // Create a stream to upload the PDF
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata: {
        contentType: 'application/pdf',
        publicationCount: allPublications.length,
        createdAt: new Date()
      }
    });
    
    // Upload the buffer
    uploadStream.write(pdfBuffer);
    uploadStream.end();
    
    // Wait for the upload to finish
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // Get the file ID
    const fileId = uploadStream.id;
    
    // Save magazine record in the database
    const magazinesCollection = db.collection('magazines');
    const magazineRecord = {
      pdfUrl: `/api/magazine/download/${fileId}`,
      filename: filename,
      fileId: fileId,
      publicationCount: allPublications.length,
      createdAt: new Date()
    };
    
    const result = await magazinesCollection.insertOne(magazineRecord);
    
    // Close the MongoDB connection
    await client.close();
    
    return NextResponse.json({
      success: true,
      pdfUrl: `/api/magazine/download/${fileId}`,
      fileId: fileId,
      publicationCount: allPublications.length,
      createdAt: new Date(),
      magazineId: result.insertedId
    });
  } catch (error) {
    console.error('[Magazine API] Error generating magazine:', error);
    return NextResponse.json(
      { message: 'Error al generar la revista', error: (error as Error).message },
      { status: 500 }
    );
  }
} 