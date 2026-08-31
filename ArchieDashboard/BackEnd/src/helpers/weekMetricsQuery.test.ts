import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWeekMetricsQuery } from './weekMetricsQuery';

test('week metrics query uses replacements instead of string interpolation', () => {
  const result = buildWeekMetricsQuery(
    {
      companies: ["Acme'; DROP TABLE BackupMetrics;--"],
      dates: [1, 2]
    },
    100
  );

  assert.equal(result.replacements.company0, "Acme'; DROP TABLE BackupMetrics;--");
  assert.equal(result.replacements.date0, 1);
  assert.equal(result.replacements.date1, 2);
  assert.match(result.sql, /Source IN \(:company0\)/);
  assert.doesNotMatch(result.sql, /DROP TABLE/);
});

test('week metrics query binds fromDate and toDate when provided', () => {
  const result = buildWeekMetricsQuery({ fromDate: 10, toDate: 20 }, 99);
  assert.equal(result.replacements.fromDate, 10);
  assert.equal(result.replacements.toDate, 20);
  assert.match(result.sql, /BETWEEN :fromDate AND :toDate/);
});
