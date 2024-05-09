import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/LoginRegister/userSlice";
import { apiSlice } from "./features/apiSlice";
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
