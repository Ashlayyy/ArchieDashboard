import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { database, ensureOk, query, root, runSqlcmd, sqlLiteral, startLocalSqlService } from './sqlcmd.mjs';

const destDir = path.join(root, 'db');
const destFile = path.join(destDir, 'CloudMetrics.bak');

function defaultBackupDir() {
  try {
    const output = query(`SET NOCOUNT ON; SELECT CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS nvarchar(512));`);
    const line = output.split(/\r?\n/).map((row) => row.trim()).find(Boolean);
    if (line && line !== 'NULL' && existsSync(line)) {
      return line;
    }
  } catch {
    // Fall through to well-known paths.
  }

  const guesses = [
    'C:\\Program Files\\Microsoft SQL Server\\MSSQL16.MSSQLSERVER\\MSSQL\\Backup',
    'C:\\Program Files\\Microsoft SQL Server\\MSSQL15.MSSQLSERVER\\MSSQL\\Backup',
    'C:\\Program Files\\Microsoft SQL Server\\MSSQL14.MSSQLSERVER\\MSSQL\\Backup',
    'C:\\Program Files\\Microsoft SQL Server\\MSSQL13.MSSQLSERVER\\MSSQL\\Backup'
  ];
  return guesses.find((dir) => existsSync(dir));
}

function backupTo(diskPath, withCompression) {
  const options = ['COPY_ONLY', 'FORMAT', 'INIT', 'STATS = 10'];
  if (withCompression) {
    options.unshift('COMPRESSION');
  }
  const sql = `
SET NOCOUNT ON;
BACKUP DATABASE [${database}]
TO DISK = N'${sqlLiteral(diskPath)}'
WITH ${options.join(', ')};
`;
  return runSqlcmd(['-Q', sql]);
}

function tryBackup(diskPath) {
  const compressed = backupTo(diskPath, true);
  if (compressed.status === 0) {
    return compressed;
  }
  const message = `${compressed.stderr || ''}\n${compressed.stdout || ''}`;
  if (/COMPRESSION|feature|edition/i.test(message)) {
    console.log('Compression is not available on this SQL Server edition. Backing up uncompressed...');
    return backupTo(diskPath, false);
  }
  return compressed;
}

function copyToDest(fromPath) {
  mkdirSync(destDir, { recursive: true });
  copyFileSync(fromPath, destFile);
}

startLocalSqlService();
mkdirSync(destDir, { recursive: true });

console.log(`Backing up ${database} to ${destFile}...`);
let result = tryBackup(destFile);

if (result.status !== 0) {
  const reason = (result.stderr || result.stdout || '').trim();
  console.warn(`Direct backup to the db folder failed:\n${reason}\nTrying the SQL Server backup directory...`);
  const backupDir = defaultBackupDir();
  if (!backupDir) {
    throw new Error('Could not find a SQL Server backup directory the service can write to.');
  }
  const tempFile = path.join(backupDir, 'CloudMetrics-DataMetrics.bak');
  result = tryBackup(tempFile);
  ensureOk(result, 'BACKUP DATABASE failed');
  copyToDest(tempFile);
} else {
  ensureOk(result, 'BACKUP DATABASE failed');
}

if (!existsSync(destFile)) {
  throw new Error(`Backup finished but ${destFile} was not created.`);
}

const sizeMb = Math.round(statSync(destFile).size / (1024 * 1024));
console.log(`Wrote ${destFile} (${sizeMb} MB). Restore with: npm run db:restore`);
