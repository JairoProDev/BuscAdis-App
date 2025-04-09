/**
 * Script para subir publicaciones con imágenes usando Cloudinary
 *
 * Este script permite subir una publicación completa incluyendo imágenes a Cloudinary
 * y guardar la publicación en la base de datos MongoDB.
 *
 * Uso:
 * node src/scripts/upload-publication-with-images.js ruta/a/datos.json ruta/a/imagenes/
 */

const { MongoClient, ServerApiVersion } = require("mongodb");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "buscadis";

const client = new MongoClient(mongoUri, {
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

/**
 * Sube una imagen a Cloudinary
 * @param {string} imagePath - Ruta de la imagen a subir
 * @param {string} folder - Carpeta en Cloudinary donde guardar la imagen
 * @returns {Promise<Object>} - Resultado de la carga
 */
async function uploadImageToCloudinary(imagePath, folder = "buscadis") {
  return new Promise((resolve, reject) => {
    console.log(`Subiendo imagen: ${imagePath}`);

    cloudinary.uploader.upload(
      imagePath,
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error(`Error al subir imagen ${imagePath}:`, error);
          reject(error);
        } else {
          console.log(`Imagen subida exitosamente: ${result.public_id}`);
          resolve(result);
        }
      }
    );
  });
}

/**
 * Procesa todas las imágenes para una publicación
 * @param {Array<string>} imagePaths - Rutas de las imágenes a procesar
 * @param {string} category - Categoría de la publicación
 * @returns {Promise<Array<Object>>} - Array con los resultados de las cargas
 */
async function processImages(imagePaths, category) {
  const folder = `buscadis/${category}`;
  const results = [];

  for (const imagePath of imagePaths) {
    try {
      const result = await uploadImageToCloudinary(imagePath, folder);
      results.push({
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    } catch (error) {
      console.error(`Error procesando imagen ${imagePath}:`, error);
    }
  }

  return results;
}

/**
 * Encuentra las imágenes correspondientes a una publicación
 * @param {string} directoryPath - Ruta del directorio de imágenes
 * @param {string} publicationId - ID de la publicación
 * @returns {Array<string>} - Rutas completas de las imágenes
 */
function findImagesForPublication(directoryPath, publicationId) {
  if (!fs.existsSync(directoryPath)) {
    console.error(`El directorio ${directoryPath} no existe`);
    return [];
  }

  // Buscar imágenes que comiencen con el ID de la publicación
  const files = fs.readdirSync(directoryPath);
  const imageFiles = files.filter((file) => {
    // Aceptar solo archivos de imagen que correspondan a la publicación
    const isImage = /\.(jpe?g|png|webp)$/i.test(file);
    const belongsToPublication = file.startsWith(publicationId);
    return isImage && belongsToPublication;
  });

  return imageFiles.map((file) => path.join(directoryPath, file));
}

/**
 * Sube una publicación completa con sus imágenes
 * @param {Object} publication - Datos de la publicación
 * @param {string} imagesDir - Directorio de imágenes
 * @returns {Promise<Object>} - Publicación con las imágenes procesadas
 */
async function uploadPublication(publication, imagesDir) {
  if (!publication.id || !publication.category) {
    throw new Error("La publicación debe tener un ID y una categoría");
  }

  // Verificar que la categoría es válida
  if (!CATEGORY_COLLECTIONS[publication.category]) {
    throw new Error(`Categoría inválida: ${publication.category}`);
  }

  console.log(
    `\nProcesando publicación: ${publication.id} - ${publication.title}`
  );

  // Encontrar imágenes para esta publicación
  const imagePaths = findImagesForPublication(imagesDir, publication.id);
  console.log(
    `Encontradas ${imagePaths.length} imágenes para la publicación ${publication.id}`
  );

  // Procesar imágenes
  const processedImages = await processImages(imagePaths, publication.category);

  // Crear la publicación completa
  const completePublication = {
    ...publication,
    images: processedImages,
    status: publication.status || "active",
    created_at: publication.created_at || new Date().toISOString(),
    updated_at: publication.updated_at || new Date().toISOString(),
  };

  return completePublication;
}

/**
 * Función principal del script
 */
async function main() {
  // Verificar argumentos
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Uso: node upload-publication-with-images.js <archivo-datos.json> <directorio-imagenes>"
    );
    process.exit(1);
  }

  const dataFile = args[0];
  const imagesDir = args[1];

  // Verificar que el archivo de datos existe
  if (!fs.existsSync(dataFile)) {
    console.error(`El archivo ${dataFile} no existe`);
    process.exit(1);
  }

  // Verificar que el directorio de imágenes existe
  if (!fs.existsSync(imagesDir)) {
    console.error(`El directorio ${imagesDir} no existe`);
    process.exit(1);
  }

  try {
    // Leer el archivo JSON
    console.log(`Leyendo datos de ${dataFile}...`);
    const rawData = fs.readFileSync(dataFile, "utf8");
    const publications = JSON.parse(rawData);

    if (!Array.isArray(publications)) {
      console.error("El archivo debe contener un array de publicaciones");
      process.exit(1);
    }

    console.log(`Leídas ${publications.length} publicaciones del archivo`);

    // Conectar a MongoDB
    console.log("Conectando a MongoDB...");
    await client.connect();
    console.log("Conexión a MongoDB establecida");

    const db = client.db(dbName);

    // Procesar cada publicación
    for (const publication of publications) {
      try {
        // Subir publicación con imágenes
        const completePublication = await uploadPublication(
          publication,
          imagesDir
        );

        // Guardar en la base de datos
        const collectionName = CATEGORY_COLLECTIONS[publication.category];
        console.log(`Guardando publicación en colección: ${collectionName}`);

        const result = await db
          .collection(collectionName)
          .insertOne(completePublication);
        console.log(
          `Publicación guardada con éxito. ID MongoDB: ${result.insertedId}`
        );
      } catch (error) {
        console.error(`Error procesando publicación ${publication.id}:`, error);
      }
    }

    console.log("\nProceso completado. Resumen:");
    console.log(`Total de publicaciones procesadas: ${publications.length}`);
  } catch (error) {
    console.error("Error en el proceso de carga:", error);
  } finally {
    // Cerrar la conexión a MongoDB
    await client.close();
    console.log("Conexión a MongoDB cerrada");
  }
}

// Ejecutar el script
main().catch(console.error);
