import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  applyHistoryPatch,
  applyStyleToSpreadsheetSelection,
  cancelFormulaEditing,
  clearSpreadsheetSelection,
  commitFormulaEditing,
  copySpreadsheetSelection,
  cutSpreadsheetSelection,
  deleteSpreadsheetColumn,
  deleteSpreadsheetRow,
  insertSpreadsheetColumn,
  insertSpreadsheetRow,
  loadSpreadsheetDocument,
  markSpreadsheetSaved,
  pasteSpreadsheetClipboard,
  pasteSpreadsheetValues,
  pickFormulaEditingReference,
  resizeSpreadsheetColumn,
  resizeSpreadsheetRow,
  selectSpreadsheetCell,
  selectWholeSpreadsheet,
  setCellValueInternal,
  startFormulaEditing,
  toggleTextStyleInSpreadsheetSelection,
  updateFormulaEditingDraft,
} from '@features/spreadsheet/spreadsheetMutations';
import { initialSpreadsheetState } from '@features/spreadsheet/spreadsheetState';
import type { CellAddress, CellStyle, SpreadsheetDocument } from '@shared/types/domain';

export type { FormulaEditState, SpreadsheetState } from '@features/spreadsheet/spreadsheetState';

export const spreadsheetSlice = createSlice({
  name: 'spreadsheet',
  initialState: initialSpreadsheetState,
  reducers: {
    loadDocument(state, action: PayloadAction<SpreadsheetDocument>) {
      loadSpreadsheetDocument(state, action.payload);
    },
    selectCell(state, action: PayloadAction<{ address: CellAddress; extend: boolean }>) {
      selectSpreadsheetCell(state, action.payload);
    },
    setCellValue(state, action: PayloadAction<{ address: CellAddress; rawValue: string }>) {
      setCellValueInternal(state, action.payload.address, action.payload.rawValue, true);
      if (
        state.formulaEdit?.target.row === action.payload.address.row &&
        state.formulaEdit.target.column === action.payload.address.column
      ) {
        state.formulaEdit = null;
      }
    },
    startFormulaEdit(state, action: PayloadAction<{ target: CellAddress; draft: string }>) {
      startFormulaEditing(state, action.payload);
    },
    updateFormulaDraft(state, action: PayloadAction<string>) {
      updateFormulaEditingDraft(state, action.payload);
    },
    pickFormulaReference(state, action: PayloadAction<{ address: CellAddress; extend: boolean }>) {
      pickFormulaEditingReference(state, action.payload);
    },
    commitFormulaEdit(state) {
      commitFormulaEditing(state);
    },
    cancelFormulaEdit(state) {
      cancelFormulaEditing(state);
    },
    applyStyleToSelection(state, action: PayloadAction<CellStyle>) {
      applyStyleToSpreadsheetSelection(state, action.payload);
    },
    toggleTextStyleForSelection(state, action: PayloadAction<'bold' | 'italic' | 'underline'>) {
      toggleTextStyleInSpreadsheetSelection(state, action.payload);
    },
    clearSelection(state) {
      clearSpreadsheetSelection(state);
    },
    undo(state) {
      const patch = state.undoStack.pop();
      if (!patch) return;
      applyHistoryPatch(state, patch, 'undo');
      state.redoStack.push(patch);
    },
    redo(state) {
      const patch = state.redoStack.pop();
      if (!patch) return;
      applyHistoryPatch(state, patch, 'redo');
      state.undoStack.push(patch);
    },
    insertRow(state, action: PayloadAction<{ index: number; position: 'above' | 'below' }>) {
      insertSpreadsheetRow(state, action.payload);
    },
    deleteRow(state, action: PayloadAction<number>) {
      deleteSpreadsheetRow(state, action.payload);
    },
    insertColumn(state, action: PayloadAction<{ index: number; position: 'left' | 'right' }>) {
      insertSpreadsheetColumn(state, action.payload);
    },
    deleteColumn(state, action: PayloadAction<number>) {
      deleteSpreadsheetColumn(state, action.payload);
    },
    resizeColumn(state, action: PayloadAction<{ column: number; width: number }>) {
      resizeSpreadsheetColumn(state, action.payload);
    },
    resizeRow(state, action: PayloadAction<{ row: number; height: number }>) {
      resizeSpreadsheetRow(state, action.payload);
    },
    copySelection(state) {
      copySpreadsheetSelection(state);
    },
    cutSelection(state) {
      cutSpreadsheetSelection(state);
    },
    pasteValues(state, action: PayloadAction<{ start: CellAddress; values: string[][] }>) {
      pasteSpreadsheetValues(state, action.payload);
    },
    pasteInternalClipboard(state, action: PayloadAction<CellAddress>) {
      pasteSpreadsheetClipboard(state, action.payload);
    },
    selectAll(state) {
      selectWholeSpreadsheet(state);
    },
    markSaved(state, action: PayloadAction<SpreadsheetDocument | undefined>) {
      markSpreadsheetSaved(state, action.payload);
    },
  },
});

export const {
  loadDocument,
  selectCell,
  setCellValue,
  startFormulaEdit,
  updateFormulaDraft,
  pickFormulaReference,
  commitFormulaEdit,
  cancelFormulaEdit,
  applyStyleToSelection,
  toggleTextStyleForSelection,
  clearSelection,
  undo,
  redo,
  insertRow,
  deleteRow,
  insertColumn,
  deleteColumn,
  resizeColumn,
  resizeRow,
  copySelection,
  cutSelection,
  pasteValues,
  pasteInternalClipboard,
  selectAll,
  markSaved,
} = spreadsheetSlice.actions;

export const spreadsheetReducer = spreadsheetSlice.reducer;
