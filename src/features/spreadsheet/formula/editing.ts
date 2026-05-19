import type { CellAddress, CellRange } from '@shared/types/domain';
import { columnToName, normalizeRange } from '@shared/utils/cellAddress';

export const addressText = (address: CellAddress): string => `${columnToName(address.column)}${address.row + 1}`;

export const referenceText = (range: CellRange): string => {
  const normalized = normalizeRange(range);
  const start = addressText(normalized.start);
  const end = addressText(normalized.end);
  return start === end ? start : `${start}:${end}`;
};

export const replaceFormulaReference = (draft: string, reference: string): string => {
  if (!draft.startsWith('=')) return draft;
  const referenceBeforeTrailingParens = /([A-Z]+[1-9]\d*(?::[A-Z]+[1-9]\d*)?)(\)*)$/i;
  if (referenceBeforeTrailingParens.test(draft)) {
    return draft.replace(referenceBeforeTrailingParens, `${reference}$2`);
  }
  const trailingParens = /(\)*)$/;
  return draft.replace(trailingParens, `${reference}$1`);
};

export const autoCloseParenthesis = (value: string, previousValue: string, selectionStart: number | null): string => {
  if (selectionStart === null) return value;
  if (value.length !== previousValue.length + 1) return value;
  if (value[selectionStart - 1] !== '(') return value;
  return `${value.slice(0, selectionStart)})${value.slice(selectionStart)}`;
};

export type ParenthesisInsertion = {
  value: string;
  cursor: number;
};

export const insertAutoClosedParenthesis = (
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
): ParenthesisInsertion | null => {
  if (selectionStart === null || selectionEnd === null) return null;
  if (!value.startsWith('=')) return null;
  return {
    value: `${value.slice(0, selectionStart)}()${value.slice(selectionEnd)}`,
    cursor: selectionStart + 1,
  };
};
