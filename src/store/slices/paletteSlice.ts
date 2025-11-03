import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MusicalMode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';
export type PaletteType = 'complementary' | 'triadic' | 'tetradic' | 'analogous' | 'split-complementary' | 'square' | 'custom';

export interface Palette {
  id: string;
  name: string;
  colors: string[];
  type: PaletteType;
  musicalMode?: MusicalMode;
  createdAt: number;
}

export interface PaletteState {
  currentPalette: Palette | null;
  savedPalettes: Palette[];
  generatedPalettes: Palette[];
  currentMusicalMode: MusicalMode;
  currentPaletteType: PaletteType;
  currentColor: string;
  recentColors: string[];
}

const initialState: PaletteState = {
  currentPalette: null,
  savedPalettes: [],
  generatedPalettes: [],
  currentMusicalMode: 'major',
  currentPaletteType: 'complementary',
  currentColor: '#3b82f6',
  recentColors: [],
};

const paletteSlice = createSlice({
  name: 'palette',
  initialState,
  reducers: {
    setCurrentPalette: (state, action: PayloadAction<Palette>) => {
      state.currentPalette = action.payload;
    },
    addGeneratedPalette: (state, action: PayloadAction<Palette>) => {
      state.generatedPalettes = [action.payload, ...state.generatedPalettes.slice(0, 9)];
    },
    savePalette: (state, action: PayloadAction<Palette>) => {
      const existingIndex = state.savedPalettes.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.savedPalettes[existingIndex] = action.payload;
      } else {
        state.savedPalettes.push(action.payload);
      }
    },
    deletePalette: (state, action: PayloadAction<string>) => {
      state.savedPalettes = state.savedPalettes.filter(p => p.id !== action.payload);
    },
    setMusicalMode: (state, action: PayloadAction<MusicalMode>) => {
      state.currentMusicalMode = action.payload;
    },
    setPaletteType: (state, action: PayloadAction<PaletteType>) => {
      state.currentPaletteType = action.payload;
    },
    setCurrentColor: (state, action: PayloadAction<string>) => {
      state.currentColor = action.payload;
    },
    addRecentColor: (state, action: PayloadAction<string>) => {
      const color = action.payload;
      state.recentColors = [color, ...state.recentColors.filter(c => c !== color).slice(0, 19)];
    },
  },
});

export const {
  setCurrentPalette,
  addGeneratedPalette,
  savePalette,
  deletePalette,
  setMusicalMode,
  setPaletteType,
  setCurrentColor,
  addRecentColor,
} = paletteSlice.actions;

export default paletteSlice.reducer;
