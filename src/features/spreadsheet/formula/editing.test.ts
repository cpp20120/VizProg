import { describe, expect, it } from 'vitest';
import {
  autoCloseParenthesis,
  insertAutoClosedParenthesis,
  replaceFormulaReference,
} from '@features/spreadsheet/formula/editing';

describe('formula editing helpers', () => {
  it('auto-closes opening parenthesis', () => {
    expect(autoCloseParenthesis('=SUM(', '=SUM', 5)).toBe('=SUM()');
    expect(insertAutoClosedParenthesis('=SUM', 4, 4)).toEqual({ value: '=SUM()', cursor: 5 });
  });

  it('inserts and replaces references inside closing parenthesis', () => {
    expect(replaceFormulaReference('=SUM()', 'A1')).toBe('=SUM(A1)');
    expect(replaceFormulaReference('=SUM(A1)', 'A1:A3')).toBe('=SUM(A1:A3)');
  });
});
