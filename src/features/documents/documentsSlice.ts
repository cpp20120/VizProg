import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { documentService, type CreateDocumentInput } from '@features/documents/documentService';
import { loadDocument } from '@features/spreadsheet/spreadsheetSlice';
import { toApiError } from '@shared/api/errors';
import type { DocumentSummary, SpreadsheetDocument } from '@shared/types/domain';
import type { RootState } from '@app/store';

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type DocumentsState = {
  documents: DocumentSummary[];
  activeDocumentId: string | null;
  activeDocument: SpreadsheetDocument | null;
  loadingStatus: LoadingStatus;
  error: string | null;
  lastErrorCode: number | null;
};

const initialState: DocumentsState = {
  documents: [],
  activeDocumentId: null,
  activeDocument: null,
  loadingStatus: 'idle',
  error: null,
  lastErrorCode: null,
};

const token = (state: RootState): string | null => state.auth.accessToken;

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (_, { getState, rejectWithValue }) => {
  try {
    return await documentService.fetchDocuments(token(getState() as RootState));
  } catch (error) {
    return rejectWithValue(toApiError(error));
  }
});

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const document = await documentService.fetchDocumentById(token(getState() as RootState), id);
      dispatch(loadDocument(document));
      return document;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (input: CreateDocumentInput, { getState, rejectWithValue }) => {
    try {
      return await documentService.createDocument(token(getState() as RootState), input);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const renameDocument = createAsyncThunk(
  'documents/renameDocument',
  async (input: { id: string; name: string }, { getState, rejectWithValue }) => {
    try {
      return await documentService.renameDocument(token(getState() as RootState), input);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const duplicateDocument = createAsyncThunk(
  'documents/duplicateDocument',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      return await documentService.duplicateDocument(token(getState() as RootState), id);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      return await documentService.deleteDocument(token(getState() as RootState), id);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const saveDocument = createAsyncThunk(
  'documents/saveDocument',
  async (document: SpreadsheetDocument, { getState, rejectWithValue }) => {
    try {
      return await documentService.saveDocument(token(getState() as RootState), document);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

const errorMessage = (payload: unknown): { message: string; status: number | null } => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const candidate = payload as { message: string; status?: number };
    return { message: candidate.message, status: candidate.status ?? null };
  }
  return { message: 'Ошибка документа', status: null };
};

export const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocument(state, action: PayloadAction<string | null>) {
      state.activeDocumentId = action.payload;
    },
    clearDocumentError(state) {
      state.error = null;
      state.lastErrorCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.loadingStatus = 'succeeded';
        state.error = null;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        const error = errorMessage(action.payload);
        state.loadingStatus = 'failed';
        state.error = error.message;
        state.lastErrorCode = error.status;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.activeDocument = action.payload;
        state.activeDocumentId = action.payload.id;
        state.error = null;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        const error = errorMessage(action.payload);
        state.activeDocument = null;
        state.error = error.message;
        state.lastErrorCode = error.status;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.activeDocument = action.payload;
        state.activeDocumentId = action.payload.id;
        state.documents.unshift(summaryFromDocument(action.payload));
      })
      .addCase(renameDocument.fulfilled, (state, action) => {
        state.documents = state.documents.map((document) =>
          document.id === action.payload.id ? action.payload : document,
        );
        if (state.activeDocument?.id === action.payload.id) state.activeDocument.name = action.payload.name;
      })
      .addCase(duplicateDocument.fulfilled, (state, action) => {
        state.documents.unshift(summaryFromDocument(action.payload));
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((document) => document.id !== action.payload);
        if (state.activeDocumentId === action.payload) {
          state.activeDocumentId = null;
          state.activeDocument = null;
        }
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        state.activeDocument = action.payload;
        state.documents = state.documents.map((document) =>
          document.id === action.payload.id ? summaryFromDocument(action.payload) : document,
        );
      });
  },
});

const summaryFromDocument = (document: SpreadsheetDocument): DocumentSummary => ({
  id: document.id,
  ownerId: document.ownerId,
  name: document.name,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
  rows: document.rows,
  columns: document.columns,
  preview: Array.from({ length: Math.min(3, document.rows) }, (_, row) =>
    Array.from({ length: Math.min(3, document.columns) }, (_, column) => {
      const key = String.fromCharCode(65 + column) + String(row + 1);
      return document.cells[key]?.rawValue ?? '';
    }),
  ),
});

export const { setActiveDocument, clearDocumentError } = documentsSlice.actions;
export const documentsReducer = documentsSlice.reducer;
