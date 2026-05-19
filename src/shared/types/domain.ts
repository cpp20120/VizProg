export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error';

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  error: string | null;
};

export type CellAddress = {
  row: number;
  column: number;
};

export type CellRange = {
  start: CellAddress;
  end: CellAddress;
};

export type CellRawValue = string;
export type CellType = 'string' | 'number' | 'boolean' | 'formula' | 'empty';
export type CellComputedValue =
  | { kind: 'empty'; value: '' }
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'error'; value: '#ERROR' | '#CYCLE' | '#DIV/0' };

export type HorizontalAlign = 'left' | 'center' | 'right';
export type NumberFormat = 'default' | 'percent' | 'currency' | 'date';

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  align?: HorizontalAlign;
  numberFormat?: NumberFormat;
};

export type CellData = {
  rawValue: CellRawValue;
  computedValue: CellComputedValue;
  type: CellType;
  style: CellStyle;
  updatedAt: string;
};

export type CellsById = Record<string, CellData>;
export type SizeMap = Record<number, number>;

export type SpreadsheetDocument = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rows: number;
  columns: number;
  cells: CellsById;
  rowHeights: SizeMap;
  columnWidths: SizeMap;
};

export type DocumentSummary = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rows: number;
  columns: number;
  preview: string[][];
};

export type SaveStatus = 'saved' | 'saving' | 'error' | 'dirty';

export type ApiErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'UNKNOWN';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status: number;
};

export type FormulaResult = CellComputedValue;

export type CellPatch = {
  address: CellAddress;
  before: CellData | undefined;
  after: CellData | undefined;
};
