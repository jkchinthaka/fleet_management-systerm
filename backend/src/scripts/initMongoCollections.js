import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_DIR = path.resolve(__dirname, '../models');

const getCollectionNames = async () => {
  const files = await fs.readdir(MODELS_DIR);
  const collectionNames = new Set();

  for (const file of files) {
    if (!file.endsWith('Model.js')) {
      continue;
    }

    const filePath = path.join(MODELS_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');
    const matches = content.matchAll(/tableName\s*:\s*'([^']+)'/g);

    for (const match of matches) {
      collectionNames.add(match[1]);
    }
  }

  return [...collectionNames].sort();
};

const ensureCollection = async (db, collectionName) => {
  try {
    await db.createCollection(collectionName);
    console.log(`Created collection: ${collectionName}`);
  } catch (error) {
    if (error?.codeName === 'NamespaceExists' || error?.code === 48) {
      console.log(`Collection exists: ${collectionName}`);
      return;
    }

    throw error;
  }
};

const createRequiredIndexes = async (db) => {
  // Mirrors unique constraint from Sequelize userModel email field.
  await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
  console.log('Ensured index: users.users_email_unique');
};

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGODB_URI (or MONGO_URI) is required in environment variables.');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fleet_db';
  const collectionNames = await getCollectionNames();

  if (!collectionNames.length) {
    throw new Error('No model tableName values found in src/models.');
  }

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15000
  });

  const db = mongoose.connection.db;
  console.log(`Connected to MongoDB database: ${db.databaseName}`);

  for (const collectionName of collectionNames) {
    await ensureCollection(db, collectionName);
  }

  await createRequiredIndexes(db);
  console.log(`Mongo initialization complete. Collections ensured: ${collectionNames.length}`);
};

run()
  .catch((error) => {
    console.error(`Mongo initialization failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
