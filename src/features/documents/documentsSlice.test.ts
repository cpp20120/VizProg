import { describe, expect, it } from 'vitest';
import { createDocument, deleteDocument, documentsReducer } from '@features/documents/documentsSlice';
import { makeTestDocument } from '@shared/test/mockData';

describe('documentsSlice', () => {
  it('adds and removes document summaries', () => {
    const document = makeTestDocument();
    let state = documentsReducer(undefined, { type: createDocument.fulfilled.type, payload: document });
    expect(state.documents).toHaveLength(1);
    state = documentsReducer(state, { type: deleteDocument.fulfilled.type, payload: document.id });
    expect(state.documents).toHaveLength(0);
  });
});
