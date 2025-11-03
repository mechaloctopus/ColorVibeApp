import { configureStore } from '@reduxjs/toolkit';
import colorReducer from './slices/colorSlice';
import paletteReducer from './slices/paletteSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    color: colorReducer,
    palette: paletteReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
