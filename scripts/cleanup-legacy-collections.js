#!/usr/bin/env node
/*
  Cleanup script to drop legacy per-category publications collections.
  - Connects to MongoDB Atlas using MONGODB_URI
  - Targets two databases by default: 'buscadis' and 'test' (override with DB_LIST env)
  - Drops any collection whose name matches /^publications_/. 
  - Safe by default: prints plan and requires --yes to execute destructive action.
*/

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI is not set. Please configure it in .env.local');
  process.exit(1);
}

// Databases to clean. Can override with DB_LIST="buscadis,test,staging" env var
const dbList = (process.env.DB_LIST || 'buscadis,test')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const DRY_RUN = !process.argv.includes('--yes');

function formatList(items) {
  return items.length ? `\n - ${items.join('\n - ')}` : '\n <none>';
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

    for (const dbName of dbList) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      const legacy = collections
        .map((c) => c.name)
        .filter((name) => /^publications_/.test(name));

      console.log(`\n📂 Database: ${dbName}`);
      console.log('Collections matching /^publications_/:', formatList(legacy));

      if (legacy.length === 0) continue;

      if (DRY_RUN) {
        console.log('ℹ️ Dry run (no changes). Pass --yes to proceed with dropping.');
        continue;
      }

      for (const name of legacy) {
        try {
          await db.collection(name).drop();
          console.log(`🗑️  Dropped collection: ${dbName}.${name}`);
        } catch (err) {
          if (err && err.codeName === 'NamespaceNotFound') {
            console.log(`⚠️  Collection not found (already dropped): ${dbName}.${name}`);
          } else {
            console.error(`❌ Error dropping ${dbName}.${name}:`, err.message || err);
          }
        }
      }
    }

    console.log('\n🎉 Cleanup complete.');
  } catch (error) {
    console.error('❌ Cleanup failed:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

main();


