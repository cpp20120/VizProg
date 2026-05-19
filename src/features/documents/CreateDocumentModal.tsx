import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { createDocument } from '@features/documents/documentsSlice';
import { setCreateDocumentModalOpen } from '@features/ui/uiSlice';

export const CreateDocumentModal = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('Новая таблица');
  const [rows, setRows] = useState(100);
  const [columns, setColumns] = useState(26);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(createDocument({ name, rows, columns }));
    if (createDocument.fulfilled.match(result)) {
      dispatch(setCreateDocumentModalOpen(false));
      void navigate(`/documents/${result.payload.id}`);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" onSubmit={(event) => void submit(event)}>
        <h2>Новый документ</h2>
        <label>
          Название
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Строки
          <input type="number" min={1} max={5000} value={rows} onChange={(event) => setRows(Number(event.target.value))} />
        </label>
        <label>
          Колонки
          <input type="number" min={1} max={26} value={columns} onChange={(event) => setColumns(Number(event.target.value))} />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={() => dispatch(setCreateDocumentModalOpen(false))}>
            Отмена
          </button>
          <button>Создать</button>
        </div>
      </form>
    </div>
  );
};
