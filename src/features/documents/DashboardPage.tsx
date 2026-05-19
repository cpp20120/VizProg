import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { DocumentCard } from '@features/documents/DocumentCard';
import { fetchDocuments } from '@features/documents/documentsSlice';
import { CreateDocumentModal } from '@features/documents/CreateDocumentModal';
import { setCreateDocumentModalOpen } from '@features/ui/uiSlice';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { documents, loadingStatus, error } = useAppSelector((state) => state.documents);
  const modalOpen = useAppSelector((state) => state.ui.createDocumentModalOpen);

  useEffect(() => {
    void dispatch(fetchDocuments());
  }, [dispatch]);

  return (
    <main className="page">
      <div className="page-header">
        <h1>Мои документы</h1>
        <button onClick={() => dispatch(setCreateDocumentModalOpen(true))}>Создать</button>
      </div>
      {loadingStatus === 'loading' && <p>Загрузка...</p>}
      {error && <p className="form-error">{error}</p>}
      <section className="document-grid">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </section>
      {modalOpen && <CreateDocumentModal />}
    </main>
  );
};
