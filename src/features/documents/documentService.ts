import { mockApi, type CreateDocumentInput, type RenameDocumentInput } from '@shared/api/mockApi';
import type { SpreadsheetDocument } from '@shared/types/domain';

export const documentService = {
  fetchDocuments: (accessToken: string | null) => mockApi.listDocuments(accessToken),
  fetchDocumentById: (accessToken: string | null, id: string) => mockApi.getDocument(accessToken, id),
  createDocument: (accessToken: string | null, input: CreateDocumentInput) => mockApi.createDocument(accessToken, input),
  renameDocument: (accessToken: string | null, input: RenameDocumentInput) => mockApi.renameDocument(accessToken, input),
  duplicateDocument: (accessToken: string | null, id: string) => mockApi.duplicateDocument(accessToken, id),
  deleteDocument: (accessToken: string | null, id: string) => mockApi.deleteDocument(accessToken, id),
  saveDocument: (accessToken: string | null, document: SpreadsheetDocument) => mockApi.saveDocument(accessToken, document),
};

export type { CreateDocumentInput, RenameDocumentInput, SpreadsheetDocument };
