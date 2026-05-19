import type { CellAddress, CellRange } from '@shared/types/domain';
import { addressesInRange, parseCellId } from '@shared/utils/cellAddress';

export const parseRange = (text: string): CellRange | null => {
  const [start, end] = text.split(':');
  if (!start || !end) return null;
  const startAddress = parseCellId(start);
  const endAddress = parseCellId(end);
  if (!startAddress || !endAddress) return null;
  return { start: startAddress, end: endAddress };
};

export const extractCellReferences = (formula: string): CellAddress[] => {
  const refs = new Map<string, CellAddress>();
  for (const match of formula.matchAll(/\b([A-Z]+[1-9]\d*)\b/gi)) {
    const id = match[1];
    const address = id ? parseCellId(id.toUpperCase()) : null;
    if (address && id) refs.set(id.toUpperCase(), address);
  }
  return [...refs.values()];
};

export const rangeAddresses = (rangeText: string): CellAddress[] => {
  const range = parseRange(rangeText);
  return range ? addressesInRange(range) : [];
};
