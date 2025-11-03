// Workstation Slice - Workstation-specific state management
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface WorkstationState {
  activeWorkstation: string;
  workstationSettings: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: WorkstationState = {
  activeWorkstation: 'color-picker',
  workstationSettings: {},
  isLoading: false,
  error: null,
};

// Workstation slice
const workstationSlice = createSlice({
  name: 'workstation',
  initialState,
  reducers: {
    // Set active workstation
    setActiveWorkstation: (state, action: PayloadAction<string>) => {
      state.activeWorkstation = action.payload;
    },

    // Update workstation settings
    updateWorkstationSettings: (state, action: PayloadAction<{ workstation: string; settings: any }>) => {
      const { workstation, settings } = action.payload;
      state.workstationSettings[workstation] = {
        ...state.workstationSettings[workstation],
        ...settings,
      };
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset workstation state
    resetWorkstationState: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  setActiveWorkstation,
  updateWorkstationSettings,
  setLoading,
  setError,
  clearError,
  resetWorkstationState,
} = workstationSlice.actions;

// Export reducer
export default workstationSlice.reducer;
