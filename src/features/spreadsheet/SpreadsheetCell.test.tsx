import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpreadsheetCell } from '@features/spreadsheet/SpreadsheetCell';
import { makeCell } from '@features/spreadsheet/spreadsheetModel';

describe('SpreadsheetCell', () => {
  it('selects on click and edits on double click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onCommit = vi.fn();
    render(
      <SpreadsheetCell
        address={{ row: 0, column: 0 }}
        cell={makeCell('1')}
        selected={false}
        active
        width={100}
        height={28}
        onSelect={onSelect}
        onCommit={onCommit}
        formulaDraft={null}
        onStartFormulaEdit={vi.fn()}
        onFormulaDraftChange={vi.fn()}
        onCommitFormulaEdit={vi.fn()}
        onCancelFormulaEdit={vi.fn()}
        onContextMenu={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('gridcell'));
    expect(onSelect).toHaveBeenCalledWith({ row: 0, column: 0 }, false);
    await user.dblClick(screen.getByRole('gridcell'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '=A1+B1{Enter}');
    expect(onCommit).toHaveBeenCalledWith({ row: 0, column: 0 }, '=A1+B1');
  });
});
