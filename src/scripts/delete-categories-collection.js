// Script para eliminar la colección de categorías en MongoDB
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function deleteCategories() {
  // Usar la URI de conexión directamente desde dbConnect.js
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://buscadiss:UQA8DlAqm6N7DDNx@cluster0.4qbi1hu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  if (!uri) {
    console.error("⛔ Error: No se pudo determinar la URI de MongoDB.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("🔌 Conectado a MongoDB");

    const db = client.db();

    // Verificar si existe la colección 'categories'
    const collections = await db
      .listCollections({ name: "categories" })
      .toArray();

    if (collections.length > 0) {
      // Eliminar la colección 'categories'
      await db.collection("categories").drop();
      console.log('✅ Colección "categories" eliminada exitosamente');
    } else {
      console.log('ℹ️ La colección "categories" no existe en la base de datos');
    }

    // Verificar si existe la colección 'subcategories'
    const subCollections = await db
      .listCollections({ name: "subcategories" })
      .toArray();

    if (subCollections.length > 0) {
      // Eliminar la colección 'subcategories'
      await db.collection("subcategories").drop();
      console.log('✅ Colección "subcategories" eliminada exitosamente');
    } else {
      console.log(
        'ℹ️ La colección "subcategories" no existe en la base de datos'
      );
    }
  } catch (error) {
    console.error("⛔ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Desconectado de MongoDB");
  }
}

// Ejecutar la función
deleteCategories().catch(console.error);
