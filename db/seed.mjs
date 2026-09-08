import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const initSqlPath = path.join(root, 'db', 'init.sql');
const reset = process.argv.includes('--reset');
const force = process.argv.includes('--force');
const waitOnly = process.argv.includes('--wait');
const useDocker = process.argv.includes('--docker');

const server = process.env.SQLDB_PROD_HOST || process.env.SQLDB_HOST || 'localhost';
const database = process.env.SQLDB_PROD_DATABASE || process.env.SQLDB_DATABASE || 'CloudMetrics';
const appUser = process.env.SQLDB_PROD_USER || process.env.SQLDB_USER || 'datametrics';
const appPassword = process.env.SQLDB_PROD_PASS || process.env.SQLDB_PASS || 'ArchieDb_12345';

const companies = [
  { name: 'Acme', sizeGb: 42, users: 86, activeRatio: 0.72 },
  { name: 'Northwind', sizeGb: 28, users: 54, activeRatio: 0.68 },
  { name: 'Contoso', sizeGb: 61, users: 120, activeRatio: 0.81 },
  { name: 'Globex', sizeGb: 19, users: 33, activeRatio: 0.64 }
];

const types = ['database_size', 'mfcp_size', 'corresp_size', 'users', 'active_users'];

function gbToKb(gb) {
  return Math.round(gb * 1024 * 1024);
}

function excelSerial(date) {
  const epoch = Date.UTC(1899, 11, 30);
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.round((utc - epoch) / 86400000);
}

function uniqueDates() {
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dates = new Map();

  for (let week = 7; week >= 0; week -= 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - week * 7);
    dates.set(excelSerial(date), date);
  }

  for (let day = 6; day >= 0; day -= 1) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - day);
    dates.set(excelSerial(date), date);
  }

  return [...dates.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([serial]) => serial);
}

function metricValue(company, type, weekIndex) {
  const growth = 1 + weekIndex * 0.035;
  switch (type) {
    case 'database_size':
      return gbToKb(company.sizeGb * growth);
    case 'mfcp_size':
      return gbToKb(company.sizeGb * 0.22 * growth);
    case 'corresp_size':
      return gbToKb(company.sizeGb * 0.18 * growth);
    case 'users':
      return Math.round(company.users * growth);
    case 'active_users':
      return Math.round(company.users * company.activeRatio * growth);
    default:
      return 0;
  }
}

function windowsSqlcmd() {
  const candidates = [
    process.env.SQLCMD,
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\sqlcmd.exe',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\180\\Tools\\Binn\\sqlcmd.exe',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\130\\Tools\\Binn\\sqlcmd.exe'
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) || 'sqlcmd';
}

function runSqlcmd(args, input) {
  if (useDocker) {
    return spawnSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'mssql',
        '/opt/mssql-tools18/bin/sqlcmd',
        '-S',
        'localhost',
        '-U',
        'sa',
        '-P',
        appPassword,
        '-C',
        '-b',
        '-r',
        '1',
        ...args
      ],
      { cwd: root, encoding: 'utf8', input, maxBuffer: 20 * 1024 * 1024 }
    );
  }

  return spawnSync(windowsSqlcmd(), ['-S', server, '-E', '-b', '-r', '1', ...args], {
    cwd: root,
    encoding: 'utf8',
    input,
    maxBuffer: 20 * 1024 * 1024
  });
}

function ensureOk(result, message) {
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || message);
  }
  return result;
}

function query(sql) {
  const result = ensureOk(runSqlcmd(['-h', '-1', '-W', '-Q', sql]), `Query failed: ${sql}`);
  return (result.stdout || '').trim();
}

function startLocalSqlService() {
  if (useDocker || process.platform !== 'win32') {
    return;
  }

  const status = spawnSync('sc', ['query', 'MSSQLSERVER'], { encoding: 'utf8' });
  if (!status.stdout?.includes('RUNNING')) {
    console.log('Starting local SQL Server (MSSQLSERVER)...');
    const started = spawnSync('net', ['start', 'MSSQLSERVER'], { encoding: 'utf8' });
    if (started.status !== 0 && !started.stdout?.includes('already been started')) {
      console.warn(started.stderr || started.stdout || 'Could not start MSSQLSERVER. Continue if another instance is running.');
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSql() {
  startLocalSqlService();
  process.stdout.write(`Waiting for SQL Server at ${server}`);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = runSqlcmd(['-Q', 'SELECT 1']);
    if (result.status === 0) {
      process.stdout.write('\n');
      return;
    }
    process.stdout.write('.');
    await sleep(2000);
  }
  process.stdout.write('\n');
  throw new Error(
    'SQL Server did not become ready. Docker is not required on this machine; the local SQL Server service should be running.'
  );
}

function ensureAppLogin() {
  const loginSql = `
SET NOCOUNT ON;
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'${appUser.replaceAll("'", "''")}')
  CREATE LOGIN [${appUser}] WITH PASSWORD = N'${appPassword.replaceAll("'", "''")}', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
ELSE
  ALTER LOGIN [${appUser}] WITH PASSWORD = N'${appPassword.replaceAll("'", "''")}', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
ALTER LOGIN [${appUser}] ENABLE;
USE [${database}];
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'${appUser.replaceAll("'", "''")}')
  CREATE USER [${appUser}] FOR LOGIN [${appUser}];
ALTER ROLE db_owner ADD MEMBER [${appUser}];
SELECT 'ok';
`;
  ensureOk(runSqlcmd(['-Q', loginSql]), 'Failed to create the DataMetrics SQL login');
}

function rowCount() {
  const output = query(
    `SET NOCOUNT ON; USE [${database}]; SELECT CAST(COUNT(*) AS VARCHAR(20)) FROM dbo.BackupMetrics;`
  );
  return Number((output.match(/\d+/) || ['0'])[0]);
}

function buildRows() {
  const snapshots = uniqueDates();
  const rows = [];
  let id = 1;
  snapshots.forEach((serial, index) => {
    companies.forEach((company) => {
      types.forEach((type) => {
        rows.push({
          id,
          source: company.name,
          backupDate: serial,
          type,
          intData: metricValue(company, type, index)
        });
        id += 1;
      });
    });
  });
  return rows;
}

function escapeNVarChar(value) {
  return String(value).replaceAll("'", "''");
}

function insertSql(rows) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += 80) {
    const slice = rows.slice(i, i + 80);
    const values = slice
      .map(
        (row) =>
          `(${row.id}, N'${escapeNVarChar(row.source)}', ${row.backupDate}, N'${escapeNVarChar(row.type)}', ${row.intData})`
      )
      .join(',\n');
    chunks.push(`INSERT INTO dbo.BackupMetrics (id, Source, BackupDate, Type, IntData) VALUES\n${values};`);
  }
  return `USE [${database}];\n${chunks.join('\n')}`;
}

async function main() {
  await waitForSql();
  if (waitOnly) {
    console.log('SQL Server is ready.');
    return;
  }

  const schemaFile = useDocker ? '/db/init.sql' : initSqlPath;
  ensureOk(runSqlcmd(['-i', schemaFile]), 'Failed to apply schema');
  console.log('Schema is in place.');
  ensureAppLogin();
  console.log(`Login '${appUser}' can access ${database}.`);

  const count = rowCount();
  if (reset) {
    if (count > 10000 && !force) {
      throw new Error(
        `${database}.dbo.BackupMetrics already has ${count} rows. Refusing to wipe it. Pass --force if you really want fake seed data instead.`
      );
    }
    query(`SET NOCOUNT ON; USE [${database}]; DELETE FROM dbo.BackupMetrics;`);
  } else if (count > 0) {
    console.log(`Database already has ${count} rows. Leaving existing metrics in place.`);
    return;
  }

  const rows = buildRows();
  ensureOk(runSqlcmd(['-d', database], `${insertSql(rows)}\nGO\n`), 'Failed to insert seed rows');
  console.log(`Seeded ${rows.length} BackupMetrics rows across ${companies.length} companies.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
