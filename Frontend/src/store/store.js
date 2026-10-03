import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice.js";
const store = configureStore({
  reducer: {
    auth: authReducer,
    // (Later we can add: book: bookReducer, reader: readerReducer)
  },
});
export default store;
