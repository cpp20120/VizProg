import { useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { SpreadsheetCell } from '@features/spreadsheet/SpreadsheetCell';
import {
  cancelFormulaEdit,
  commitFormulaEdit,
  pickFormulaReference,
  resizeColumn,
  resizeRow,
  selectCell,
  setCellValue,
  startFormulaEdit,
  updateFormulaDraft,
} from '@features/spreadsheet/spreadsheetSlice';
import { showContextMenu } from '@features/ui/uiSlice';
import { cellId, columnToName, isAddressInRange } from '@shared/utils/cellAddress';
import type { CellAddress } from '@shared/types/domain';

const defaultRowHeight = 28;
const defaultColumnWidth = 110;
const rowHeaderWidth = 52;

export const SpreadsheetGrid = () => {
  const dispatch = useAppDispatch();
  const parentRef = useRef<HTMLDivElement>(null);
  const document = useAppSelector((state) => state.spreadsheet.document);
  const activeCell = useAppSelector((state) => state.spreadsheet.activeCell);
  const selectedRange = useAppSelector((state) => state.spreadsheet.selectedRange);
  const formulaEdit = useAppSelector((state) => state.spreadsheet.formulaEdit);

  const rowVirtualizer = useVirtualizer({
    count: document?.rows ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => document?.rowHeights[index] ?? defaultRowHeight,
    overscan: 12,
  });
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: document?.columns ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => document?.columnWidths[index] ?? defaultColumnWidth,
    overscan: 4,
  });

  useEffect(() => {
    if (!document) return;
    Object.entries(document.columnWidths).forEach(([column, width]) => {
      columnVirtualizer.resizeItem(Number(column), width);
    });
  }, [columnVirtualizer, document]);

  useEffect(() => {
    if (!document) return;
    Object.entries(document.rowHeights).forEach(([row, height]) => {
      rowVirtualizer.resizeItem(Number(row), height);
    });
  }, [document, rowVirtualizer]);

  const onSelect = useCallback(
    (address: CellAddress, extend: boolean) => {
      if (formulaEdit?.draft.startsWith('=')) dispatch(pickFormulaReference({ address, extend }));
      else dispatch(selectCell({ address, extend }));
    },
    [dispatch, formulaEdit],
  );
  const onCommit = useCallback(
    (address: CellAddress, rawValue: string) => dispatch(setCellValue({ address, rawValue })),
    [dispatch],
  );
  const openContext = useCallback(
    (event: React.MouseEvent, address: CellAddress) => {
      event.preventDefault();
      dispatch(showContextMenu({ open: true, x: event.clientX, y: event.clientY, address }));
    },
    [dispatch],
  );

  if (!document) return <div className="grid-empty">Документ не загружен</div>;

  return (
    <div className="grid-viewport" ref={parentRef}>
      <div className="grid-canvas" style={{ width: columnVirtualizer.getTotalSize() + rowHeaderWidth, height: rowVirtualizer.getTotalSize() + defaultRowHeight }}>
        <div className="corner-cell" style={{ width: rowHeaderWidth, height: defaultRowHeight }} />
        {columnVirtualizer.getVirtualItems().map((column) => {
          const width = document.columnWidths[column.index] ?? defaultColumnWidth;
          return (
            <div key={column.key} className="column-header" style={{ transform: `translateX(${column.start + rowHeaderWidth}px)`, width, height: defaultRowHeight }}>
              {columnToName(column.index)}
              <span
                className="resize-handle vertical"
                onMouseDown={(event) => {
                  const startX = event.clientX;
                  const startWidth = width;
                  const move = (moveEvent: MouseEvent) => dispatch(resizeColumn({ column: column.index, width: startWidth + moveEvent.clientX - startX }));
                  const up = () => {
                    window.removeEventListener('mousemove', move);
                    window.removeEventListener('mouseup', up);
                  };
                  window.addEventListener('mousemove', move);
                  window.addEventListener('mouseup', up);
                }}
              />
            </div>
          );
        })}
        {rowVirtualizer.getVirtualItems().map((row) => {
          const height = document.rowHeights[row.index] ?? defaultRowHeight;
          return (
            <div key={row.key}>
              <div className="row-header" style={{ transform: `translateY(${row.start + defaultRowHeight}px)`, width: rowHeaderWidth, height }}>
                {row.index + 1}
                <span
                  className="resize-handle horizontal"
                  onMouseDown={(event) => {
                    const startY = event.clientY;
                    const startHeight = height;
                    const move = (moveEvent: MouseEvent) => dispatch(resizeRow({ row: row.index, height: startHeight + moveEvent.clientY - startY }));
                    const up = () => {
                      window.removeEventListener('mousemove', move);
                      window.removeEventListener('mouseup', up);
                    };
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                  }}
                />
              </div>
              {columnVirtualizer.getVirtualItems().map((column) => {
                const address = { row: row.index, column: column.index };
                const width = document.columnWidths[column.index] ?? defaultColumnWidth;
                const key = cellId(address);
                return (
                  <div key={`${row.key}-${column.key}`} className="cell-position" style={{ transform: `translate(${column.start + rowHeaderWidth}px, ${row.start + defaultRowHeight}px)` }}>
                    <SpreadsheetCell
                      address={address}
                      cell={document.cells[key]}
                      selected={isAddressInRange(address, selectedRange)}
                      active={activeCell?.row === row.index && activeCell.column === column.index}
                      width={width}
                      height={height}
                      onSelect={onSelect}
                      onCommit={onCommit}
                      formulaDraft={
                        formulaEdit?.target.row === address.row && formulaEdit.target.column === address.column
                          ? formulaEdit.draft
                          : null
                      }
                      onStartFormulaEdit={(target, draft) => dispatch(startFormulaEdit({ target, draft }))}
                      onFormulaDraftChange={(draft) => dispatch(updateFormulaDraft(draft))}
                      onCommitFormulaEdit={() => dispatch(commitFormulaEdit())}
                      onCancelFormulaEdit={() => dispatch(cancelFormulaEdit())}
                      onContextMenu={openContext}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
