/**
 * Script de Importación de Anuncios de Revista
 * Este script permite importar anuncios desde archivos JSON a la base de datos MongoDB.
 * Especialmente diseñado para importar anuncios escaneados de revistas físicas.
 *
 * Ejecución: node src/scripts/import-anuncios-revista.js [ruta-archivo]
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
    "Uso: node src/scripts/import-anuncios-revista.js ruta/a/archivo.json [opciones]"
  );
  console.error("Opciones disponibles:");
  console.error("  --dry-run: Simula la importación sin realizar cambios");
  console.error("  --force: No solicita confirmación");
  console.error("  --validate-only: Solo valida el formato del archivo");
  process.exit(1);
}

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
 * Usa un contador incremental simple
 * @param {string} categoria - Categoría de la publicación
 * @returns {string} - ID corto
 */
function generarIdCorto(categoria) {
  // En un entorno real, estos contadores deberían persistirse en la base de datos
  // y recuperarse al inicio del script. Para este ejemplo simulamos contadores
  // Idealmente, se implementaría una secuencia en MongoDB o un contador por categoría

  // Generar un número aleatorio entre 1000 y 9999 para simular un contador
  // En producción, esto se reemplazaría por un contador real
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
 * Valida la estructura de los datos de una publicación
 * @param {Object} publication - Objeto de publicación a validar
 * @returns {Object} - Objeto con resultado y mensaje de error si existe
 */
function validarPublicacion(publication) {
  // Verificar campos requeridos
  const camposRequeridos = ["title", "description", "category"];
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

  // Validar ubicación: debe existir al menos ciudad o distrito
  if (
    !publication.location ||
    (!publication.location.city && !publication.location.district)
  ) {
    return {
      valido: false,
      error: "Debe especificar al menos la ciudad o distrito en la ubicación",
    };
  }

  // Validar contacto: debe existir al menos un método de contacto
  if (!publication.contactPhone && !publication.contactEmail) {
    return {
      valido: false,
      error:
        "Debe proporcionar al menos un método de contacto (teléfono o email)",
    };
  }

  return { valido: true };
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
        publicacionPreparada.features.operation_type = "sale";
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
async function importarAnunciosRevista() {
  try {
    console.log("=== SCRIPT DE IMPORTACIÓN DE ANUNCIOS DE REVISTA ===");
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

      // Mostrar detalles de publicaciones inválidas
      if (publicacionesInvalidas.length > 0) {
        console.log("\n=== PUBLICACIONES INVÁLIDAS ===");
        publicacionesInvalidas.forEach(({ indice, publicacion, error }) => {
          console.log(`\n[Índice ${indice}] Error: ${error}`);
          console.log(
            `Título: ${publicacion.title || "Sin título"}, Categoría: ${
              publicacion.category || "Sin categoría"
            }`
          );
        });
      }

      // Si solo validamos, terminamos aquí
      if (validateOnly) {
        console.log(
          "\nValidación completada. No se realizaron cambios en la base de datos."
        );
        return;
      }

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
          const TAMANO_BLOQUE = 10;
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
importarAnunciosRevista().catch((error) => {
  console.error(`\nError fatal: ${error.message}`);
  if (error.stack) console.error(error.stack);
  process.exit(1);
});
