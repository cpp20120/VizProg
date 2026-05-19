import { describe, expect, it } from 'vitest';
import {
  commitFormulaEdit,
  loadDocument,
  pickFormulaReference,
  redo,
  selectCell,
  setCellValue,
  spreadsheetReducer,
  startFormulaEdit,
  toggleTextStyleForSelection,
  undo,
  updateFormulaDraft,
} from '@features/spreadsheet/spreadsheetSlice';
import { makeTestDocument } from '@shared/test/mockData';

describe('spreadsheetSlice', () => {
  it('selects cells and edits values with undo/redo', () => {
    let state = spreadsheetReducer(undefined, loadDocument(makeTestDocument()));
    state = spreadsheetReducer(state, selectCell({ address: { row: 0, column: 0 }, extend: false }));
    state = spreadsheetReducer(state, setCellValue({ address: { row: 0, column: 0 }, rawValue: '42' }));
    expect(state.document?.cells.A1?.rawValue).toBe('42');
    state = spreadsheetReducer(state, undo());
    expect(state.document?.cells.A1?.rawValue).toBe('1');
    state = spreadsheetReducer(state, redo());
    expect(state.document?.cells.A1?.rawValue).toBe('42');
  });

  it('keeps formula target active while picking references and ranges', () => {
    let state = spreadsheetReducer(undefined, loadDocument(makeTestDocument()));
    state = spreadsheetReducer(state, selectCell({ address: { row: 3, column: 2 }, extend: false }));
    state = spreadsheetReducer(state, startFormulaEdit({ target: { row: 3, column: 2 }, draft: '=' }));
    state = spreadsheetReducer(state, updateFormulaDraft('=SUM('));
    state = spreadsheetReducer(state, pickFormulaReference({ address: { row: 0, column: 0 }, extend: false }));
    expect(state.formulaEdit?.draft).toBe('=SUM(A1');
    expect(state.activeCell).toEqual({ row: 3, column: 2 });
    state = spreadsheetReducer(state, pickFormulaReference({ address: { row: 2, column: 0 }, extend: true }));
    expect(state.formulaEdit?.draft).toBe('=SUM(A1:A3');
    expect(state.selectedRange).toEqual({ start: { row: 0, column: 0 }, end: { row: 2, column: 0 } });
    state = spreadsheetReducer(state, updateFormulaDraft(`${state.formulaEdit?.draft ?? ''})`));
    state = spreadsheetReducer(state, commitFormulaEdit());
    expect(state.document?.cells.C4?.rawValue).toBe('=SUM(A1:A3)');
  });

  it('inserts formula references before an auto-closed parenthesis', () => {
    let state = spreadsheetReducer(undefined, loadDocument(makeTestDocument()));
    state = spreadsheetReducer(state, startFormulaEdit({ target: { row: 3, column: 2 }, draft: '=SUM()' }));
    state = spreadsheetReducer(state, pickFormulaReference({ address: { row: 0, column: 0 }, extend: false }));
    expect(state.formulaEdit?.draft).toBe('=SUM(A1)');
    state = spreadsheetReducer(state, pickFormulaReference({ address: { row: 2, column: 0 }, extend: true }));
    expect(state.formulaEdit?.draft).toBe('=SUM(A1:A3)');
  });

  it('toggles bold and preserves redo behavior', () => {
    let state = spreadsheetReducer(undefined, loadDocument(makeTestDocument()));
    state = spreadsheetReducer(state, selectCell({ address: { row: 0, column: 0 }, extend: false }));
    state = spreadsheetReducer(state, toggleTextStyleForSelection('bold'));
    expect(state.document?.cells.A1?.style.bold).toBe(true);
    state = spreadsheetReducer(state, toggleTextStyleForSelection('bold'));
    expect(state.document?.cells.A1?.style.bold).toBe(false);
    state = spreadsheetReducer(state, setCellValue({ address: { row: 0, column: 0 }, rawValue: '9' }));
    state = spreadsheetReducer(state, undo());
    expect(state.document?.cells.A1?.rawValue).toBe('1');
    state = spreadsheetReducer(state, redo());
    expect(state.document?.cells.A1?.rawValue).toBe('9');
  });
});
