import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ColorState {
  currentColor: {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
  };
  selectedColors: string[];
  recentColors: string[];
}

const initialState: ColorState = {
  currentColor: {
    hue: 180,
    saturation: 50,
    lightness: 50,
    alpha: 1,
  },
  selectedColors: [],
  recentColors: [],
};

const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    setCurrentColor: (state, action: PayloadAction<{ hue: number; saturation: number; lightness: number; alpha?: number }>) => {
      state.currentColor = { ...state.currentColor, ...action.payload };
    },
    addSelectedColor: (state, action: PayloadAction<string>) => {
      if (!state.selectedColors.includes(action.payload)) {
        state.selectedColors.push(action.payload);
      }
    },
    removeSelectedColor: (state, action: PayloadAction<string>) => {
      state.selectedColors = state.selectedColors.filter(color => color !== action.payload);
    },
    addRecentColor: (state, action: PayloadAction<string>) => {
      state.recentColors = [action.payload, ...state.recentColors.filter(color => color !== action.payload)].slice(0, 20);
    },
    clearSelectedColors: (state) => {
      state.selectedColors = [];
    },
  },
});

export const {
  setCurrentColor,
  addSelectedColor,
  removeSelectedColor,
  addRecentColor,
  clearSelectedColors,
} = colorSlice.actions;

export default colorSlice.reducer;
