import type { CellAddress, CellRange } from '@shared/types/domain';

export const columnToName = (column: number): string => {
  let value = column + 1;
  let name = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
};

export const columnNameToIndex = (name: string): number => {
  const normalized = name.trim().toUpperCase();
  let value = 0;
  for (const char of normalized) value = value * 26 + (char.charCodeAt(0) - 64);
  return value - 1;
};

export const cellId = (address: CellAddress): string => `${columnToName(address.column)}${address.row + 1}`;

export const parseCellId = (id: string): CellAddress | null => {
  const match = /^([A-Z]+)([1-9]\d*)$/i.exec(id.trim());
  if (!match) return null;
  const [, columnName, rowText] = match;
  if (!columnName || !rowText) return null;
  return { row: Number(rowText) - 1, column: columnNameToIndex(columnName) };
};

export const normalizeRange = (range: CellRange): CellRange => ({
  start: {
    row: Math.min(range.start.row, range.end.row),
    column: Math.min(range.start.column, range.end.column),
  },
  end: {
    row: Math.max(range.start.row, range.end.row),
    column: Math.max(range.start.column, range.end.column),
  },
});

export const addressesInRange = (range: CellRange): CellAddress[] => {
  const normalized = normalizeRange(range);
  const addresses: CellAddress[] = [];
  for (let row = normalized.start.row; row <= normalized.end.row; row += 1) {
    for (let column = normalized.start.column; column <= normalized.end.column; column += 1) {
      addresses.push({ row, column });
    }
  }
  return addresses;
};

export const isAddressInRange = (address: CellAddress, range: CellRange | null): boolean => {
  if (!range) return false;
  const normalized = normalizeRange(range);
  return (
    address.row >= normalized.start.row &&
    address.row <= normalized.end.row &&
    address.column >= normalized.start.column &&
    address.column <= normalized.end.column
  );
};
