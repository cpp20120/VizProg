import type { CellAddress, CellPatch, CellRange, CellStyle, SpreadsheetDocument } from '@shared/types/domain';

export type FormulaEditState = {
  target: CellAddress;
  draft: string;
  rangeAnchor: CellAddress | null;
} | null;

export type SpreadsheetState = {
  document: SpreadsheetDocument | null;
  activeCell: CellAddress | null;
  selectedRange: CellRange | null;
  formulaEdit: FormulaEditState;
  undoStack: CellPatch[];
  redoStack: CellPatch[];
  clipboard: { rows: { rawValue: string; style: CellStyle }[][] } | null;
  dirty: boolean;
};

export const initialSpreadsheetState: SpreadsheetState = {
  document: null,
  activeCell: null,
  selectedRange: null,
  formulaEdit: null,
  undoStack: [],
  redoStack: [],
  clipboard: null,
  dirty: false,
};
