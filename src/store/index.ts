// Redux Store Configuration
// Centralized state management for the Color Vibe Workstation

import { configureStore } from '@reduxjs/toolkit';
import paletteSlice from './slices/paletteSlice';
import uiSlice from './slices/uiSlice';
import workstationSlice from './slices/workstationSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    palette: paletteSlice,
    ui: uiSlice,
    workstation: workstationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store as default
export default store;
