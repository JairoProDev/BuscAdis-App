/**
 * Script de Importación de Publicaciones
 * Este script permite importar publicaciones desde archivos JSON a la base de datos MongoDB.
 * Ideal para cargar datos reales de producción de forma masiva.
 *
 * Ejecución: node src/scripts/import-publications.js [ruta-archivo]
 * Opciones:
 *   --dry-run: Muestra qué se importaría sin realizar cambios reales
 *   --force: Ejecuta sin pedir confirmación
 *   --validate-only: Solo valida el formato del archivo sin importar
 */

const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Parámetros de conexión
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "buscadis";

// Crear cliente MongoDB con mejor manejo de errores
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

// Colecciones por categoría
const CATEGORY_COLLECTIONS = {
  empleos: "publications_empleos",
  inmuebles: "publications_inmuebles",
  vehiculos: "publications_vehiculos",
  servicios: "publications_servicios",
  productos: "publications_productos",
  eventos: "publications_eventos",
  negocios: "publications_negocios",
  comunidad: "publications_comunidad",
};

// Interfaz para leer entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para preguntar al usuario con promesa
function preguntarUsuario(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, (answer) => {
      resolve(answer);
    });
  });
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForce = args.includes("--force");
const validateOnly = args.includes("--validate-only");

// Obtener el archivo a importar
let inputFile = null;
for (const arg of args) {
  if (!arg.startsWith("--") && arg.endsWith(".json")) {
    inputFile = arg;
    break;
  }
}

// Verificar si se proporcionó un archivo
if (!inputFile) {
  console.error(
    "Error: Debes proporcionar la ruta del archivo JSON para importar."
  );
  console.error(
    "Uso: node src/scripts/import-publications.js ruta/a/archivo.json [opciones]"
  );
  console.error("Opciones disponibles:");
  console.error("  --dry-run: Simula la importación sin realizar cambios");
  console.error("  --force: No solicita confirmación");
  console.error("  --validate-only: Solo valida el formato del archivo");
  process.exit(1);
}

/**
 * Valida la estructura de los datos de una publicación
 * @param {Object} publication - Objeto de publicación a validar
 * @returns {Object} - Objeto con resultado y mensaje de error si existe
 */
function validarPublicacion(publication) {
  // Verificar campos requeridos
  const camposRequeridos = ["title", "description", "category", "id"];
  const camposFaltantes = camposRequeridos.filter(
    (campo) => !publication[campo]
  );

  if (camposFaltantes.length > 0) {
    return {
      valido: false,
      error: `Faltan campos requeridos: ${camposFaltantes.join(", ")}`,
    };
  }

  // Verificar que la categoría sea válida
  if (!CATEGORY_COLLECTIONS[publication.category]) {
    return {
      valido: false,
      error: `Categoría inválida: ${
        publication.category
      }. Categorías válidas: ${Object.keys(CATEGORY_COLLECTIONS).join(", ")}`,
    };
  }

  // Validar el precio si existe
  if (publication.price !== undefined) {
    const precio = parseFloat(publication.price);
    if (isNaN(precio) || precio < 0) {
      return {
        valido: false,
        error: `Precio inválido: ${publication.price}`,
      };
    }
  }

  // Validar las imágenes si existen
  if (publication.images && !Array.isArray(publication.images)) {
    return {
      valido: false,
      error: "El campo 'images' debe ser un array",
    };
  }

  // Validar la ubicación si existe
  if (publication.location && typeof publication.location !== "object") {
    return {
      valido: false,
      error: "El campo 'location' debe ser un objeto",
    };
  }

  return { valido: true };
}

/**
 * Prepara la publicación para su inserción, añadiendo campos faltantes
 * @param {Object} publication - Objeto de publicación a preparar
 * @returns {Object} - Publicación preparada para inserción
 */
function prepararPublicacionParaInsercion(publication) {
  const ahora = new Date().toISOString();

  // Añadir campos de fecha si no existen
  return {
    ...publication,
    status: publication.status || "active",
    created_at: publication.created_at || ahora,
    updated_at: publication.updated_at || ahora,
    // Asegurarse de que el ID sea una cadena
    id: String(publication.id),
    // Si no hay imágenes, inicializar como array vacío
    images: publication.images || [],
    // Si no hay subcategoría, usar un valor por defecto
    subcategory: publication.subcategory || "general",
  };
}

/**
 * Función principal para importar publicaciones
 */
async function importarPublicaciones() {
  try {
    console.log("=== SCRIPT DE IMPORTACIÓN DE PUBLICACIONES ===");
    console.log(`Archivo a importar: ${inputFile}`);
    console.log(`Base de datos: ${dbName}`);
    console.log(`URI de MongoDB: ${uri.substring(0, 25)}...`);
    console.log(
      `Modo: ${
        validateOnly
          ? "Solo validación"
          : isDryRun
          ? "Simulación (no se realizarán cambios)"
          : "Importación real"
      }`
    );

    // Leer el archivo JSON
    try {
      console.log("\nLeyendo archivo JSON...");
      const contenidoArchivo = fs.readFileSync(inputFile, "utf8");
      const datos = JSON.parse(contenidoArchivo);

      // Validar la estructura del JSON
      if (!Array.isArray(datos)) {
        console.error(
          "Error: El archivo JSON debe contener un array de publicaciones."
        );
        return;
      }

      console.log(
        `El archivo contiene ${datos.length} publicaciones para revisar.`
      );

      // Agrupar por categoría
      const publicacionesPorCategoria = {};
      const publicacionesInvalidas = [];

      // Validar cada publicación y agruparlas
      for (let i = 0; i < datos.length; i++) {
        const publicacion = datos[i];
        const resultado = validarPublicacion(publicacion);

        if (resultado.valido) {
          const categoria = publicacion.category;
          if (!publicacionesPorCategoria[categoria]) {
            publicacionesPorCategoria[categoria] = [];
          }
          publicacionesPorCategoria[categoria].push(
            prepararPublicacionParaInsercion(publicacion)
          );
        } else {
          publicacionesInvalidas.push({
            indice: i,
            publicacion,
            error: resultado.error,
          });
        }
      }

      // Mostrar resumen de validación
      console.log("\n=== RESUMEN DE VALIDACIÓN ===");
      let totalValidas = 0;
      Object.entries(publicacionesPorCategoria).forEach(([categoria, pubs]) => {
        console.log(`- ${categoria}: ${pubs.length} publicaciones válidas`);
        totalValidas += pubs.length;
      });
      console.log(`- Publicaciones válidas: ${totalValidas}`);
      console.log(
        `- Publicaciones inválidas: ${publicacionesInvalidas.length}`
      );

      // Mostrar detalles de las publicaciones inválidas
      if (publicacionesInvalidas.length > 0) {
        console.log("\n=== DETALLE DE PUBLICACIONES INVÁLIDAS ===");
        publicacionesInvalidas.forEach(({ indice, publicacion, error }) => {
          console.log(`\nPublicación #${indice + 1}:`);
          console.log(`  ID: ${publicacion.id || "No especificado"}`);
          console.log(`  Título: ${publicacion.title || "No especificado"}`);
          console.log(`  Error: ${error}`);
        });
      }

      // Si es solo validación, terminamos aquí
      if (validateOnly) {
        console.log(
          "\nValidación completada. No se realizó ninguna importación."
        );
        return;
      }

      // Si no hay publicaciones válidas, no seguimos
      if (totalValidas === 0) {
        console.log(
          "\nNo hay publicaciones válidas para importar. Corrige los errores e intenta nuevamente."
        );
        return;
      }

      // Confirmar con el usuario a menos que se use --force
      if (!isForce && !isDryRun) {
        const confirmacion = await preguntarUsuario(
          `\n¿Deseas importar ${totalValidas} publicaciones a la base de datos? (escribe 'SI' para confirmar): `
        );

        if (confirmacion.toUpperCase() !== "SI") {
          console.log("Importación cancelada por el usuario.");
          return;
        }
      }

      // Si es dry-run, solo mostramos lo que se haría
      if (isDryRun) {
        console.log("\n=== SIMULACIÓN DE IMPORTACIÓN ===");
        Object.entries(publicacionesPorCategoria).forEach(
          ([categoria, pubs]) => {
            console.log(
              `Se importarían ${pubs.length} publicaciones a la colección ${CATEGORY_COLLECTIONS[categoria]}`
            );
          }
        );
        console.log(
          "\nSimulación completada. Ningún dato fue importado realmente."
        );
        return;
      }

      // Conectar a MongoDB y realizar la importación
      console.log("\nConectando a MongoDB...");
      await client.connect();
      console.log("Conexión a MongoDB establecida correctamente");

      const db = client.db(dbName);

      // Importar las publicaciones por categoría
      for (const [categoria, publicaciones] of Object.entries(
        publicacionesPorCategoria
      )) {
        const coleccion = CATEGORY_COLLECTIONS[categoria];
        console.log(
          `\nImportando ${publicaciones.length} publicaciones a ${coleccion}...`
        );

        // Verificar si la colección existe
        const colecciones = await db
          .listCollections({ name: coleccion })
          .toArray();
        if (colecciones.length === 0) {
          console.log(`La colección ${coleccion} no existe, creándola...`);
          await db.createCollection(coleccion);
        }

        // Importar las publicaciones en lotes de 100
        const tamanoLote = 100;
        for (let i = 0; i < publicaciones.length; i += tamanoLote) {
          const lote = publicaciones.slice(i, i + tamanoLote);
          const resultado = await db.collection(coleccion).insertMany(lote);
          console.log(
            `- Lote ${Math.ceil((i + 1) / tamanoLote)}: ${
              resultado.insertedCount
            } publicaciones insertadas`
          );
        }
      }

      console.log("\n=== IMPORTACIÓN COMPLETADA ===");
      console.log(`Se importaron ${totalValidas} publicaciones correctamente.`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error(`Error: El archivo ${inputFile} no existe.`);
      } else if (error instanceof SyntaxError) {
        console.error("Error: El archivo JSON tiene un formato incorrecto.");
      } else {
        console.error("Error al leer el archivo:", error);
      }
    }
  } catch (error) {
    console.error("Error durante la ejecución del script:", error);
  } finally {
    // Cerrar la conexión de MongoDB y la interfaz de línea de comandos
    if (client) {
      await client.close();
      console.log("Conexión a MongoDB cerrada.");
    }
    rl.close();
  }
}

// Ejecutar la función principal
importarPublicaciones();
