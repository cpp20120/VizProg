import { describe, expect, it } from 'vitest';
import { evaluateCells } from '@features/spreadsheet/formula/evaluator';
import { makeCell } from '@features/spreadsheet/spreadsheetModel';
import { parseRange } from '@features/spreadsheet/formula/references';

describe('formula engine', () => {
  it('evaluates SUM and AVERAGE ranges', () => {
    const cells = evaluateCells({ A1: makeCell('1'), A2: makeCell('2'), A3: makeCell('x'), B1: makeCell('=SUM(A1:A3)'), B2: makeCell('=AVERAGE(A1:A3)') });
    expect(cells.B1?.computedValue).toEqual({ kind: 'number', value: 3 });
    expect(cells.B2?.computedValue).toEqual({ kind: 'number', value: 1.5 });
  });

  it('evaluates binary expressions', () => {
    const cells = evaluateCells({ A1: makeCell('10'), B1: makeCell('5'), C1: makeCell('=A1+B1'), C2: makeCell('=A1*2') });
    expect(cells.C1?.computedValue).toEqual({ kind: 'number', value: 15 });
    expect(cells.C2?.computedValue).toEqual({ kind: 'number', value: 20 });
  });

  it('handles invalid formulas and cycles', () => {
    const cells = evaluateCells({ A1: makeCell('=wat'), B1: makeCell('=C1+1'), C1: makeCell('=B1+1') });
    expect(cells.A1?.computedValue).toEqual({ kind: 'error', value: '#ERROR' });
    expect(cells.B1?.computedValue).toEqual({ kind: 'error', value: '#CYCLE' });
  });

  it('parses ranges', () => {
    expect(parseRange('A1:A5')).toEqual({ start: { row: 0, column: 0 }, end: { row: 4, column: 0 } });
  });
});
