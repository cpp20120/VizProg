import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { deleteDocument, duplicateDocument, renameDocument } from '@features/documents/documentsSlice';
import type { DocumentSummary } from '@shared/types/domain';
import { formatDateTime } from '@shared/utils/date';

export const DocumentCard = ({ document }: { document: DocumentSummary }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(document.name);

  const confirmRename = async () => {
    if (name.trim() && name !== document.name) await dispatch(renameDocument({ id: document.id, name }));
    setEditing(false);
  };

  const confirmDelete = async () => {
    if (window.confirm(`Удалить "${document.name}"?`)) await dispatch(deleteDocument(document.id));
  };

  return (
    <article className="document-card">
      {editing ? (
        <input
          value={name}
          onBlur={() => {
            void confirmRename();
          }}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      ) : (
        <button className="linklike card-title" onClick={() => void navigate(`/documents/${document.id}`)}>
          {document.name}
        </button>
      )}
      <div className="doc-meta">Создан: {formatDateTime(document.createdAt)}</div>
      <div className="doc-meta">Изменен: {formatDateTime(document.updatedAt)}</div>
      <div className="preview-grid">
        {document.preview.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => <span key={`${rowIndex}-${columnIndex}`}>{value}</span>),
        )}
      </div>
      <div className="card-actions">
        <button onClick={() => setEditing(true)}>Переименовать</button>
        <button onClick={() => void dispatch(duplicateDocument(document.id))}>Дублировать</button>
        <button
          onClick={() => {
            void confirmDelete();
          }}
        >
          Удалить
        </button>
      </div>
    </article>
  );
};
