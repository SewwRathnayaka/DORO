// src/state/appSlice.ts
// UI + navigation + modal state

export interface AppState {
  currentScreen: string;
  modalVisible: string | null;
  menuVisible: boolean;
}

export interface AppActions {
  setCurrentScreen: (screenId: string) => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

// This is a type definition file - actual implementation is in store.ts
