const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// --- Configuración ---
// Lee la URI de MongoDB desde una variable de entorno
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "buscadis"; // Nombre de la BD (default: buscadis)
const dataFolderPath = path.join(__dirname, "data-to-upload");
const counterCollectionName = "counters";
const counterId = "publicationCounter"; // ID del documento contador

// Mapeo de categorySlug a nombre de colección
const categoryCollectionMap = {
  inmuebles: "publications_inmuebles",
  vehiculos: "publications_vehiculos",
  empleos: "publications_empleos",
  servicios: "publications_servicios",
  productos: "publications_productos",
  negocios: "publications_negocios",
  eventos: "publications_eventos",
  comunidad: "publications_comunidad",
  // Añade más categorías según sea necesario
};

// --- Funciones Auxiliares ---

// Obtiene el siguiente ID secuencial
async function getNextSequenceValue(db, sequenceName) {
  const sequenceDocument = await db
    .collection(counterCollectionName)
    .findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: 1 } },
      { returnDocument: "after", upsert: true } // Crea el contador si no existe
    );
  // Asegurarse que sequence_value existe
  if (
    !sequenceDocument ||
    sequenceDocument.sequence_value === undefined ||
    sequenceDocument.sequence_value === null
  ) {
    // Si upsert=true creó el documento pero findOneAndUpdate no devolvió el valor incrementado la primera vez
    // o si hubo algún problema, reintentar o inicializar.
    // Una inicialización segura si acaba de ser creado por upsert:
    const initialSequence = await db
      .collection(counterCollectionName)
      .findOne({ _id: sequenceName });
    if (
      initialSequence &&
      initialSequence.sequence_value !== undefined &&
      initialSequence.sequence_value !== null
    ) {
      return initialSequence.sequence_value;
    } else {
      // Si sigue sin funcionar, iniciar en 0 o manejar error
      await db.collection(counterCollectionName).updateOne(
        { _id: sequenceName },
        { $setOnInsert: { sequence_value: 0 } }, // Iniciar en 0 si no existe
        { upsert: true }
      );
      // Intentar incrementar de nuevo o devolver 0 como primer ID
      const retryDoc = await db
        .collection(counterCollectionName)
        .findOneAndUpdate(
          { _id: sequenceName },
          { $inc: { sequence_value: 1 } },
          { returnDocument: "after" }
        );
      if (
        retryDoc &&
        retryDoc.sequence_value !== undefined &&
        retryDoc.sequence_value !== null
      ) {
        return retryDoc.sequence_value;
      } else {
        // Si todo falla, lanza un error o devuelve un valor por defecto como 0 o 1.
        // Devolver 1 como primer ID podría ser más intuitivo que 0.
        console.warn(
          `Contador '${sequenceName}' no pudo ser inicializado o incrementado correctamente. Iniciando secuencia en 1.`
        );
        await db
          .collection(counterCollectionName)
          .updateOne(
            { _id: sequenceName },
            { $set: { sequence_value: 1 } },
            { upsert: true }
          );
        return 1;
      }
    }
  }
  return sequenceDocument.sequence_value;
}

// Determina la colección de destino basada en categorySlug
function getTargetCollection(categorySlug) {
  const collectionName = categoryCollectionMap[categorySlug];
  if (!collectionName) {
    console.warn(
      `Advertencia: No se encontró mapeo de colección para categorySlug '${categorySlug}'. Usando 'publications_otros'.`
    );
    return "publications_otros"; // Colección por defecto para categorías no mapeadas
  }
  return collectionName;
}

// --- Lógica Principal ---
async function importData() {
  if (!uri) {
    console.error(
      "Error: La variable de entorno MONGODB_URI no está definida."
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  let publicationsImported = 0;
  let filesProcessed = 0;

  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
    const db = client.db(dbName);

    // Asegurar que el contador existe antes de empezar
    await db.collection(counterCollectionName).updateOne(
      { _id: counterId },
      { $setOnInsert: { sequence_value: 0 } }, // Inicia en 0 si no existe
      { upsert: true }
    );
    console.log(`Contador '${counterId}' asegurado/inicializado.`);

    const files = fs
      .readdirSync(dataFolderPath)
      .filter((file) => file.endsWith(".json"));
    console.log(
      `Archivos JSON encontrados en ${dataFolderPath}: ${files.length}`
    );

    for (const file of files) {
      filesProcessed++;
      const filePath = path.join(dataFolderPath, file);
      console.log(`
Procesando archivo: ${file}...`);

      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const publications = JSON.parse(fileContent);

        if (!Array.isArray(publications)) {
          console.warn(
            `  Advertencia: El archivo ${file} no contiene un array JSON. Saltando archivo.`
          );
          continue;
        }

        console.log(
          `  - Encontradas ${publications.length} publicaciones en ${file}.`
        );
        let countInFile = 0;

        for (const pub of publications) {
          try {
            // 1. Obtener el siguiente ID
            const nextId = await getNextSequenceValue(db, counterId);
            pub.publicationId = nextId;

            // 2. Añadir timestamps
            const now = new Date();
            pub.createdAt = now;
            pub.updatedAt = now;

            // 3. Determinar colección de destino
            if (!pub.categorySlug) {
              console.warn(
                `  - Publicación con título "${
                  pub.title || "Desconocido"
                }" no tiene categorySlug. Saltando.`
              );
              continue;
            }
            const targetCollectionName = getTargetCollection(pub.categorySlug);
            const targetCollection = db.collection(targetCollectionName);

            // 4. Insertar la publicación
            // Añadir validación aquí si es necesario antes de insertar
            await targetCollection.insertOne(pub);
            countInFile++;
            publicationsImported++;
          } catch (pubError) {
            console.error(
              `  - Error procesando publicación individual (Título: ${
                pub.title || "N/A"
              }) en ${file}:`,
              pubError
            );
            // Considerar si continuar con las siguientes publicaciones o detener el script
          }
        }
        console.log(
          `  - ${countInFile} publicaciones importadas desde ${file}.`
        );
      } catch (fileError) {
        console.error(`Error procesando el archivo ${file}:`, fileError);
        // Considerar si continuar con los siguientes archivos o detener el script
      }
    }
  } catch (err) {
    console.error("Error durante la importación:", err);
  } finally {
    await client.close();
    console.log("--- Proceso Finalizado ---");
    console.log(`Archivos procesados: ${filesProcessed}`);
    console.log(`Total de publicaciones importadas: ${publicationsImported}`);
    console.log("Desconectado de MongoDB.");
  }
}

importData();
