/**
 * Clean Database Script
 * Este script elimina todos los datos de publicaciones falsas de la base de datos MongoDB.
 * Útil para limpiar el ambiente antes de cargar datos reales para producción.
 *
 * Ejecución: node src/scripts/clean-database.js
 * Opciones:
 *   --dry-run: Muestra qué se eliminaría sin realizar cambios reales
 *   --force: Ejecuta sin pedir confirmación (peligroso)
 *   --category=nombre: Limpia solo la categoría especificada
 */

const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");
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
let targetCategory = null;

// Verificar si hay un argumento de categoría específica
args.forEach((arg) => {
  if (arg.startsWith("--category=")) {
    targetCategory = arg.split("=")[1];
    if (!CATEGORY_COLLECTIONS[targetCategory]) {
      console.error(`Error: La categoría "${targetCategory}" no existe.`);
      console.error(
        `Categorías válidas: ${Object.keys(CATEGORY_COLLECTIONS).join(", ")}`
      );
      process.exit(1);
    }
  }
});

/**
 * Función principal para limpiar la base de datos
 * Elimina todas las publicaciones de las colecciones especificadas
 */
async function limpiarBaseDeDatos() {
  try {
    console.log("=== SCRIPT DE LIMPIEZA DE BASE DE DATOS ===");
    console.log(`Base de datos: ${dbName}`);
    console.log(`URI de MongoDB: ${uri.substring(0, 25)}...`);
    console.log(
      `Modo: ${
        isDryRun ? "Simulación (no se realizarán cambios)" : "Eliminación real"
      }`
    );

    if (targetCategory) {
      console.log(`Categoría objetivo: ${targetCategory}`);
    } else {
      console.log("Categorías a limpiar: Todas");
    }

    // Confirmar con el usuario a menos que se use --force
    if (!isForce && !isDryRun) {
      const confirmacion = await preguntarUsuario(
        "\n¡ADVERTENCIA! Esto eliminará TODAS las publicaciones" +
          (targetCategory ? ` de la categoría ${targetCategory}` : "") +
          ".\nEsta acción NO SE PUEDE DESHACER.\n" +
          "¿Estás seguro que deseas continuar? (escribe 'SI' para confirmar): "
      );

      if (confirmacion.toUpperCase() !== "SI") {
        console.log("Operación cancelada por el usuario.");
        rl.close();
        return;
      }
    }

    // Conectar a MongoDB
    console.log("\nConectando a MongoDB...");
    await client.connect();
    console.log("Conexión a MongoDB establecida correctamente");

    const db = client.db(dbName);

    // Determinar qué colecciones limpiar
    const coleccionesALimpiar = targetCategory
      ? { [targetCategory]: CATEGORY_COLLECTIONS[targetCategory] }
      : CATEGORY_COLLECTIONS;

    // Limpiar cada colección
    for (const [categoria, nombreColeccion] of Object.entries(
      coleccionesALimpiar
    )) {
      console.log(`\nProcesando colección ${nombreColeccion}...`);

      // Verificar si la colección existe
      const colecciones = await db
        .listCollections({ name: nombreColeccion })
        .toArray();

      if (colecciones.length === 0) {
        console.log(`La colección ${nombreColeccion} no existe, saltando.`);
        continue;
      }

      // Contar documentos actuales
      const conteoActual = await db
        .collection(nombreColeccion)
        .countDocuments();
      console.log(
        `La colección ${nombreColeccion} tiene ${conteoActual} documentos.`
      );

      if (conteoActual === 0) {
        console.log(`La colección ${nombreColeccion} ya está vacía.`);
        continue;
      }

      // Eliminar todos los documentos
      if (!isDryRun) {
        const resultado = await db.collection(nombreColeccion).deleteMany({});
        console.log(
          `Se eliminaron ${resultado.deletedCount} documentos de ${nombreColeccion}.`
        );
      } else {
        console.log(
          `[SIMULACIÓN] Se eliminarían ${conteoActual} documentos de ${nombreColeccion}.`
        );
      }
    }

    console.log("\n=== LIMPIEZA COMPLETADA ===");
    if (isDryRun) {
      console.log(
        "Nota: Esta fue una simulación. Ningún dato fue eliminado realmente."
      );
      console.log(
        "Para ejecutar una eliminación real, ejecuta el script sin --dry-run."
      );
    }
  } catch (error) {
    console.error("Error durante la ejecución del script:", error);
  } finally {
    // Cerrar la conexión de MongoDB y la interfaz de línea de comandos
    await client.close();
    rl.close();
    console.log("Conexión a MongoDB cerrada.");
  }
}

// Ejecutar la función principal
limpiarBaseDeDatos();
