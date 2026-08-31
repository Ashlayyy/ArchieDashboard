import { BackupMetricsServiceFilter } from '../module/backupmetrics/types/BackupMetricsServiceFilter';
import { normalizeCompanies } from './sourceFilter';

export type ValidatedMetricsBody = {
  ok: true;
  value: BackupMetricsServiceFilter & { months?: number };
};

export type InvalidMetricsBody = {
  ok: false;
  error: string;
};

export default function validateMetricsBody(body: unknown): ValidatedMetricsBody | InvalidMetricsBody {
  if (body == null) {
    return { ok: true, value: {} };
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be an object' };
  }

  const payload = body as Record<string, unknown>;
  const value: BackupMetricsServiceFilter & { months?: number } = {};

  if (payload.companies !== undefined) {
    if (!Array.isArray(payload.companies)) {
      return { ok: false, error: 'companies must be an array of strings' };
    }
    value.companies = normalizeCompanies(payload.companies as string[]);
  }

  if (payload.fromDate !== undefined) {
    const fromDate = Number(payload.fromDate);
    if (!Number.isFinite(fromDate)) {
      return { ok: false, error: 'fromDate must be a number' };
    }
    value.fromDate = fromDate;
  }

  if (payload.toDate !== undefined) {
    const toDate = Number(payload.toDate);
    if (!Number.isFinite(toDate)) {
      return { ok: false, error: 'toDate must be a number' };
    }
    value.toDate = toDate;
  }

  if (payload.dates !== undefined) {
    if (!Array.isArray(payload.dates)) {
      return { ok: false, error: 'dates must be an array of numbers' };
    }
    const dates = payload.dates.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    if (dates.length !== payload.dates.length) {
      return { ok: false, error: 'dates must contain only numbers' };
    }
    value.dates = dates.slice(0, 366);
  }

  if (payload.months !== undefined) {
    const months = Number(payload.months);
    if (!Number.isInteger(months) || months < 1 || months > 24) {
      return { ok: false, error: 'months must be an integer between 1 and 24' };
    }
    value.months = months;
  }

  return { ok: true, value };
}
