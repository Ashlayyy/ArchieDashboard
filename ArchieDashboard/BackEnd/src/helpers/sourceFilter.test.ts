import assert from 'node:assert/strict';
import test from 'node:test';
import { Op } from 'sequelize';
import sourceFilter, { normalizeCompanies } from './sourceFilter';

test('normalizeCompanies drops empty values and caps length', () => {
  assert.deepEqual(normalizeCompanies(['', ' Acme ', '']), ['Acme']);
});

test('empty company list means all sources', () => {
  assert.deepEqual(sourceFilter([]), { [Op.not]: null });
});

test('companies use Op.in', () => {
  assert.deepEqual(sourceFilter(['Acme', 'Beta']), { [Op.in]: ['Acme', 'Beta'] });
});
