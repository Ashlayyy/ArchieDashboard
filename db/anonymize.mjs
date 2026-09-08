import { database, ensureOk, query, runSqlcmd, startLocalSqlService } from './sqlcmd.mjs';

const dryRun = process.argv.includes('--dry-run');

startLocalSqlService();

const beforeCount = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(*) AS varchar(20)) FROM dbo.BackupMetrics;
`);
const distinctBefore = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(DISTINCT Source) AS varchar(20)) FROM dbo.BackupMetrics;
`);
const archieMatches = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(*) AS varchar(20))
FROM dbo.BackupMetrics
WHERE Source LIKE N'%Archie%' COLLATE Latin1_General_CI_AI;
`);

console.log(`Rows: ${beforeCount}`);
console.log(`Distinct company names: ${distinctBefore}`);
console.log(`Rows whose Source mentions Archie: ${archieMatches}`);

if (dryRun) {
  console.log('Dry run only. Re-run without --dry-run to rewrite Source names.');
  process.exit(0);
}

const sql = `
SET NOCOUNT ON;
SET XACT_ABORT ON;
USE [${database}];

BEGIN TRAN;

UPDATE dbo.BackupMetrics
SET Source = LTRIM(RTRIM(REPLACE(REPLACE(Source, N'Archie', N''), N'archie', N'')))
WHERE Source LIKE N'%Archie%' COLLATE Latin1_General_CI_AI;

UPDATE dbo.BackupMetrics
SET Source = N'Unnamed'
WHERE Source IS NULL OR LTRIM(RTRIM(Source)) = N'';

;WITH ranked AS (
  SELECT Source, DENSE_RANK() OVER (ORDER BY Source) AS n
  FROM dbo.BackupMetrics
  GROUP BY Source
)
UPDATE b
SET b.Source = N'Company ' + RIGHT(REPLICATE('0', 4) + CAST(r.n AS varchar(12)), 4)
FROM dbo.BackupMetrics AS b
INNER JOIN ranked AS r ON r.Source = b.Source;

COMMIT;
`;

console.log('Anonymizing BackupMetrics.Source (this can take a few minutes on a large table)...');
ensureOk(runSqlcmd(['-Q', sql]), 'Anonymize update failed');

const distinctAfter = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(DISTINCT Source) AS varchar(20)) FROM dbo.BackupMetrics;
`);
const leftover = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT CAST(COUNT(*) AS varchar(20))
FROM dbo.BackupMetrics
WHERE Source LIKE N'%Archie%' COLLATE Latin1_General_CI_AI;
`);
const sample = query(`
SET NOCOUNT ON;
USE [${database}];
SELECT TOP 8 Source FROM dbo.BackupMetrics GROUP BY Source ORDER BY Source;
`);

console.log(`Done. Distinct names now: ${distinctAfter}. Remaining Archie mentions: ${leftover}.`);
console.log(`Sample names:\n${sample}`);
console.log('Restore original names with: npm run db:restore');
