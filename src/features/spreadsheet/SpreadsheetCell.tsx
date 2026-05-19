import { memo, useEffect, useRef, useState } from 'react';
import type { CellAddress, CellData } from '@shared/types/domain';
import { displayCellValue } from '@features/spreadsheet/spreadsheetModel';
import { insertAutoClosedParenthesis } from '@features/spreadsheet/formula/editing';

type Props = {
  address: CellAddress;
  cell: CellData | undefined;
  selected: boolean;
  active: boolean;
  width: number;
  height: number;
  onSelect: (address: CellAddress, extend: boolean) => void;
  onCommit: (address: CellAddress, rawValue: string) => void;
  formulaDraft: string | null;
  onStartFormulaEdit: (address: CellAddress, draft: string) => void;
  onFormulaDraftChange: (draft: string) => void;
  onCommitFormulaEdit: () => void;
  onCancelFormulaEdit: () => void;
  onContextMenu: (event: React.MouseEvent, address: CellAddress) => void;
};

export const SpreadsheetCell = memo(
  ({
    address,
    cell,
    selected,
    active,
    width,
    height,
    onSelect,
    onCommit,
    formulaDraft,
    onStartFormulaEdit,
    onFormulaDraftChange,
    onCommitFormulaEdit,
    onCancelFormulaEdit,
    onContextMenu,
  }: Props) => {
    const editorRef = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(cell?.rawValue ?? '');
    const visibleDraft = formulaDraft ?? draft;

    useEffect(() => {
      if (!editing) setDraft(cell?.rawValue ?? '');
    }, [cell?.rawValue, editing]);

    useEffect(() => {
      if (formulaDraft !== null) {
        setEditing(true);
        setDraft(formulaDraft);
      }
    }, [formulaDraft]);

    const commit = () => {
      if (formulaDraft !== null) onCommitFormulaEdit();
      else onCommit(address, draft);
      setEditing(false);
    };

    const cancel = () => {
      if (formulaDraft !== null) onCancelFormulaEdit();
      setEditing(false);
      setDraft(cell?.rawValue ?? '');
    };

    const changeDraft = (value: string) => {
      setDraft(value);
      if (value.startsWith('=')) {
        if (formulaDraft === null) onStartFormulaEdit(address, value);
        else onFormulaDraftChange(value);
      } else if (formulaDraft !== null) {
        onFormulaDraftChange(value);
      }
    };

    const setFormulaAwareDraft = (value: string) => {
      setDraft(value);
      if (formulaDraft === null) onStartFormulaEdit(address, value);
      else onFormulaDraftChange(value);
    };

    const style = cell?.style ?? {};
    return (
      <div
        role="gridcell"
        aria-selected={selected}
        className={`cell ${selected ? 'selected' : ''} ${active ? 'active' : ''}`}
        style={{
          width,
          height,
          fontWeight: style.bold ? 700 : 400,
          fontStyle: style.italic ? 'italic' : 'normal',
          textDecoration: style.underline ? 'underline' : 'none',
          color: style.textColor,
          backgroundColor: style.backgroundColor,
          textAlign: style.align ?? 'left',
        }}
        onClick={(event) => {
          event.preventDefault();
          onSelect(address, event.shiftKey);
        }}
        onDoubleClick={() => setEditing(true)}
        onContextMenu={(event) => onContextMenu(event, address)}
      >
        {editing ? (
          <input
            className="cell-editor"
            ref={editorRef}
            value={visibleDraft}
            autoFocus
            onBlur={() => {
              if (!visibleDraft.startsWith('=')) commit();
            }}
            onChange={(event) => changeDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === '(') {
                const insertion = insertAutoClosedParenthesis(
                  visibleDraft,
                  event.currentTarget.selectionStart,
                  event.currentTarget.selectionEnd,
                );
                if (insertion) {
                  event.preventDefault();
                  setFormulaAwareDraft(insertion.value);
                  window.requestAnimationFrame(() =>
                    editorRef.current?.setSelectionRange(insertion.cursor, insertion.cursor),
                  );
                }
              }
              if (event.key === 'Enter') commit();
              if (event.key === 'Escape') cancel();
            }}
          />
        ) : (
          <span>{cell ? displayCellValue(cell) : ''}</span>
        )}
      </div>
    );
  },
);

SpreadsheetCell.displayName = 'SpreadsheetCell';
