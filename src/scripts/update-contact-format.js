/**
 * Contact Format Update Script
 *
 * This script updates the contact information format in all publications:
 * - Converts the 'phones' array to a properly formatted 'whatsapp' field
 * - Normalizes phone numbers to include country code
 * - Ensures backward compatibility with both formats
 *
 * Usage:
 * 1. Place this file in src/scripts/
 * 2. Run with Node.js:
 *    node src/scripts/update-contact-format.js
 */

const { MongoClient } = require("mongodb");

// MongoDB connection URI from environment
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/buscadis";

// Collections to update
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

// Helper function to format phone numbers
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "";

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // If already has country code (51), return as is
  if (cleaned.startsWith("51")) {
    return cleaned;
  }

  // If it's a Peruvian mobile number (starts with 9), add country code
  if (cleaned.startsWith("9") && cleaned.length === 9) {
    return `51${cleaned}`;
  }

  // Add country code as fallback for other numbers
  return `51${cleaned}`;
}

async function updateContactFormat() {
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
      const backupCollectionName = `${collectionName}_backup_contacts_${Date.now()}`;
      console.log(`Creating backup collection: ${backupCollectionName}`);

      // Clone the collection
      await db.command({
        cloneCollection: `${db.databaseName}.${collectionName}`,
        collection: backupCollectionName,
      });

      console.log("Backup created successfully");

      // Find documents that have contact.phones but no contact.whatsapp
      const docs = await collection
        .find({
          "contact.phones": { $exists: true },
          "contact.whatsapp": { $exists: false },
        })
        .toArray();

      console.log(`Found ${docs.length} documents to update`);

      let updated = 0;

      // Process each document
      for (const doc of docs) {
        const phones = doc.contact?.phones;

        if (phones && phones.length > 0) {
          const primaryPhone = phones[0];
          const formattedPhone = formatPhoneNumber(primaryPhone);

          // Update the document with the new whatsapp field
          const result = await collection.updateOne(
            { _id: doc._id },
            {
              $set: {
                "contact.whatsapp": formattedPhone,
                // Also set contactPhone for backward compatibility
                contactPhone: formattedPhone,
              },
            }
          );

          if (result.modifiedCount > 0) {
            updated++;
          }
        }
      }

      console.log(
        `Updated ${updated} documents with formatted WhatsApp numbers`
      );

      // Now handle documents where contactPhone exists but contact.whatsapp doesn't
      const phoneDocs = await collection
        .find({
          contactPhone: { $exists: true },
          "contact.whatsapp": { $exists: false },
        })
        .toArray();

      console.log(
        `Found ${phoneDocs.length} documents with contactPhone to sync`
      );

      let phoneUpdated = 0;

      // Process each document with contactPhone
      for (const doc of phoneDocs) {
        if (doc.contactPhone) {
          const formattedPhone = formatPhoneNumber(doc.contactPhone);

          // Initialize contact object if it doesn't exist
          const updateObj = {};

          if (!doc.contact) {
            updateObj["contact"] = {
              whatsapp: formattedPhone,
              name: doc.contactName || "",
              email: doc.contactEmail || "",
              phones: [formattedPhone],
            };
          } else {
            updateObj["contact.whatsapp"] = formattedPhone;

            // Add to phones array if it doesn't exist
            if (!doc.contact.phones || !Array.isArray(doc.contact.phones)) {
              updateObj["contact.phones"] = [formattedPhone];
            } else if (!doc.contact.phones.includes(formattedPhone)) {
              updateObj["contact.phones"] = [
                ...doc.contact.phones,
                formattedPhone,
              ];
            }
          }

          // Update the document
          const result = await collection.updateOne(
            { _id: doc._id },
            { $set: updateObj }
          );

          if (result.modifiedCount > 0) {
            phoneUpdated++;
          }
        }
      }

      console.log(
        `Synced ${phoneUpdated} documents from contactPhone to contact.whatsapp`
      );
    }

    console.log("\nContact format update completed successfully!");
    console.log(
      "All collections have been updated with proper WhatsApp contact information."
    );
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run the update
updateContactFormat().catch(console.error);
