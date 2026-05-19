import { useEffect } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { fetchDocumentById, saveDocument } from '@features/documents/documentsSlice';
import { FormattingToolbar } from '@features/spreadsheet/FormattingToolbar';
import { FormulaBar } from '@features/spreadsheet/FormulaBar';
import { SpreadsheetGrid } from '@features/spreadsheet/SpreadsheetGrid';
import { parseCsv } from '@features/spreadsheet/csv/importCsv';
import {
  clearSelection,
  copySelection,
  cutSelection,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  markSaved,
  pasteInternalClipboard,
  pasteValues,
  redo,
  selectAll,
  setCellValue,
  toggleTextStyleForSelection,
  undo,
} from '@features/spreadsheet/spreadsheetSlice';
import { closeContextMenu, setSaveStatus } from '@features/ui/uiSlice';
import { parsePastedText, rangeToTsv } from '@features/spreadsheet/clipboard/clipboard';

const isTextEditingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, [contenteditable="true"]'));
};

export const SpreadsheetPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { documentId } = useParams();
  const document = useAppSelector((state) => state.spreadsheet.document);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const selectedRange = useAppSelector((state) => state.spreadsheet.selectedRange);
  const dirty = useAppSelector((state) => state.spreadsheet.dirty);
  const contextMenu = useAppSelector((state) => state.ui.contextMenu);
  const lastErrorCode = useAppSelector((state) => state.documents.lastErrorCode);

  useEffect(() => {
    if (documentId) void dispatch(fetchDocumentById(documentId));
  }, [dispatch, documentId]);

  useEffect(() => {
    if (lastErrorCode === 403 || lastErrorCode === 404) void navigate('/dashboard', { replace: true });
  }, [lastErrorCode, navigate]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      Object.assign(event, { returnValue: '' });
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Есть несохраненные изменения. Продолжить переход?')) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const ctrl = event.ctrlKey || event.metaKey;
      const isEditingText = isTextEditingTarget(event.target);
      if (!activeCell) return;
      if (ctrl && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (document) {
          dispatch(setSaveStatus('saving'));
          void dispatch(saveDocument(document)).then((result) => {
            if (saveDocument.fulfilled.match(result)) {
              dispatch(markSaved(result.payload));
              dispatch(setSaveStatus('saved'));
            } else dispatch(setSaveStatus('error'));
          });
        }
      } else if (ctrl && event.code === 'KeyZ' && event.shiftKey) {
        event.preventDefault();
        dispatch(redo());
      } else if (ctrl && event.code === 'KeyZ') {
        event.preventDefault();
        dispatch(undo());
      } else if (ctrl && event.code === 'KeyY') {
        event.preventDefault();
        dispatch(redo());
      } else if (ctrl && event.code === 'KeyB') {
        event.preventDefault();
        dispatch(toggleTextStyleForSelection('bold'));
      } else if (ctrl && event.code === 'KeyI') {
        event.preventDefault();
        dispatch(toggleTextStyleForSelection('italic'));
      } else if (ctrl && event.code === 'KeyU') {
        event.preventDefault();
        dispatch(toggleTextStyleForSelection('underline'));
      } else if (ctrl && event.code === 'KeyA') {
        if (isEditingText) return;
        event.preventDefault();
        dispatch(selectAll());
      } else if (ctrl && event.code === 'KeyC') {
        if (document && selectedRange) void navigator.clipboard.writeText(rangeToTsv(document.cells, selectedRange));
        dispatch(copySelection());
      } else if (ctrl && event.code === 'KeyX') {
        dispatch(cutSelection());
      } else if (ctrl && event.code === 'KeyV') {
        event.preventDefault();
        void navigator.clipboard.readText().then((text) => {
          if (text) dispatch(pasteValues({ start: activeCell, values: parsePastedText(text) }));
          else dispatch(pasteInternalClipboard(activeCell));
        });
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        dispatch(clearSelection());
      } else if (event.key === 'Tab') {
        event.preventDefault();
        dispatch({ type: 'spreadsheet/selectCell', payload: { address: { row: activeCell.row, column: activeCell.column + 1 }, extend: false } });
      } else if (event.key === 'Enter') {
        const value = document?.cells[`${String.fromCharCode(65 + activeCell.column)}${activeCell.row + 1}`]?.rawValue ?? '';
        dispatch(setCellValue({ address: activeCell, rawValue: value }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCell, dispatch, document, selectedRange]);

  const importCsv = (file: File) => {
    void file.text().then((text) => {
      const values = parseCsv(text);
      dispatch(pasteValues({ start: { row: 0, column: 0 }, values }));
    });
  };

  if (!document) return <main className="page">Загрузка документа...</main>;

  return (
    <main className="spreadsheet-page" onClick={() => contextMenu && dispatch(closeContextMenu())}>
      <FormattingToolbar onImportCsv={importCsv} />
      <FormulaBar />
      <SpreadsheetGrid />
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
          <button onClick={() => dispatch(insertRow({ index: contextMenu.address.row, position: 'above' }))}>Строка выше</button>
          <button onClick={() => dispatch(insertRow({ index: contextMenu.address.row, position: 'below' }))}>Строка ниже</button>
          <button onClick={() => dispatch(deleteRow(contextMenu.address.row))}>Удалить строку</button>
          <button onClick={() => dispatch(insertColumn({ index: contextMenu.address.column, position: 'left' }))}>Колонка слева</button>
          <button onClick={() => dispatch(insertColumn({ index: contextMenu.address.column, position: 'right' }))}>Колонка справа</button>
          <button onClick={() => dispatch(deleteColumn(contextMenu.address.column))}>Удалить колонку</button>
        </div>
      )}
    </main>
  );
};
