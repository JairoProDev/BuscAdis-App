import React from 'react';
import { Publication } from '@/types/publications';
import { MongoDbDocument, mongoDbQuery } from '@/lib/mongodb-server';
import { Document, Page, Text, View, StyleSheet, renderToStream, PDFViewer } from '@react-pdf/renderer';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { MagazineError } from './errors';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
    color: '#2196f3',
  },
  publicationCard: {
    marginBottom: 15,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: '#eaeaea',
  },
  publicationTitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333333',
  },
  publicationDetails: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  publicationPrice: {
    fontSize: 13,
    color: '#4caf50',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999999',
    fontSize: 10,
  },
});

/**
 * Genera un documento PDF con las publicaciones de una categoría específica
 */
export async function generateCategoryMagazine(categoryId: string): Promise<{ fileId: string; pdfUrl: string }> {
  try {
    // Obtener publicaciones de la categoría
    const publications = await mongoDbQuery(
      `publications_${categoryId}`,
      { status: 'active' },
      { sort: { createdAt: -1 }, limit: 50 }
    ) as Publication[];

    if (!publications.length) {
      throw new MagazineError('No publications found for this category', 'NO_PUBLICATIONS', 404);
    }

    // Create PDF document definition
    const documentData = {
      author: 'BuscaDis',
      title: `Revista Digital - ${getCategoryName(categoryId)}`,
      creator: 'BuscaDis Magazine Generator',
    };

    const MagazinePDF = () => {
      const documentProps = {
        author: 'BuscaDis',
        title: `Revista Digital - ${getCategoryName(categoryId)}`,
        creator: 'BuscaDis Magazine Generator'
      };

      const publicationElements = publications.map((pub, index) => 
        React.createElement(View, { style: styles.publicationCard, key: `pub-${index}` },
          React.createElement(Text, { style: styles.publicationTitle }, pub.title),
          React.createElement(Text, { style: styles.publicationDetails }, pub.description),
          React.createElement(Text, { style: styles.publicationPrice }, 
            pub.price ? `Precio: ${formatPrice(pub.price)}` : 'Precio a consultar'
          ),
          React.createElement(Text, { style: styles.publicationDetails }, 
            `Ubicación: ${pub.location?.address || 'No especificada'}`
          )
        )
      );

      return React.createElement(Document, documentProps,
        React.createElement(Page, { size: 'A4', style: styles.page },
          React.createElement(View, { style: styles.section },
            React.createElement(Text, { style: styles.title }, 
              `Revista Digital - ${getCategoryName(categoryId)}`
            ),
            ...publicationElements
          ),
          React.createElement(Text, { style: styles.footer },
            `Generado por BuscaDis - ${new Date().toLocaleDateString()}`
          )
        )
      );
    };

    // Generate the PDF
    const timestamp = Date.now();
    const filename = `magazine_${categoryId}_${timestamp}.pdf`;
    const pdfPath = join(process.cwd(), 'temp', filename);
    
    // Create a write stream and pipe the PDF document to it
    const stream = await renderToStream(React.createElement(MagazinePDF));
    const chunks: Buffer[] = [];
    
    // Collect all chunks
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Wait for the stream to finish and combine all chunks
    await new Promise<void>((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    
    const pdfBuffer = Buffer.concat(chunks);
    await writeFile(pdfPath, pdfBuffer);

    // Save reference in database
    const magazineData: MongoDbDocument = {
      categoryId,
      pdfUrl: `/api/magazine/download/${filename}`,
      fileId: filename,
      publicationCount: publications.length,
      createdAt: new Date(),
      filename
    };

    // Insert into database
    await mongoDbQuery('magazines', magazineData);

    return {
      fileId: filename,
      pdfUrl: `/api/magazine/download/${filename}`
    };
  } catch (error) {
    console.error('[Magazine Service] Error generating category magazine:', error);
    throw error;
  }
}

/**
 * Obtiene el nombre de la categoría a partir de su ID
 */
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    inmuebles: 'Inmuebles',
    vehiculos: 'Vehículos',
    empleos: 'Empleos',
    servicios: 'Servicios',
    productos: 'Productos',
    eventos: 'Eventos',
    negocios: 'Negocios',
    comunidad: 'Comunidad'
  };
  
  return categories[categoryId] || categoryId;
}

/**
 * Formatea el precio para mostrar
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(price);
}