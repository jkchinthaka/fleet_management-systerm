import mongoose from 'mongoose';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb+srv://fleetAdmin:USER@cluster0.gsqzhij.mongodb.net/?appName=Cluster0';

const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'Fleet_New';
const SQL_DATABASE = process.env.SQL_DB_NAME || process.env.DB_NAME || 'NELNA_APP';
const SQL_SCHEMA = process.env.SQL_BACKUP_SCHEMA || 'mongo_backup';

const SQL_CONNECTION_STRING =
  process.env.SQLSERVER_CONNECTION_STRING ||
  process.env.SQL_CONNECTION_STRING ||
  'Data Source=localhost,1433;Persist Security Info=True;User ID=nelna_user;Password=Nelna@123;Pooling=False;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=True;Application Name="SQL Server Management Studio";Command Timeout=0';

const parseConnectionString = (connectionString) => {
  const map = {};
  connectionString
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return;
      const key = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim();
      map[key] = value;
    });

  const dataSource = map['data source'] || map.server || map.address || 'localhost,1433';
  const [serverRaw, portRaw] = dataSource.split(',');
  const server = serverRaw?.trim() || 'localhost';
  const port = Number(portRaw || map.port || 1433);
  const user = map['user id'] || map.uid || map.user || process.env.DB_USER;
  const password = map.password || map.pwd || process.env.DB_PASSWORD;

  return {
    server,
    port,
    user,
    password,
    options: {
      encrypt: String(map.encrypt || process.env.DB_ENCRYPT || 'true').toLowerCase() === 'true',
      trustServerCertificate:
        String(map.trustservercertificate || process.env.DB_TRUST_CERT || 'true').toLowerCase() === 'true'
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
};

const safeIdentifier = (name) => {
  // Keep SQL identifiers safe and deterministic.
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
};

const createDatabaseIfMissing = async (baseConfig, databaseName) => {
  const masterPool = await sql.connect({ ...baseConfig, database: 'master' });
  await masterPool
    .request()
    .input('dbName', sql.NVarChar(128), databaseName)
    .query('IF DB_ID(@dbName) IS NULL EXEC (N\'CREATE DATABASE [' + databaseName.replace(/]/g, ']]') + ']\')');
  await masterPool.close();
};

const ensureBackupTable = async (pool, schemaName, tableName) => {
  const escapedSchema = schemaName.replace(/]/g, ']]');
  const escapedTable = tableName.replace(/]/g, ']]');

  await pool.request().query(`
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'${escapedSchema}')
BEGIN
  EXEC(N'CREATE SCHEMA [${escapedSchema}]');
END
`);

  await pool.request().query(`
IF OBJECT_ID(N'[${escapedSchema}].[${escapedTable}]', N'U') IS NULL
BEGIN
  CREATE TABLE [${escapedSchema}].[${escapedTable}] (
    [id] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [mongo_id] NVARCHAR(64) NOT NULL,
    [payload] NVARCHAR(MAX) NOT NULL,
    [synced_at] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [UQ_${escapedSchema}_${escapedTable}_mongo_id] UNIQUE ([mongo_id])
  );
END
`);
};

const syncCollection = async (pool, mongoDb, schemaName, collectionName) => {
  const tableName = safeIdentifier(collectionName);
  await ensureBackupTable(pool, schemaName, tableName);

  const escapedSchema = schemaName.replace(/]/g, ']]');
  const escapedTable = tableName.replace(/]/g, ']]');
  await pool.request().query(`TRUNCATE TABLE [${escapedSchema}].[${escapedTable}]`);

  const docs = await mongoDb.collection(collectionName).find({}).toArray();
  if (!docs.length) {
    return { collectionName, rows: 0 };
  }

  for (const doc of docs) {
    const mongoId = String(doc._id);
    const payload = JSON.stringify(doc);

    await pool
      .request()
      .input('mongoId', sql.NVarChar(64), mongoId)
      .input('payload', sql.NVarChar(sql.MAX), payload)
      .query(`
INSERT INTO [${escapedSchema}].[${escapedTable}] ([mongo_id], [payload], [synced_at])
VALUES (@mongoId, @payload, SYSUTCDATETIME())
`);
  }

  return { collectionName, rows: docs.length };
};

const main = async () => {
  const startedAt = Date.now();
  let pool;

  try {
    console.log(`[1/4] Connecting to MongoDB: ${MONGO_DB_NAME}`);
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME, serverSelectionTimeoutMS: 30000 });
    const mongoDb = mongoose.connection.db;

    const baseSqlConfig = parseConnectionString(SQL_CONNECTION_STRING);
    if (!baseSqlConfig.user || !baseSqlConfig.password) {
      throw new Error('Missing SQL credentials. Provide SQLSERVER_CONNECTION_STRING or DB_USER/DB_PASSWORD.');
    }

    console.log(`[2/4] Ensuring SQL database exists: ${SQL_DATABASE}`);
    await createDatabaseIfMissing(baseSqlConfig, SQL_DATABASE);

    console.log(`[3/4] Connecting to SQL Server database: ${SQL_DATABASE}`);
    pool = await sql.connect({ ...baseSqlConfig, database: SQL_DATABASE });

    const collections = await mongoDb.listCollections({}, { nameOnly: true }).toArray();
    const names = collections
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'))
      .sort((a, b) => a.localeCompare(b));

    if (!names.length) {
      console.log('No collections found to sync.');
      return;
    }

    console.log(`[4/4] Syncing ${names.length} collections into [${SQL_SCHEMA}] schema...`);
    let totalRows = 0;

    for (const name of names) {
      const result = await syncCollection(pool, mongoDb, SQL_SCHEMA, name);
      totalRows += result.rows;
      console.log(`  - ${result.collectionName}: ${result.rows} rows`);
    }

    const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`Backup completed. Collections: ${names.length}, Rows: ${totalRows}, Time: ${elapsedSec}s`);
    console.log(`Target: SQL Server DB [${SQL_DATABASE}], schema [${SQL_SCHEMA}]`);
  } catch (error) {
    console.error('Backup failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    try {
      if (pool) await pool.close();
    } catch {
      // Ignore close errors.
    }

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors.
    }
  }
};

main();
