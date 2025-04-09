/**
 * Script de Importación de Nuevos Anuncios
 * Este script permite importar anuncios desde el archivo 'nuevos-anuncios.json'
 * a la base de datos MongoDB.
 *
 * Ejecución: node src/scripts/importar-nuevos-anuncios.js
 * Opciones:
 *   --dry-run: Muestra qué se importaría sin realizar cambios reales
 *   --force: Ejecuta sin pedir confirmación
 */

const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const crypto = require("crypto");

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

// Ruta al archivo JSON
const inputFile = path.resolve(
  process.cwd(),
  "src/scripts/nuevos-anuncios.json"
);

/**
 * Genera un ID único para una publicación
 * @param {string} prefix - Prefijo para el ID (ej: inmueble, vehiculo)
 * @returns {string} - ID único
 */
function generarIdUnico(prefix) {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Genera un ID corto para una publicación
 * @param {string} categoria - Categoría de la publicación
 * @returns {string} - ID corto
 */
function generarIdCorto(categoria) {
  // Generar un número aleatorio entre 1000 y 9999 para simular un contador
  const contador = Math.floor(1000 + Math.random() * 9000);
  return contador.toString();
}

/**
 * Genera un slug amigable para URLs a partir de un título
 * @param {string} titulo - Título de la publicación
 * @returns {string} - Slug para URL
 */
function generarSlug(titulo) {
  return titulo
    .toLowerCase()
    .replace(/[^\w\sáéíóúüñ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80); // Limitar longitud del slug
}

/**
 * Prepara la publicación para su inserción, añadiendo campos faltantes
 * y normalizando la estructura
 * @param {Object} publication - Objeto de publicación a preparar
 * @returns {Object} - Publicación preparada para inserción
 */
function prepararPublicacionParaInsercion(publication) {
  const ahora = new Date().toISOString();
  const categoria = publication.category;

  // Generar ID corto y slug para URL
  const idCorto = generarIdCorto(categoria);
  const slug = generarSlug(publication.title);

  // Construir la URL amigable con formato: /categoria/subcategoria/subsubcategoria/id-slug
  const subcategoria = publication.subcategory || "general";
  const subsubcategoria = publication.subsubcategory || "";

  let urlPath = `/${categoria}/${subcategoria}`;
  if (subsubcategoria) {
    urlPath += `/${subsubcategoria}`;
  }
  urlPath += `/${idCorto}-${slug}`;

  // Si no tiene ID o queremos reemplazarlo con nuestro nuevo formato
  if (!publication.id || publication.id.includes("_")) {
    publication.id = idCorto;
  }

  // Añadir campos estándar
  const publicacionPreparada = {
    ...publication,
    status: publication.status || "active",
    created_at: publication.created_at || ahora,
    updated_at: publication.updated_at || ahora,
    id: String(publication.id),
    id_corto: idCorto,
    slug: slug,
    url_path: urlPath,
    subcategory: subcategoria,
    subsubcategory: subsubcategoria || undefined,
    images: publication.images || [],
    user_id: publication.user_id || "admin", // Usuario por defecto para publicaciones importadas
  };

  // Normalizar contacto
  if (!publicacionPreparada.contact) {
    publicacionPreparada.contact = {
      name: publication.contactName || "Anunciante",
      email: publication.contactEmail || "",
      phone: publication.contactPhone || "",
      whatsapp: publication.contact?.whatsapp || "",
    };
  }

  // Normalizar precio según categoría
  if (categoria === "empleos" && !publicacionPreparada.price) {
    publicacionPreparada.price = 0;
  }

  // Asegurarse de que features existe
  if (!publicacionPreparada.features && publication.features) {
    publicacionPreparada.features = publication.features;
  } else if (!publicacionPreparada.features) {
    publicacionPreparada.features = {};
  }

  // Normalizar moneda
  if (!publicacionPreparada.currency) {
    publicacionPreparada.currency = "PEN";
  }

  // Normalizar valores según categoría específica
  switch (categoria) {
    case "inmuebles":
      if (
        publicacionPreparada.features &&
        !publicacionPreparada.features.operation_type
      ) {
        publicacionPreparada.features.operation_type = "alquiler";
      }
      break;
    case "vehiculos":
      if (
        publicacionPreparada.features &&
        !publicacionPreparada.features.condition
      ) {
        publicacionPreparada.features.condition = "used";
      }
      break;
    case "productos":
      if (
        publicacionPreparada.features &&
        !publicacionPreparada.features.condition
      ) {
        publicacionPreparada.features.condition = "used";
      }
      break;
  }

  return publicacionPreparada;
}

/**
 * Función principal para importar publicaciones
 */
async function importarNuevosAnuncios() {
  try {
    console.log("=== SCRIPT DE IMPORTACIÓN DE NUEVOS ANUNCIOS ===");
    console.log(`Archivo a importar: ${inputFile}`);
    console.log(`Base de datos: ${dbName}`);
    console.log(`URI de MongoDB: ${uri.substring(0, 25)}...`);
    console.log(
      `Modo: ${
        isDryRun ? "Simulación (no se realizarán cambios)" : "Importación real"
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

      // Procesar cada publicación
      for (let i = 0; i < datos.length; i++) {
        const publicacion = datos[i];

        if (publicacion.category) {
          const categoria = publicacion.category;
          if (!publicacionesPorCategoria[categoria]) {
            publicacionesPorCategoria[categoria] = [];
          }

          // Preparar la publicación para su inserción
          const publicacionPreparada =
            prepararPublicacionParaInsercion(publicacion);
          publicacionesPorCategoria[categoria].push(publicacionPreparada);
        } else {
          console.error(
            `Error: La publicación #${i + 1} no tiene categoría definida.`
          );
        }
      }

      // Mostrar resumen de validación
      console.log("\n=== RESUMEN DE IMPORTACIÓN ===");
      let totalValidas = 0;
      Object.entries(publicacionesPorCategoria).forEach(([categoria, pubs]) => {
        console.log(`- ${categoria}: ${pubs.length} publicaciones válidas`);
        totalValidas += pubs.length;
      });

      // Si no hay publicaciones válidas, no hay nada que hacer
      if (totalValidas === 0) {
        console.log("\nNo hay publicaciones válidas para importar.");
        return;
      }

      // Confirmar importación
      if (!isForce) {
        const respuesta = await preguntarUsuario(
          `\n¿Deseas ${
            isDryRun ? "simular la importación" : "importar"
          } de ${totalValidas} publicaciones? (s/N): `
        );
        if (respuesta.toLowerCase() !== "s") {
          console.log("Operación cancelada por el usuario.");
          return;
        }
      }

      // Conectar a la base de datos
      if (!isDryRun) {
        await client.connect();
        console.log("\nConexión a la base de datos establecida.");
        const db = client.db(dbName);

        // Importar cada categoría
        for (const [categoria, publicaciones] of Object.entries(
          publicacionesPorCategoria
        )) {
          const nombreColeccion = CATEGORY_COLLECTIONS[categoria];
          const coleccion = db.collection(nombreColeccion);

          console.log(
            `\nImportando ${publicaciones.length} publicaciones a la colección ${nombreColeccion}...`
          );

          // Importar en bloques para no saturar la base de datos
          const TAMANO_BLOQUE = 5;
          for (let i = 0; i < publicaciones.length; i += TAMANO_BLOQUE) {
            const bloque = publicaciones.slice(i, i + TAMANO_BLOQUE);

            // Insertar publicaciones
            const resultado = await coleccion.insertMany(bloque);
            console.log(
              `Importados ${resultado.insertedCount} anuncios (bloque ${
                Math.floor(i / TAMANO_BLOQUE) + 1
              })`
            );
          }
        }

        console.log("\n=== IMPORTACIÓN COMPLETADA ===");
        console.log(
          `Se importaron ${totalValidas} publicaciones a la base de datos.`
        );
      } else {
        // Modo simulación
        console.log("\n=== SIMULACIÓN DE IMPORTACIÓN ===");
        console.log(
          `Se simularía la importación de ${totalValidas} publicaciones.`
        );

        // Mostrar ejemplo de lo que se importaría
        console.log("\nEjemplo de publicación preparada para importación:");
        const categoriaEjemplo = Object.keys(publicacionesPorCategoria)[0];
        if (categoriaEjemplo) {
          console.log(
            JSON.stringify(
              publicacionesPorCategoria[categoriaEjemplo][0],
              null,
              2
            )
          );
        }
      }
    } catch (error) {
      console.error(
        `\nError al leer o procesar el archivo JSON: ${error.message}`
      );
      if (error.stack) console.error(error.stack);
    }
  } catch (error) {
    console.error(`\nError general: ${error.message}`);
    if (error.stack) console.error(error.stack);
  } finally {
    // Cerrar recursos
    rl.close();
    if (client && client.topology && client.topology.isConnected()) {
      await client.close();
      console.log("\nConexión a la base de datos cerrada.");
    }
  }
}

// Ejecutar la función principal
importarNuevosAnuncios().catch((error) => {
  console.error(`\nError fatal: ${error.message}`);
  if (error.stack) console.error(error.stack);
  process.exit(1);
});
