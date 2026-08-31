import { BackupMetricsServiceFilter } from '../module/backupmetrics/types/BackupMetricsServiceFilter';
import { normalizeCompanies } from './sourceFilter';

export type WeekMetricsQuery = {
  sql: string;
  replacements: Record<string, string | number>;
};

export function buildWeekMetricsQuery(filter: BackupMetricsServiceFilter, lastDateFallback: number): WeekMetricsQuery {
  const replacements: Record<string, string | number> = {};
  const conditions: string[] = [`bm.Type NOT IN ('database', 'mfcp')`, 'bm.IntData IS NOT NULL'];

  const dates = Array.isArray(filter.dates)
    ? filter.dates.filter((value): value is number => Number.isFinite(Number(value))).slice(0, 366)
    : [];

  if (dates.length > 0) {
    const placeholders = dates.map((date, index) => {
      replacements[`date${index}`] = Number(date);
      return `:date${index}`;
    });
    conditions.push(`BackupDate IN (${placeholders.join(', ')})`);
  } else if (Number.isFinite(filter.fromDate) && Number.isFinite(filter.toDate)) {
    replacements.fromDate = Number(filter.fromDate);
    replacements.toDate = Number(filter.toDate);
    conditions.push('BackupDate BETWEEN :fromDate AND :toDate');
  } else {
    replacements.fromDate = lastDateFallback - 7;
    replacements.toDate = lastDateFallback;
    conditions.push('BackupDate BETWEEN :fromDate AND :toDate');
  }

  const companies = normalizeCompanies(filter.companies);
  if (companies.length > 0) {
    const placeholders = companies.map((company, index) => {
      replacements[`company${index}`] = company;
      return `:company${index}`;
    });
    conditions.push(`Source IN (${placeholders.join(', ')})`);
  }

  const sql = `SELECT BackupDate%7 AS BackupDate, SUM(IntData) AS IntData, Type
  FROM dbo.BackupMetrics bm
  WHERE ${conditions.join(' AND ')}
  GROUP BY BackupDate%7, Type
  ORDER BY Type, BackupDate`;

  return { sql, replacements };
}
