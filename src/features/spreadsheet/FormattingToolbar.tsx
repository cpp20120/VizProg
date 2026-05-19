import { useAppDispatch, useAppSelector } from '@app/hooks';
import { applyStyleToSelection, toggleTextStyleForSelection } from '@features/spreadsheet/spreadsheetSlice';
import { documentToCsv, downloadTextFile } from '@features/spreadsheet/csv/exportCsv';

export const FormattingToolbar = ({ onImportCsv }: { onImportCsv: (file: File) => void }) => {
  const dispatch = useAppDispatch();
  const document = useAppSelector((state) => state.spreadsheet.document);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);

  const exportJson = () => {
    if (document) downloadTextFile(`${document.name}.json`, JSON.stringify(document, null, 2), 'application/json');
  };

  const exportCsv = () => {
    if (document) downloadTextFile(`${document.name}.csv`, documentToCsv(document), 'text/csv;charset=utf-8');
  };

  return (
    <div className="toolbar">
      <button title="Bold" onClick={() => dispatch(toggleTextStyleForSelection('bold'))}>
        B
      </button>
      <button title="Italic" onClick={() => dispatch(toggleTextStyleForSelection('italic'))}>
        I
      </button>
      <button title="Underline" onClick={() => dispatch(toggleTextStyleForSelection('underline'))}>
        U
      </button>
      <input title="Цвет текста" type="color" onChange={(event) => dispatch(applyStyleToSelection({ textColor: event.target.value }))} />
      <input
        title="Цвет фона"
        type="color"
        onChange={(event) => dispatch(applyStyleToSelection({ backgroundColor: event.target.value }))}
      />
      <select title="Выравнивание" onChange={(event) => dispatch(applyStyleToSelection({ align: event.target.value as 'left' | 'center' | 'right' }))}>
        <option value="left">left</option>
        <option value="center">center</option>
        <option value="right">right</option>
      </select>
      <select
        title="Формат"
        onChange={(event) => dispatch(applyStyleToSelection({ numberFormat: event.target.value as 'default' | 'percent' | 'currency' | 'date' }))}
      >
        <option value="default">number</option>
        <option value="percent">percent</option>
        <option value="currency">currency</option>
        <option value="date">date</option>
      </select>
      <button onClick={exportCsv}>CSV</button>
      <button onClick={exportJson}>JSON</button>
      <label className="file-button">
        Import CSV
        <input type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && onImportCsv(event.target.files[0])} />
      </label>
      <span className={`save-status ${saveStatus}`}>{statusText[saveStatus]}</span>
    </div>
  );
};

const statusText = {
  saved: 'Сохранено',
  saving: 'Сохранение...',
  error: 'Ошибка сохранения',
  dirty: 'Есть изменения',
};
