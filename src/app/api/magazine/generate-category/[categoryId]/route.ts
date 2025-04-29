import { NextResponse } from 'next/server';
import { getServerMongoClient } from '@/lib/mongodb-server';
import { generatePdfMagazine } from '@/features/magazine/services/pdf-generator.service';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';
import { format } from 'date-fns';

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

// Nombres legibles de categorías
const CATEGORY_NAMES = {
  'inmuebles': 'Inmuebles',
  'vehiculos': 'Vehículos',
  'empleos': 'Empleos',
  'servicios': 'Servicios',
  'productos': 'Productos',
  'eventos': 'Eventos',
  'negocios': 'Negocios',
  'comunidad': 'Comunidad'
};

export async function POST(
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
    const categoryName = CATEGORY_NAMES[categoryId as keyof typeof CATEGORY_NAMES];
    
    // Conectar a MongoDB
    const { client, db } = await getServerMongoClient();
    
    console.log(`[Magazine API] Generando revista para categoría: ${categoryName}`);
    
    // Obtener publicaciones de esta categoría
    const collection = db.collection(collectionName);
    const publicationsFromCategory = await collection.find({}).toArray();
    
    if (publicationsFromCategory.length === 0) {
      await client.close();
      return NextResponse.json(
        { message: `No hay publicaciones disponibles en la categoría ${categoryName}` },
        { status: 400 }
      );
    }
    
    console.log(`[Magazine API] Encontradas ${publicationsFromCategory.length} publicaciones para ${categoryName}`);
    
    // Procesar publicaciones y añadir el slug de categoría
    const processedPublications = publicationsFromCategory.map(pub => ({
      ...pub,
      categorySlug: categoryId
    }));
    
    // Categorías para el generador de PDF (formato esperado)
    const categoriesForPdf = [{
      categoryName: categoryName,
      publications: processedPublications
    }];
    
    // Generar PDF
    const pdfBuffer = await generatePdfMagazine(categoriesForPdf);
    
    // Crear nombre de archivo único con timestamp
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `buscadis-revista-${categoryId}-${timestamp}.pdf`;
    
    // Guardar PDF en MongoDB GridFS
    const gridFSBucket = new GridFSBucket(db, { bucketName: 'magazines' });
    
    // Crear stream para subir el PDF
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata: {
        contentType: 'application/pdf',
        categoryId: categoryId,
        publicationCount: processedPublications.length,
        createdAt: new Date()
      }
    });
    
    // Subir el buffer
    uploadStream.write(pdfBuffer);
    uploadStream.end();
    
    // Esperar a que finalice la subida
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // Obtener el ID del archivo
    const fileId = uploadStream.id;
    
    // Guardar metadata de la revista por categoría
    const magazinesByCategoryCollection = db.collection('magazines_by_category');
    const magazineRecord = {
      categoryId: categoryId,
      pdfUrl: `/api/magazine/download/${fileId}`,
      filename: filename,
      fileId: fileId,
      publicationCount: processedPublications.length,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    const result = await magazinesByCategoryCollection.insertOne(magazineRecord);
    
    // Cerrar conexión
    await client.close();
    
    return NextResponse.json({
      success: true,
      categoryId: categoryId,
      categoryName: categoryName,
      pdfUrl: `/api/magazine/download/${fileId}`,
      fileId: fileId.toString(),
      publicationCount: processedPublications.length,
      createdAt: new Date(),
      magazineId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('[Magazine API] Error al generar revista por categoría:', error);
    return NextResponse.json(
      { message: 'Error al generar la revista', error: (error as Error).message },
      { status: 500 }
    );
  }
} 