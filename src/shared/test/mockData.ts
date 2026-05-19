import type { SpreadsheetDocument } from '@shared/types/domain';
import { makeCell } from '@features/spreadsheet/spreadsheetModel';

export const makeTestDocument = (overrides: Partial<SpreadsheetDocument> = {}): SpreadsheetDocument => ({
  id: 'doc-1',
  ownerId: 'user-1',
  name: 'Test',
  createdAt: '2026-05-19T00:00:00.000Z',
  updatedAt: '2026-05-19T00:00:00.000Z',
  rows: 100,
  columns: 26,
  cells: {
    A1: makeCell('1'),
    A2: makeCell('2'),
    A3: makeCell('3'),
  },
  rowHeights: {},
  columnWidths: {},
  ...overrides,
});
