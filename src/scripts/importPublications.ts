/**
 * Script para importar anuncios desde texto plano
 */
import { parsePublicationsFromText, preparePublicationForAPI } from '@/utils/publicationParser';
import { PublicationsService } from '@/services/publications.service';

/**
 * Importa anuncios desde texto plano a la base de datos
 * @param rawText Texto plano con anuncios
 * @returns Resultado de la importación
 */
export async function importPublicationsFromText(rawText: string): Promise<{
  success: boolean;
  imported: number;
  errors: any[];
}> {
  try {
    // Parsear el texto a objetos estructurados
    const publications = parsePublicationsFromText(rawText);
    console.log(`Se encontraron ${publications.length} publicaciones para importar`);
    
    // Resultado de la operación
    const result = {
      success: true,
      imported: 0,
      errors: [] as any[]
    };
    
    // Importar cada publicación
    for (const publication of publications) {
      try {
        // Preparar datos para la API
        const apiData = preparePublicationForAPI(publication);
        
        // Enviar a la API
        await PublicationsService.createPublication(apiData);
        
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
      errors: [error instanceof Error ? error.message : String(error)]
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
          result.errors.forEach((err, i) => {
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