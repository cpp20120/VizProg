import type { SpreadsheetDocument } from '@shared/types/domain';
import { cellId } from '@shared/utils/cellAddress';

const escapeCsvValue = (value: string): string => {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
};

export const documentToCsv = (document: SpreadsheetDocument): string => {
  const rows: string[] = [];
  for (let row = 0; row < document.rows; row += 1) {
    const values: string[] = [];
    for (let column = 0; column < document.columns; column += 1) {
      values.push(escapeCsvValue(document.cells[cellId({ row, column })]?.rawValue ?? ''));
    }
    rows.push(values.join(','));
  }
  return rows.join('\n');
};

export const downloadTextFile = (filename: string, content: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
