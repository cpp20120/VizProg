import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { authReducer } from '@features/auth/authSlice';
import { documentsReducer } from '@features/documents/documentsSlice';
import { spreadsheetReducer } from '@features/spreadsheet/spreadsheetSlice';
import { uiReducer } from '@features/ui/uiSlice';

export const makeTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      documents: documentsReducer,
      spreadsheet: spreadsheetReducer,
      ui: uiReducer,
    },
  });

export const renderWithProviders = (ui: ReactElement) => {
  const store = makeTestStore();
  const view = render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
  return { ...view, store };
};
