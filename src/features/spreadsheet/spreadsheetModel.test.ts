import { describe, expect, it } from 'vitest';
import { displayCellValue, makeCell } from '@features/spreadsheet/spreadsheetModel';

describe('spreadsheetModel displayCellValue', () => {
  it('formats number, percent and currency values', () => {
    expect(displayCellValue({ ...makeCell('1234.5'), style: { numberFormat: 'default' } })).toBe('1 234,5');
    expect(displayCellValue({ ...makeCell('0.12'), style: { numberFormat: 'percent' } })).toBe('12 %');
    expect(displayCellValue({ ...makeCell('12'), style: { numberFormat: 'currency' } })).toContain('12,00');
  });

  it('formats day.month input as a date in the current year', () => {
    const year = new Date().getFullYear();
    expect(displayCellValue({ ...makeCell('12.02'), style: { numberFormat: 'date' } })).toBe(`12.02.${year}`);
  });
});
