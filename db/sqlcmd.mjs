import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

loadBackendEnv();

export const server = process.env.SQLDB_PROD_HOST || process.env.SQLDB_HOST || 'localhost';
export const database = process.env.SQLDB_PROD_DATABASE || process.env.SQLDB_DATABASE || 'CloudMetrics';

function loadBackendEnv() {
  const envPath = path.join(root, 'ArchieDashboard', 'BackEnd', '.env');
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function windowsSqlcmd() {
  const candidates = [
    process.env.SQLCMD,
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\sqlcmd.exe',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\180\\Tools\\Binn\\sqlcmd.exe',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\130\\Tools\\Binn\\sqlcmd.exe'
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) || 'sqlcmd';
}

export function runSqlcmd(args, input, extra = []) {
  return spawnSync(windowsSqlcmd(), ['-S', server, '-E', '-b', '-r', '1', '-t', '0', ...extra, ...args], {
    cwd: root,
    encoding: 'utf8',
    input,
    maxBuffer: 64 * 1024 * 1024
  });
}

export function ensureOk(result, message) {
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || message).trim() || message);
  }
  return result;
}

export function query(sql, extra = []) {
  const result = ensureOk(runSqlcmd(['-h', '-1', '-W', '-Q', sql], undefined, extra), `Query failed: ${sql}`);
  return (result.stdout || '').trim();
}

export function startLocalSqlService() {
  if (process.platform !== 'win32') {
    return;
  }

  const status = spawnSync('sc', ['query', 'MSSQLSERVER'], { encoding: 'utf8' });
  if (!status.stdout?.includes('RUNNING')) {
    console.log('Starting local SQL Server (MSSQLSERVER)...');
    const started = spawnSync('net', ['start', 'MSSQLSERVER'], { encoding: 'utf8' });
    if (started.status !== 0 && !started.stdout?.includes('already been started')) {
      console.warn(started.stderr || started.stdout || 'Could not start MSSQLSERVER.');
    }
  }
}

export function sqlLiteral(value) {
  return String(value).replaceAll("'", "''");
}
