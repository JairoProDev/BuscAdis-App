/**
 * Script para mantener solo los 3 anuncios más antiguos de inmuebles y eliminar el resto
 *
 * Ejecución: node src/scripts/keep-old-inmuebles.js
 * Opciones:
 *   --dry-run: Muestra qué se eliminaría sin realizar cambios reales
 *   --force: Ejecuta sin pedir confirmación (peligroso)
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

/**
 * Función principal para limpiar la base de datos dejando solo los 3 anuncios
 * inmobiliarios más antiguos y eliminar el resto de todas las categorías
 */
async function mantenerSoloInmueblesAntiguos() {
  try {
    console.log("=== SCRIPT DE LIMPIEZA SELECTIVA DE ANUNCIOS ===");
    console.log(`Base de datos: ${dbName}`);
    console.log(`URI de MongoDB: ${uri.substring(0, 25)}...`);
    console.log(
      `Modo: ${
        isDryRun ? "Simulación (no se realizarán cambios)" : "Eliminación real"
      }`
    );

    // Confirmar con el usuario a menos que se use --force
    if (!isForce && !isDryRun) {
      const confirmacion = await preguntarUsuario(
        "\n¡ADVERTENCIA! Esto mantendrá solo los 3 anuncios inmobiliarios más antiguos y eliminará" +
          " TODOS los demás anuncios de todas las categorías.\n" +
          "Esta acción NO SE PUEDE DESHACER.\n" +
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

    // 1. Obtener los 3 anuncios inmobiliarios más antiguos
    const inmuebleCollectionName = CATEGORY_COLLECTIONS["inmuebles"];
    const inmuebleCollection = db.collection(inmuebleCollectionName);

    // Verificar si la colección existe
    const colecciones = await db
      .listCollections({ name: inmuebleCollectionName })
      .toArray();

    if (colecciones.length === 0) {
      console.log(`La colección ${inmuebleCollectionName} no existe.`);
      console.log("No se puede proceder con la operación. Saliendo...");
      rl.close();
      return;
    }

    // Contar documentos actuales
    const conteoActual = await inmuebleCollection.countDocuments();
    console.log(
      `La colección ${inmuebleCollectionName} tiene ${conteoActual} documentos.`
    );

    if (conteoActual === 0) {
      console.log(`La colección ${inmuebleCollectionName} está vacía.`);
      console.log("No se puede proceder con la operación. Saliendo...");
      rl.close();
      return;
    }

    // Obtener los 3 anuncios más antiguos
    console.log("Buscando los 3 anuncios inmobiliarios más antiguos...");
    const anunciosAntiguos = await inmuebleCollection
      .find({})
      .sort({ created_at: 1 })
      .limit(3)
      .toArray();

    if (anunciosAntiguos.length === 0) {
      console.log("No se encontraron anuncios inmobiliarios para preservar.");
      rl.close();
      return;
    }

    console.log(
      `Se preservarán ${anunciosAntiguos.length} anuncios inmobiliarios antiguos:`
    );
    anunciosAntiguos.forEach((anuncio, index) => {
      console.log(
        `${index + 1}. ID: ${anuncio.id || anuncio._id}, Título: ${
          anuncio.title
        }`
      );
    });

    // Guardar IDs de los anuncios a preservar
    const idsAPreservar = anunciosAntiguos.map((anuncio) => anuncio._id);

    // 2. Eliminar todos los demás anuncios inmobiliarios excepto los 3 más antiguos
    if (!isDryRun) {
      const resultadoInmuebles = await inmuebleCollection.deleteMany({
        _id: { $nin: idsAPreservar },
      });
      console.log(
        `Se eliminaron ${resultadoInmuebles.deletedCount} anuncios inmobiliarios, preservando los 3 más antiguos.`
      );
    } else {
      const aEliminarInmuebles = conteoActual - anunciosAntiguos.length;
      console.log(
        `[SIMULACIÓN] Se eliminarían ${aEliminarInmuebles} anuncios inmobiliarios, preservando los 3 más antiguos.`
      );
    }

    // 3. Eliminar todos los anuncios de otras categorías
    for (const [categoria, nombreColeccion] of Object.entries(
      CATEGORY_COLLECTIONS
    )) {
      if (categoria === "inmuebles") continue; // Ya procesamos inmuebles

      console.log(`\nProcesando colección ${nombreColeccion}...`);

      // Verificar si la colección existe
      const colExiste = await db
        .listCollections({ name: nombreColeccion })
        .toArray();

      if (colExiste.length === 0) {
        console.log(`La colección ${nombreColeccion} no existe, saltando.`);
        continue;
      }

      // Contar documentos actuales
      const conteoCat = await db.collection(nombreColeccion).countDocuments();
      console.log(
        `La colección ${nombreColeccion} tiene ${conteoCat} documentos.`
      );

      if (conteoCat === 0) {
        console.log(`La colección ${nombreColeccion} ya está vacía.`);
        continue;
      }

      // Eliminar todos los documentos de esta categoría
      if (!isDryRun) {
        const resultado = await db.collection(nombreColeccion).deleteMany({});
        console.log(
          `Se eliminaron ${resultado.deletedCount} documentos de ${nombreColeccion}.`
        );
      } else {
        console.log(
          `[SIMULACIÓN] Se eliminarían ${conteoCat} documentos de ${nombreColeccion}.`
        );
      }
    }

    console.log("\n=== LIMPIEZA SELECTIVA COMPLETADA ===");
    if (isDryRun) {
      console.log(
        "Nota: Esta fue una simulación. Ningún dato fue eliminado realmente."
      );
      console.log(
        "Para ejecutar una eliminación real, ejecuta el script sin --dry-run."
      );
    } else {
      console.log(
        "Base de datos preparada: Solo quedaron los 3 anuncios inmobiliarios más antiguos."
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
mantenerSoloInmueblesAntiguos();
