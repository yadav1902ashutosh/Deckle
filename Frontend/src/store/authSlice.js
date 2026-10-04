import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  user: null,
  userData: null,
  personas: [],
  activePersona: null,
  isInitialised: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const payload = action.payload?.userData || action.payload || {};
      const user = payload.user || (payload.email || payload.username ? payload : null);
      const personas = payload.personas || action.payload?.personas || [];

      state.status = true;
      state.user = user;
      state.userData = user;
      state.personas = personas;
      state.activePersona =
        personas?.find((p) => p.is_default) ||
        personas?.[0] ||
        null;
      state.isInitialised = true;
    },
    logout: (state) => {
      state.status = false;
      state.user = null;
      state.userData = null;
      state.personas = [];
      state.activePersona = null;
      state.isInitialised = true;
    },
    setActivePersona: (state, action) => {
      state.activePersona = action.payload;
    },
    updateActivePersona: (state, action) => {
      if (state.activePersona) {
        state.activePersona = {
          ...state.activePersona,
          ...action.payload,
        };
      }
      if (state.personas?.length && action.payload?.id) {
        state.personas = state.personas.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        );
      }
    },
  },
});

export const { login, logout, setActivePersona, updateActivePersona } =
  authSlice.actions;
export default authSlice.reducer;