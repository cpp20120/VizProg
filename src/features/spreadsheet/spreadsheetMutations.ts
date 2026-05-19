import { evaluateCells } from '@features/spreadsheet/formula/evaluator';
import { referenceText, replaceFormulaReference } from '@features/spreadsheet/formula/editing';
import { inferCellType, makeCell } from '@features/spreadsheet/spreadsheetModel';
import type { SpreadsheetState } from '@features/spreadsheet/spreadsheetState';
import type { CellAddress, CellPatch, CellStyle, CellsById, SpreadsheetDocument } from '@shared/types/domain';
import { addressesInRange, cellId, normalizeRange } from '@shared/utils/cellAddress';
import { nowIso } from '@shared/utils/date';

export const loadSpreadsheetDocument = (state: SpreadsheetState, document: SpreadsheetDocument): void => {
  state.document = { ...document, cells: evaluateCells(document.cells) };
  state.activeCell = { row: 0, column: 0 };
  state.selectedRange = null;
  state.undoStack = [];
  state.redoStack = [];
  state.formulaEdit = null;
  state.dirty = false;
};

export const selectSpreadsheetCell = (
  state: SpreadsheetState,
  payload: { address: CellAddress; extend: boolean },
): void => {
  if (!state.document) return;
  if (payload.extend && state.activeCell) {
    state.selectedRange = normalizeRange({ start: state.activeCell, end: payload.address });
    return;
  }
  state.activeCell = payload.address;
  state.selectedRange = { start: payload.address, end: payload.address };
};

export const setCellValueInternal = (
  state: SpreadsheetState,
  address: CellAddress,
  rawValue: string,
  recordHistory: boolean,
): void => {
  if (!state.document) return;
  const key = cellId(address);
  const before = state.document.cells[key];
  const after =
    rawValue.trim() === ''
      ? undefined
      : { ...(before ?? makeCell(rawValue)), rawValue, type: inferCellType(rawValue), updatedAt: nowIso() };
  if (after) state.document.cells[key] = after;
  else delete state.document.cells[key];
  state.document.cells = evaluateCells(state.document.cells);
  state.document.updatedAt = nowIso();
  state.dirty = true;
  if (recordHistory) {
    state.undoStack.push({ address, before, after });
    state.redoStack = [];
  }
};

export const applyHistoryPatch = (
  state: SpreadsheetState,
  patch: CellPatch,
  direction: 'undo' | 'redo',
): void => {
  if (!state.document) return;
  const key = cellId(patch.address);
  const value = direction === 'undo' ? patch.before : patch.after;
  if (value) state.document.cells[key] = value;
  else delete state.document.cells[key];
  state.document.cells = evaluateCells(state.document.cells);
  state.document.updatedAt = nowIso();
  state.dirty = true;
};

export const startFormulaEditing = (
  state: SpreadsheetState,
  payload: { target: CellAddress; draft: string },
): void => {
  state.activeCell = payload.target;
  state.selectedRange = { start: payload.target, end: payload.target };
  state.formulaEdit = { target: payload.target, draft: payload.draft, rangeAnchor: null };
};

export const updateFormulaEditingDraft = (state: SpreadsheetState, draft: string): void => {
  if (!state.formulaEdit && state.activeCell) {
    state.formulaEdit = { target: state.activeCell, draft, rangeAnchor: null };
    return;
  }
  if (!state.formulaEdit) return;
  state.formulaEdit.draft = draft;
  if (!draft.startsWith('=')) state.formulaEdit.rangeAnchor = null;
};

export const pickFormulaEditingReference = (
  state: SpreadsheetState,
  payload: { address: CellAddress; extend: boolean },
): void => {
  if (!state.formulaEdit?.draft.startsWith('=')) {
    state.activeCell = payload.address;
    state.selectedRange = { start: payload.address, end: payload.address };
    return;
  }
  const anchor = payload.extend ? (state.formulaEdit.rangeAnchor ?? payload.address) : payload.address;
  const range = normalizeRange({ start: anchor, end: payload.address });
  state.formulaEdit.rangeAnchor = anchor;
  state.formulaEdit.draft = replaceFormulaReference(state.formulaEdit.draft, referenceText(range));
  state.activeCell = state.formulaEdit.target;
  state.selectedRange = range;
};

export const commitFormulaEditing = (state: SpreadsheetState): void => {
  if (!state.formulaEdit) return;
  const { target, draft } = state.formulaEdit;
  setCellValueInternal(state, target, draft, true);
  state.activeCell = target;
  state.selectedRange = { start: target, end: target };
  state.formulaEdit = null;
};

export const cancelFormulaEditing = (state: SpreadsheetState): void => {
  if (!state.formulaEdit) return;
  const target = state.formulaEdit.target;
  state.activeCell = target;
  state.selectedRange = { start: target, end: target };
  state.formulaEdit = null;
};

export const applyStyleToSpreadsheetSelection = (state: SpreadsheetState, style: CellStyle): void => {
  if (!state.document || !state.selectedRange) return;
  addressesInRange(state.selectedRange).forEach((address) => {
    const key = cellId(address);
    if (!state.document) return;
    const current = state.document.cells[key] ?? makeCell('');
    state.document.cells[key] = { ...current, style: { ...current.style, ...style }, updatedAt: nowIso() };
  });
  state.dirty = true;
};

export const toggleTextStyleInSpreadsheetSelection = (
  state: SpreadsheetState,
  property: 'bold' | 'italic' | 'underline',
): void => {
  if (!state.document || !state.selectedRange) return;
  const addresses = addressesInRange(state.selectedRange);
  const shouldEnable = addresses.some((address) => !state.document?.cells[cellId(address)]?.style[property]);
  addresses.forEach((address) => {
    const key = cellId(address);
    if (!state.document) return;
    const current = state.document.cells[key] ?? makeCell('');
    state.document.cells[key] = {
      ...current,
      style: { ...current.style, [property]: shouldEnable },
      updatedAt: nowIso(),
    };
  });
  state.dirty = true;
};

export const clearSpreadsheetSelection = (state: SpreadsheetState): void => {
  if (!state.document || !state.selectedRange) return;
  addressesInRange(state.selectedRange).forEach((address) => setCellValueInternal(state, address, '', true));
};

export const insertSpreadsheetRow = (
  state: SpreadsheetState,
  payload: { index: number; position: 'above' | 'below' },
): void => {
  if (!state.document) return;
  const insertAt = payload.position === 'below' ? payload.index + 1 : payload.index;
  const cells: CellsById = {};
  Object.entries(state.document.cells).forEach(([key, value]) => {
    const match = /^([A-Z]+)([1-9]\d*)$/.exec(key);
    if (!match?.[1] || !match[2]) return;
    const row = Number(match[2]) - 1;
    const newKey = row >= insertAt ? `${match[1]}${row + 2}` : key;
    cells[newKey] = value;
  });
  state.document.cells = evaluateCells(cells);
  state.document.rows += 1;
  state.dirty = true;
};

export const deleteSpreadsheetRow = (state: SpreadsheetState, rowIndex: number): void => {
  if (!state.document || state.document.rows <= 1) return;
  const cells: CellsById = {};
  Object.entries(state.document.cells).forEach(([key, value]) => {
    const match = /^([A-Z]+)([1-9]\d*)$/.exec(key);
    if (!match?.[1] || !match[2]) return;
    const row = Number(match[2]) - 1;
    if (row === rowIndex) return;
    const newKey = row > rowIndex ? `${match[1]}${row}` : key;
    cells[newKey] = value;
  });
  state.document.cells = evaluateCells(cells);
  state.document.rows -= 1;
  state.dirty = true;
};

export const insertSpreadsheetColumn = (
  state: SpreadsheetState,
  payload: { index: number; position: 'left' | 'right' },
): void => {
  if (!state.document) return;
  const insertAt = payload.position === 'right' ? payload.index + 1 : payload.index;
  const cells: CellsById = {};
  Object.entries(state.document.cells).forEach(([key, value]) => {
    const match = /^([A-Z]+)([1-9]\d*)$/.exec(key);
    if (!match?.[1] || !match[2]) return;
    const column = match[1].charCodeAt(0) - 65;
    const newColumn = column >= insertAt ? String.fromCharCode(66 + column) : match[1];
    cells[`${newColumn}${match[2]}`] = value;
  });
  state.document.cells = evaluateCells(cells);
  state.document.columns += 1;
  state.dirty = true;
};

export const deleteSpreadsheetColumn = (state: SpreadsheetState, columnIndex: number): void => {
  if (!state.document || state.document.columns <= 1) return;
  const cells: CellsById = {};
  Object.entries(state.document.cells).forEach(([key, value]) => {
    const match = /^([A-Z]+)([1-9]\d*)$/.exec(key);
    if (!match?.[1] || !match[2]) return;
    const column = match[1].charCodeAt(0) - 65;
    if (column === columnIndex) return;
    const newColumn = column > columnIndex ? String.fromCharCode(64 + column) : match[1];
    cells[`${newColumn}${match[2]}`] = value;
  });
  state.document.cells = evaluateCells(cells);
  state.document.columns -= 1;
  state.dirty = true;
};

export const resizeSpreadsheetColumn = (
  state: SpreadsheetState,
  payload: { column: number; width: number },
): void => {
  if (!state.document) return;
  state.document.columnWidths[payload.column] = Math.max(48, payload.width);
  state.dirty = true;
};

export const resizeSpreadsheetRow = (
  state: SpreadsheetState,
  payload: { row: number; height: number },
): void => {
  if (!state.document) return;
  state.document.rowHeights[payload.row] = Math.max(22, payload.height);
  state.dirty = true;
};

export const copySpreadsheetSelection = (state: SpreadsheetState): void => {
  if (!state.document || !state.selectedRange) return;
  const normalized = normalizeRange(state.selectedRange);
  state.clipboard = {
    rows: Array.from({ length: normalized.end.row - normalized.start.row + 1 }, (_, rowOffset) =>
      Array.from({ length: normalized.end.column - normalized.start.column + 1 }, (_, columnOffset) => {
        const cell =
          state.document?.cells[
            cellId({ row: normalized.start.row + rowOffset, column: normalized.start.column + columnOffset })
          ];
        return { rawValue: cell?.rawValue ?? '', style: cell?.style ?? {} };
      }),
    ),
  };
};

export const cutSpreadsheetSelection = (state: SpreadsheetState): void => {
  copySpreadsheetSelection(state);
  clearSpreadsheetSelection(state);
};

export const pasteSpreadsheetValues = (
  state: SpreadsheetState,
  payload: { start: CellAddress; values: string[][] },
): void => {
  payload.values.forEach((row, rowOffset) =>
    row.forEach((rawValue, columnOffset) =>
      setCellValueInternal(
        state,
        { row: payload.start.row + rowOffset, column: payload.start.column + columnOffset },
        rawValue,
        true,
      ),
    ),
  );
};

export const pasteSpreadsheetClipboard = (state: SpreadsheetState, start: CellAddress): void => {
  if (!state.clipboard) return;
  state.clipboard.rows.forEach((row, rowOffset) =>
    row.forEach((entry, columnOffset) => {
      const address = { row: start.row + rowOffset, column: start.column + columnOffset };
      setCellValueInternal(state, address, entry.rawValue, true);
      const key = cellId(address);
      if (state.document?.cells[key]) state.document.cells[key].style = entry.style;
    }),
  );
};

export const selectWholeSpreadsheet = (state: SpreadsheetState): void => {
  if (!state.document) return;
  state.selectedRange = {
    start: { row: 0, column: 0 },
    end: { row: state.document.rows - 1, column: state.document.columns - 1 },
  };
};

export const markSpreadsheetSaved = (
  state: SpreadsheetState,
  document: SpreadsheetDocument | undefined,
): void => {
  if (document) state.document = { ...document, cells: evaluateCells(document.cells) };
  state.dirty = false;
};
