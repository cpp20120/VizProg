import type { CellComputedValue, CellData, CellRawValue, CellType } from '@shared/types/domain';
import { nowIso } from '@shared/utils/date';

export const inferCellType = (rawValue: CellRawValue): CellType => {
  const value = rawValue.trim();
  if (value === '') return 'empty';
  if (value.startsWith('=')) return 'formula';
  if (value === 'true' || value === 'false') return 'boolean';
  if (!Number.isNaN(Number(value))) return 'number';
  return 'string';
};

export const rawToComputed = (rawValue: CellRawValue): CellComputedValue => {
  const type = inferCellType(rawValue);
  if (type === 'empty') return { kind: 'empty', value: '' };
  if (type === 'boolean') return { kind: 'boolean', value: rawValue.trim() === 'true' };
  if (type === 'number') return { kind: 'number', value: Number(rawValue.trim()) };
  if (type === 'formula') return { kind: 'string', value: rawValue };
  return { kind: 'string', value: rawValue };
};

export const makeCell = (rawValue: CellRawValue, type = inferCellType(rawValue)): CellData => ({
  rawValue,
  computedValue: type === 'formula' ? { kind: 'string', value: rawValue } : rawToComputed(rawValue),
  type,
  style: {},
  updatedAt: nowIso(),
});

export const displayComputedValue = (value: CellComputedValue): string => {
  if (value.kind === 'empty') return '';
  if (value.kind === 'boolean') return value.value ? 'TRUE' : 'FALSE';
  return String(value.value);
};

const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 });
const percentFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'percent',
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const parseDateValue = (rawValue: string, computedValue: CellComputedValue): Date | null => {
  const trimmed = rawValue.trim();
  const dayMonthMatch = /^(\d{1,2})[./-](\d{1,2})$/.exec(trimmed);
  if (dayMonthMatch?.[1] && dayMonthMatch[2]) {
    const day = Number(dayMonthMatch[1]);
    const month = Number(dayMonthMatch[2]);
    const year = new Date().getFullYear();
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  const fullDateMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(trimmed);
  if (fullDateMatch?.[1] && fullDateMatch[2] && fullDateMatch[3]) {
    const day = Number(fullDateMatch[1]);
    const month = Number(fullDateMatch[2]);
    const rawYear = Number(fullDateMatch[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  if (computedValue.kind === 'number') {
    const excelEpoch = Date.UTC(1899, 11, 30);
    return new Date(excelEpoch + computedValue.value * 86_400_000);
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

export const displayCellValue = (cell: CellData): string => {
  const format = cell.style.numberFormat ?? 'default';
  if (cell.computedValue.kind === 'error') return cell.computedValue.value;
  if (format === 'date') {
    const date = parseDateValue(cell.rawValue, cell.computedValue);
    return date ? dateFormatter.format(date) : displayComputedValue(cell.computedValue);
  }
  if (cell.computedValue.kind !== 'number') return displayComputedValue(cell.computedValue);
  if (format === 'percent') return percentFormatter.format(cell.computedValue.value);
  if (format === 'currency') return currencyFormatter.format(cell.computedValue.value);
  return numberFormatter.format(cell.computedValue.value);
};
