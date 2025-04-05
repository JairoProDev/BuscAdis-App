const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://buscadiss:UQA8DlAqm6N7DDNx@cluster0.4qbi1hu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function listCollections() {
  try {
    const client = new MongoClient(uri);

    // Connect to the MongoDB server
    await client.connect();

    // Access test database
    const db = client.db("test");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("MongoDB Collections:");
    collections.forEach((collection) => {
      console.log(` - ${collection.name}`);
    });

    // Close the connection
    await client.close();
  } catch (error) {
    console.error("Error listing MongoDB collections:", error);
  }
}

listCollections();
