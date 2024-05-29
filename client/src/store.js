import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/LoginRegister/userSlice";
import classReducer from "./features/Teacher/classSlice";
import { apiSlice } from "./features/apiSlice";
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: userReducer,
    class: classReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
