import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WorkstationMode = 'main' | 'scanner' | 'paint-recipes' | 'theory-lab' | 'perceptual-lab' | 'accessibility-suite' | 'harmony-explorer' | 'trends-inspiration' | 'image-extractor';

export interface UIState {
  currentWorkstation: WorkstationMode;
  isDarkMode: boolean;
  showColorCodes: boolean;
  showPaletteHistory: boolean;
  isExporting: boolean;
  selectedPaletteIndex: number;
  currentColor: string;
}

const initialState: UIState = {
  currentWorkstation: 'main',
  isDarkMode: false,
  showColorCodes: true,
  showPaletteHistory: false,
  isExporting: false,
  selectedPaletteIndex: 0,
  currentColor: '#3498db',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentWorkstation: (state, action: PayloadAction<WorkstationMode>) => {
      state.currentWorkstation = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleColorCodes: (state) => {
      state.showColorCodes = !state.showColorCodes;
    },
    togglePaletteHistory: (state) => {
      state.showPaletteHistory = !state.showPaletteHistory;
    },
    setIsExporting: (state, action: PayloadAction<boolean>) => {
      state.isExporting = action.payload;
    },
    setSelectedPaletteIndex: (state, action: PayloadAction<number>) => {
      state.selectedPaletteIndex = action.payload;
    },
    setCurrentColor: (state, action: PayloadAction<string>) => {
      state.currentColor = action.payload;
    },
  },
});

export const {
  setCurrentWorkstation,
  toggleDarkMode,
  toggleColorCodes,
  togglePaletteHistory,
  setIsExporting,
  setSelectedPaletteIndex,
  setCurrentColor,
} = uiSlice.actions;

export default uiSlice.reducer;
