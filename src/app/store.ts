import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { authReducer } from '@features/auth/authSlice';
import { documentsReducer, saveDocument } from '@features/documents/documentsSlice';
import { setSaveStatus, uiReducer } from '@features/ui/uiSlice';
import {
  applyStyleToSelection,
  clearSelection,
  commitFormulaEdit,
  deleteColumn,
  deleteRow,
  insertColumn,
  insertRow,
  markSaved,
  pasteInternalClipboard,
  pasteValues,
  resizeColumn,
  resizeRow,
  redo,
  setCellValue,
  toggleTextStyleForSelection,
  undo,
  spreadsheetReducer,
} from '@features/spreadsheet/spreadsheetSlice';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(
    setCellValue,
    undo,
    redo,
    toggleTextStyleForSelection,
    commitFormulaEdit,
    applyStyleToSelection,
    clearSelection,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    resizeColumn,
    resizeRow,
    pasteValues,
    pasteInternalClipboard,
  ),
  effect: async (_, api) => {
    api.dispatch(setSaveStatus('dirty'));
    api.cancelActiveListeners();
    await api.delay(500);
    const state = api.getState() as RootState;
    if (!state.spreadsheet.document || !state.spreadsheet.dirty) return;
    api.dispatch(setSaveStatus('saving'));
    const result = await api.dispatch(saveDocument(state.spreadsheet.document));
    if (saveDocument.fulfilled.match(result)) {
      api.dispatch(markSaved(result.payload));
      api.dispatch(setSaveStatus('saved'));
    } else {
      api.dispatch(setSaveStatus('error'));
    }
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    spreadsheet: spreadsheetReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
