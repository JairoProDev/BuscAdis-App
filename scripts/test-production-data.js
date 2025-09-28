#!/usr/bin/env node
/*
  Script to test what data is actually in the production database
*/

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI environment variable not found');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 60000,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected');

    const db = client.db('buscadis');
    const collection = db.collection('adisos');
    
    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total documents in adisos collection: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('❌ No documents found in adisos collection');
      return;
    }
    
    // Get sample document
    const sampleDoc = await collection.findOne();
    console.log('\n📄 Sample document structure:');
    console.log(JSON.stringify(sampleDoc, null, 2));
    
    // Test specific queries
    console.log('\n🔍 Testing specific queries:');
    
    // Test category query
    const empleosCount = await collection.countDocuments({ category: 'empleos' });
    console.log(`- Documents with category 'empleos': ${empleosCount}`);
    
    // Test if documents have the expected structure
    const hasTitle = await collection.countDocuments({ title: { $exists: true } });
    console.log(`- Documents with title field: ${hasTitle}`);
    
    const hasCategory = await collection.countDocuments({ category: { $exists: true } });
    console.log(`- Documents with category field: ${hasCategory}`);
    
    const hasDescription = await collection.countDocuments({ description: { $exists: true } });
    console.log(`- Documents with description field: ${hasDescription}`);
    
    // Test the exact query used in the API
    const apiQuery = { category: 'empleos' };
    const apiResults = await collection.find(apiQuery).limit(3).toArray();
    console.log(`\n🎯 API query results (category: 'empleos'):`);
    console.log(`Found ${apiResults.length} documents`);
    if (apiResults.length > 0) {
      console.log('Sample result:');
      console.log(JSON.stringify(apiResults[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

main().catch(console.error);
