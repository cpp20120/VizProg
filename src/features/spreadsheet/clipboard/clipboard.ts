import type { CellAddress, CellsById, CellRange, CellStyle } from '@shared/types/domain';
import { addressesInRange, cellId, normalizeRange } from '@shared/utils/cellAddress';

export type ClipboardCell = {
  rawValue: string;
  style: CellStyle;
};

export type InternalClipboard = {
  origin: CellAddress;
  rows: ClipboardCell[][];
};

export const copyRange = (cells: CellsById, range: CellRange): InternalClipboard => {
  const normalized = normalizeRange(range);
  const rows: ClipboardCell[][] = [];
  for (let row = normalized.start.row; row <= normalized.end.row; row += 1) {
    const values: ClipboardCell[] = [];
    for (let column = normalized.start.column; column <= normalized.end.column; column += 1) {
      const cell = cells[cellId({ row, column })];
      values.push({ rawValue: cell?.rawValue ?? '', style: cell?.style ?? {} });
    }
    rows.push(values);
  }
  return { origin: normalized.start, rows };
};

export const rangeToTsv = (cells: CellsById, range: CellRange): string => {
  const normalized = normalizeRange(range);
  const lines: string[] = [];
  for (let row = normalized.start.row; row <= normalized.end.row; row += 1) {
    const values: string[] = [];
    for (let column = normalized.start.column; column <= normalized.end.column; column += 1) {
      values.push(cells[cellId({ row, column })]?.rawValue ?? '');
    }
    lines.push(values.join('\t'));
  }
  return lines.join('\n');
};

export const parsePastedText = (text: string): string[][] =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split(/\t|,/));

export const singleCellRange = (address: CellAddress): CellRange => ({ start: address, end: address });
export const rangeAddresses = addressesInRange;
