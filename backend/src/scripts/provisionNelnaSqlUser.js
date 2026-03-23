import sql from 'mssql';

const adminConfig = {
  server: process.env.SQL_ADMIN_HOST || 'localhost',
  port: Number(process.env.SQL_ADMIN_PORT || 1433),
  user: process.env.SQL_ADMIN_USER || 'sa',
  password: process.env.SQL_ADMIN_PASSWORD || 'YourStrongPassword123!',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const appDbName = process.env.SQL_DB_NAME || 'NELNA_APP';
const appUser = process.env.SQL_APP_USER || 'nelna_user';
const appPassword = process.env.SQL_APP_PASSWORD || 'Nelna@123';

const esc = (value) => String(value).replace(/'/g, "''");

const run = async () => {
  let master;
  let appDb;

  try {
    master = await sql.connect({ ...adminConfig, database: 'master' });

    await master.request().query(`
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'${esc(appUser)}')
BEGIN
  CREATE LOGIN [${appUser}] WITH PASSWORD = '${esc(appPassword)}', CHECK_POLICY = OFF;
END
`);

    await master.request().query(`
IF DB_ID(N'${esc(appDbName)}') IS NULL
BEGIN
  EXEC(N'CREATE DATABASE [${appDbName}]');
END
`);

    await master.close();

    appDb = await sql.connect({ ...adminConfig, database: appDbName });

    await appDb.request().query(`
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'${esc(appUser)}')
BEGIN
  CREATE USER [${appUser}] FOR LOGIN [${appUser}];
END
`);

    await appDb.request().query(`
IF IS_ROLEMEMBER('db_owner', '${esc(appUser)}') = 0
BEGIN
  ALTER ROLE [db_owner] ADD MEMBER [${appUser}];
END
`);

    console.log(`SQL user provisioned: ${appUser} on database ${appDbName}`);
  } catch (error) {
    console.error('Provision failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    try {
      if (master) await master.close();
    } catch {
      // Ignore close errors.
    }
    try {
      if (appDb) await appDb.close();
    } catch {
      // Ignore close errors.
    }
  }
};

run();
