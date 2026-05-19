import { describe, expect, it } from 'vitest';
import { documentToCsv } from '@features/spreadsheet/csv/exportCsv';
import { parseCsv } from '@features/spreadsheet/csv/importCsv';
import { makeTestDocument } from '@shared/test/mockData';

describe('csv import/export', () => {
  it('exports raw cell values', () => {
    const csv = documentToCsv(makeTestDocument({ rows: 3, columns: 2 }));
    expect(csv.split('\n')[0]).toBe('1,');
  });

  it('imports 500 rows', () => {
    const input = Array.from({ length: 500 }, (_, index) => `row${index},${index}`).join('\n');
    expect(parseCsv(input)).toHaveLength(500);
  });
});
