/**
 * Database Field Migration Script
 *
 * This script updates the database collections to standardize field names:
 * - Renames 'subcategory' to 'subcategorySlug'
 * - Renames 'subsubcategory' to 'subSubcategorySlug'
 *
 * Usage:
 * 1. Place this file in src/scripts/
 * 2. Run with Node.js:
 *    node src/scripts/db-field-migration.js
 */

import "dotenv";
import { MongoClient } from "mongodb";

// MongoDB connection URI from environment
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/buscadis";

// Collections to migrate
const COLLECTIONS = [
  "publications_empleos",
  "publications_inmuebles",
  "publications_vehiculos",
  "publications_servicios",
  "publications_productos",
  "publications_eventos",
  "publications_negocios",
  "publications_comunidad",
];

async function migrateCollections() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    for (const collectionName of COLLECTIONS) {
      console.log(`\nProcessing collection: ${collectionName}`);
      const collection = db.collection(collectionName);

      // Count documents
      const totalDocs = await collection.countDocuments();
      console.log(`Total documents: ${totalDocs}`);

      // Create a backup collection
      const backupCollectionName = `${collectionName}_backup_${Date.now()}`;
      console.log(`Creating backup collection: ${backupCollectionName}`);

      // Clone the collection
      await db.command({
        cloneCollection: `${db.databaseName}.${collectionName}`,
        collection: backupCollectionName,
      });

      console.log("Backup created successfully");

      // 1. Update documents that have 'subcategory' but not 'subcategorySlug'
      const subcategoryResult = await collection.updateMany(
        { subcategory: { $exists: true }, subcategorySlug: { $exists: false } },
        [{ $set: { subcategorySlug: "$subcategory" } }]
      );

      console.log(
        `Updated ${subcategoryResult.modifiedCount} documents with subcategorySlug`
      );

      // 2. Update documents that have 'subsubcategory' but not 'subSubcategorySlug'
      const subsubcategoryResult = await collection.updateMany(
        {
          subsubcategory: { $exists: true },
          subSubcategorySlug: { $exists: false },
        },
        [{ $set: { subSubcategorySlug: "$subsubcategory" } }]
      );

      console.log(
        `Updated ${subsubcategoryResult.modifiedCount} documents with subSubcategorySlug`
      );

      // 3. Ensure all documents have subcategorySlug and subSubcategorySlug fields (empty if not present)
      const ensureFieldsResult = await collection.updateMany(
        { subcategorySlug: { $exists: false } },
        { $set: { subcategorySlug: "" } }
      );

      const ensureSubsubFieldsResult = await collection.updateMany(
        { subSubcategorySlug: { $exists: false } },
        { $set: { subSubcategorySlug: "" } }
      );

      console.log(
        `Ensured fields exist in ${
          ensureFieldsResult.modifiedCount +
          ensureSubsubFieldsResult.modifiedCount
        } documents`
      );
    }

    console.log("\nMigration completed successfully!");
    console.log(
      "The original fields (subcategory, subsubcategory) are preserved for backward compatibility."
    );
    console.log(
      "You can use the new field names (subcategorySlug, subSubcategorySlug) in your application."
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migrateCollections().catch(console.error);
