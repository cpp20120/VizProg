import type { CellComputedValue, CellsById } from '@shared/types/domain';
import { cellId } from '@shared/utils/cellAddress';
import { rangeAddresses } from '@features/spreadsheet/formula/references';
import { inferCellType, rawToComputed } from '@features/spreadsheet/spreadsheetModel';

type EvaluationContext = {
  cells: CellsById;
  visiting: Set<string>;
  memo: Map<string, CellComputedValue>;
};

const error = (value: '#ERROR' | '#CYCLE' | '#DIV/0'): CellComputedValue => ({ kind: 'error', value });
const numberResult = (value: number): CellComputedValue =>
  Number.isFinite(value) ? { kind: 'number', value } : error('#DIV/0');

const asNumber = (value: CellComputedValue): number => (value.kind === 'number' ? value.value : 0);

const evaluateCellById = (id: string, context: EvaluationContext): CellComputedValue => {
  const cached = context.memo.get(id);
  if (cached) return cached;
  if (context.visiting.has(id)) return error('#CYCLE');
  const cell = context.cells[id];
  if (!cell) return { kind: 'empty', value: '' };
  if (inferCellType(cell.rawValue) !== 'formula') {
    const result = rawToComputed(cell.rawValue);
    context.memo.set(id, result);
    return result;
  }
  context.visiting.add(id);
  const result = evaluateFormula(cell.rawValue, context);
  context.visiting.delete(id);
  context.memo.set(id, result);
  return result;
};

const valueForOperand = (operand: string, context: EvaluationContext): CellComputedValue =>
  /^[A-Z]/.test(operand) ? evaluateCellById(operand.toUpperCase(), context) : { kind: 'number', value: Number(operand) };

const sumRange = (rangeText: string, context: EvaluationContext): number =>
  rangeAddresses(rangeText).reduce((sum, address) => sum + asNumber(evaluateCellById(cellId(address), context)), 0);

const averageRange = (rangeText: string, context: EvaluationContext): number => {
  const numbers = rangeAddresses(rangeText)
    .map((address) => evaluateCellById(cellId(address), context))
    .filter((value): value is { kind: 'number'; value: number } => value.kind === 'number');
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value.value, 0) / numbers.length;
};

const evaluateFormula = (rawFormula: string, context: EvaluationContext): CellComputedValue => {
  const formula = rawFormula.trim().slice(1).trim().toUpperCase();
  const sumMatch = /^SUM\(([A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*)\)$/.exec(formula);
  if (sumMatch?.[1]) return numberResult(sumRange(sumMatch[1], context));
  const averageMatch = /^AVERAGE\(([A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*)\)$/.exec(formula);
  if (averageMatch?.[1]) return numberResult(averageRange(averageMatch[1], context));

  const binaryMatch = /^([A-Z]+[1-9]\d*|-?\d+(?:\.\d+)?)\s*([+\-*/])\s*([A-Z]+[1-9]\d*|-?\d+(?:\.\d+)?)$/.exec(formula);
  if (!binaryMatch) return error('#ERROR');
  const [, left, operator, right] = binaryMatch;
  if (!left || !operator || !right) return error('#ERROR');
  const leftComputed = valueForOperand(left, context);
  const rightComputed = valueForOperand(right, context);
  if (leftComputed.kind === 'error') return leftComputed;
  if (rightComputed.kind === 'error') return rightComputed;
  const leftValue = asNumber(leftComputed);
  const rightValue = asNumber(rightComputed);
  if (operator === '+') return numberResult(leftValue + rightValue);
  if (operator === '-') return numberResult(leftValue - rightValue);
  if (operator === '*') return numberResult(leftValue * rightValue);
  if (operator === '/') return rightValue === 0 ? error('#DIV/0') : numberResult(leftValue / rightValue);
  return error('#ERROR');
};

export const evaluateCells = (cells: CellsById): CellsById => {
  const context: EvaluationContext = { cells, visiting: new Set(), memo: new Map() };
  const evaluated: CellsById = {};
  Object.entries(cells).forEach(([id, cell]) => {
    evaluated[id] = { ...cell, type: inferCellType(cell.rawValue), computedValue: evaluateCellById(id, context) };
  });
  return evaluated;
};

export const evaluateRawFormula = (rawFormula: string, cells: CellsById): CellComputedValue =>
  evaluateFormula(rawFormula, { cells, visiting: new Set(), memo: new Map() });
