// slices/userProgressSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  progress: localStorage.getItem("progress")
    ? JSON.parse(localStorage.getItem("progress"))
    : [], // This will hold user progress data
};

const userProgressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {},
});

export const {} =
  userProgressSlice.actions;

export default userProgressSlice.reducer;
