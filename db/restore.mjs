import { existsSync } from 'node:fs';
import path from 'node:path';
import { database, ensureOk, query, root, runSqlcmd, sqlLiteral, startLocalSqlService } from './sqlcmd.mjs';

const bakArg = process.argv.find((arg) => arg.endsWith('.bak'));
const bakFile = bakArg
  ? path.resolve(bakArg)
  : path.join(root, 'db', 'CloudMetrics.bak');

if (!existsSync(bakFile)) {
  throw new Error(`Backup file not found: ${bakFile}`);
}

startLocalSqlService();

const fileList = query(`
SET NOCOUNT ON;
RESTORE FILELISTONLY FROM DISK = N'${sqlLiteral(bakFile)}';
`);

const logicalNames = fileList
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.split(/\s+/)[0])
  .filter((name) => name && !/^(LogicalName|NULL|-)/i.test(name));

const dataName = logicalNames[0];
const logName = logicalNames[1];
if (!dataName || !logName) {
  throw new Error(`Could not read logical file names from ${bakFile}.\n${fileList}`);
}

const dataPath = query(`
SET NOCOUNT ON;
SELECT physical_name FROM sys.master_files WHERE database_id = DB_ID(N'${sqlLiteral(database)}') AND type_desc = 'ROWS';
`);
const logPath = query(`
SET NOCOUNT ON;
SELECT physical_name FROM sys.master_files WHERE database_id = DB_ID(N'${sqlLiteral(database)}') AND type_desc = 'LOG';
`);

const dataFile = dataPath.split(/\r?\n/).map((row) => row.trim()).find(Boolean);
const logFile = logPath.split(/\r?\n/).map((row) => row.trim()).find(Boolean);
if (!dataFile || !logFile) {
  throw new Error(`Could not resolve current data/log paths for ${database}.`);
}

console.log(`Restoring ${database} from ${bakFile}...`);
const sql = `
SET NOCOUNT ON;
ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE [${database}]
FROM DISK = N'${sqlLiteral(bakFile)}'
WITH REPLACE, RECOVERY,
MOVE N'${sqlLiteral(dataName)}' TO N'${sqlLiteral(dataFile)}',
MOVE N'${sqlLiteral(logName)}' TO N'${sqlLiteral(logFile)}',
STATS = 10;
ALTER DATABASE [${database}] SET MULTI_USER;
`;

ensureOk(runSqlcmd(['-Q', sql]), 'RESTORE DATABASE failed');

const count = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(*) AS varchar(20)) FROM dbo.BackupMetrics;
`);
console.log(`Restore complete. BackupMetrics now has ${count} rows.`);
