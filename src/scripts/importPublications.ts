/**
 * Script para importar adisos desde texto plano
 */
import { parsePublicationsFromText, preparePublicationForAPI, PublicationApiPayload } from '@/utils/publicationParser';
import { PublicationsService, CreatePublicationData } from '@/services/publications.service';

interface ImportError {
  publication: string;
  error: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
}

/**
 * Transforma PublicationApiPayload a CreatePublicationData
 */
function transformToCreatePublicationData(apiData: PublicationApiPayload): CreatePublicationData {
  return {
    title: apiData.title,
    description: apiData.description,
    categorySlug: apiData.category,
    subcategorySlug: apiData.subcategory,
    transactionType: 'venta', // Default value
    value: apiData.price || 0,
    currency: apiData.currency || 'PEN',
    valueType: 'fijo', // Default value
    location: {
      country: 'Peru',
      province: apiData.location?.province || 'Cusco',
      city: 'Cusco', // Default city since it's not in PublicationLocation
      district: apiData.location?.district,
      address: apiData.location?.address
    },
    contact: {
      phones: apiData.contactPhone ? [apiData.contactPhone] : [],
      email: apiData.contactEmail,
      name: apiData.contactName
    },
    images: Array.isArray(apiData.images) ? apiData.images.map((img: unknown) => {
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img !== null && 'url' in img) {
        return (img as { url: string }).url;
      }
      return '';
    }).filter(Boolean) : [],
    status: 'activo',
    premium: false
  };
}

/**
 * Importa adisos desde texto plano a la base de datos
 * @param rawText Texto plano con adisos
 * @returns Resultado de la importación
 */
export async function importPublicationsFromText(rawText: string): Promise<ImportResult> {
  try {
    // Parsear el texto a objetos estructurados
    const publications = parsePublicationsFromText(rawText);
    console.log(`Se encontraron ${publications.length} publicaciones para importar`);
    
    // Resultado de la operación
    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: []
    };
    
    // Importar cada publicación
    for (const publication of publications) {
      try {
        // Preparar datos para la API
        const apiData = preparePublicationForAPI(publication);
        
        // Transformar a CreatePublicationData
        const createData = transformToCreatePublicationData(apiData);
        
        // Enviar a la API
        await PublicationsService.createPublication(createData);
        
        // Incrementar contador de éxito
        result.imported++;
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error al importar publicación:', error);
        result.errors.push({
          publication: publication.title,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Actualizar estado de éxito
    result.success = result.imported > 0;
    
    return result;
  } catch (error) {
    console.error('Error general en la importación:', error);
    return {
      success: false,
      imported: 0,
      errors: [{
        publication: 'General',
        error: error instanceof Error ? error.message : String(error)
      }]
    };
  }
}

/**
 * Función para ejecutar el script desde la consola
 */
async function main() {
  if (typeof process !== 'undefined' && process.argv.length > 2) {
    const filePath = process.argv[2];
    // Leer archivo de texto
    import('fs').then(({ readFileSync }) => {
      const text = readFileSync(filePath, 'utf8');
      
      console.log(`Importando publicaciones desde archivo: ${filePath}`);
      importPublicationsFromText(text).then(result => {
        console.log('Resultado de la importación:');
        console.log(`- Éxito: ${result.success ? 'Sí' : 'No'}`);
        console.log(`- Publicaciones importadas: ${result.imported}`);
        console.log(`- Errores: ${result.errors.length}`);
        
        if (result.errors.length > 0) {
          console.log('Detalles de errores:');
          result.errors.forEach((err: ImportError, i) => {
            console.log(`  ${i+1}. ${err.publication}: ${err.error}`);
          });
        }
      }).catch(error => {
        console.error('Error al leer el archivo o procesar la importación:', error);
      });
    }).catch(error => {
      console.error('Error al importar el módulo "fs":', error);
    });
  } else {
    console.error('Debe proporcionar la ruta al archivo de texto');
    console.log('Uso: ts-node importPublications.ts ruta/al/archivo.txt');
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  main();
}

export default importPublicationsFromText; 