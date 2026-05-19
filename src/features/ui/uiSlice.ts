import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CellAddress, SaveStatus } from '@shared/types/domain';

export type Toast = {
  id: string;
  kind: 'info' | 'success' | 'error';
  message: string;
};

export type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
  address: CellAddress;
} | null;

export type UiState = {
  createDocumentModalOpen: boolean;
  saveStatus: SaveStatus;
  toasts: Toast[];
  contextMenu: ContextMenuState;
};

const initialState: UiState = {
  createDocumentModalOpen: false,
  saveStatus: 'saved',
  toasts: [],
  contextMenu: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCreateDocumentModalOpen(state, action: PayloadAction<boolean>) {
      state.createDocumentModalOpen = action.payload;
    },
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload;
    },
    showContextMenu(state, action: PayloadAction<NonNullable<ContextMenuState>>) {
      state.contextMenu = action.payload;
    },
    closeContextMenu(state) {
      state.contextMenu = null;
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...action.payload, id: crypto.randomUUID() });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { setCreateDocumentModalOpen, setSaveStatus, showContextMenu, closeContextMenu, addToast, removeToast } =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;
