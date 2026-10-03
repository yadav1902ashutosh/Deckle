import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  activePersona: null,
  isInitialised: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;

      state.activePersona =
        action.payload.userData?.personas?.find((p) => p.is_default) ||
        action.payload.userData?.personas?.[0] ||
        null;

      state.isInitialised = true;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.activePersona = null;
      state.isInitialised = true;
    },
    setActivePersona: (state, action) => {
      state.activePersona = action.payload;
    },
  },
});

export const { login, logout, setActivePersona } =
  authSlice.actions;
export default authSlice.reducer;