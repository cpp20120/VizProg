import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  cancelFormulaEdit,
  commitFormulaEdit,
  startFormulaEdit,
  updateFormulaDraft,
} from '@features/spreadsheet/spreadsheetSlice';
import { insertAutoClosedParenthesis } from '@features/spreadsheet/formula/editing';
import type { CellAddress } from '@shared/types/domain';
import { cellId } from '@shared/utils/cellAddress';

const isSameAddress = (left: CellAddress, right: CellAddress | null): boolean =>
  left.row === right?.row && left.column === right.column;

export const FormulaBar = () => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const document = useAppSelector((state) => state.spreadsheet.document);
  const formulaEdit = useAppSelector((state) => state.spreadsheet.formulaEdit);
  const key = activeCell ? cellId(activeCell) : '';
  const rawValue = activeCell && document ? (document.cells[key]?.rawValue ?? '') : '';
  const value = formulaEdit && isSameAddress(formulaEdit.target, activeCell) ? formulaEdit.draft : rawValue;

  const startEditing = () => {
    if (activeCell && !formulaEdit) dispatch(startFormulaEdit({ target: activeCell, draft: rawValue }));
  };

  const scheduleCursor = (position: number) => {
    window.requestAnimationFrame(() => inputRef.current?.setSelectionRange(position, position));
  };

  const setDraft = (draft: string) => {
    if (!activeCell) return;
    if (!formulaEdit) dispatch(startFormulaEdit({ target: activeCell, draft }));
    else dispatch(updateFormulaDraft(draft));
  };

  return (
    <div className="formula-bar">
      <span>{key}</span>
      <input
        aria-label="formula"
        ref={inputRef}
        value={value}
        disabled={!activeCell}
        onFocus={startEditing}
        onBlur={() => {
          if (formulaEdit && !formulaEdit.draft.startsWith('=')) dispatch(commitFormulaEdit());
        }}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === '(') {
            const insertion = insertAutoClosedParenthesis(value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd);
            if (insertion) {
              event.preventDefault();
              setDraft(insertion.value);
              scheduleCursor(insertion.cursor);
            }
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            dispatch(commitFormulaEdit());
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            dispatch(cancelFormulaEdit());
          }
        }}
      />
    </div>
  );
};
