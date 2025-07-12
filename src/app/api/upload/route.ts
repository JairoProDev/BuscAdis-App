import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con las credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Subir un archivo a Cloudinary
 * @param buffer Buffer del archivo
 * @param options Opciones de carga
 * @returns Promesa con el resultado de la carga
 */
async function uploadToCloudinary(buffer: Buffer, options: Record<string, unknown> = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'buscadis',
      ...options
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error('Error en Cloudinary upload:', error);
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
}

/**
 * Endpoint para subir imágenes a Cloudinary
 */
export async function POST(request: Request) {
  try {
    console.log('Procesando solicitud de carga de imagen');
    const formData = await request.formData();
    
    // Verificar si se está enviando una sola imagen o múltiples
    const file = formData.get('file') as File;
    const files = formData.getAll('files') as File[];
    
    if (!file && (!files || files.length === 0)) {
      console.error('No se proporcionó ningún archivo');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Opciones de carga
    const folder = formData.get('folder') as string || 'buscadis';
    const tags = formData.get('tags') as string || '';
    const publicId = formData.get('public_id') as string || undefined;
    
    const uploadOptions = {
      folder,
      tags: tags ? tags.split(',') : undefined,
      public_id: publicId
    };
    
    // Si es una sola imagen
    if (file) {
      // Convertir el archivo a un buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        console.log(`Subiendo archivo: ${file.name}, tamaño: ${buffer.length} bytes`);
        const result = await uploadToCloudinary(buffer, uploadOptions);
        return NextResponse.json(result);
      } catch (uploadError) {
        console.error('Error al subir archivo a Cloudinary:', uploadError);
        return NextResponse.json(
          { error: 'Error uploading to Cloudinary' },
          { status: 500 }
        );
      }
    } 
    // Si son múltiples imágenes
    else if (files && files.length > 0) {
      const results = [];
      
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        try {
          console.log(`Subiendo archivo: ${file.name}, tamaño: ${buffer.length} bytes`);
          const result = await uploadToCloudinary(buffer, uploadOptions);
          results.push(result);
        } catch (uploadError) {
          console.error(`Error al subir archivo ${file.name}:`, uploadError);
          // Continuamos con las siguientes imágenes aunque haya un error
        }
      }
      
      if (results.length === 0) {
        return NextResponse.json(
          { error: 'Failed to upload all files' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Error general en el endpoint de carga:', error);
    return NextResponse.json(
      { error: 'Error processing upload request' },
      { status: 500 }
    );
  }
}
