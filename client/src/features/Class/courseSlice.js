import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  courseData: localStorage.getItem("courseData")
    ? JSON.parse(localStorage.getItem("courseData"))
    : [],
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourse: (state, action) => {
      state.courseData = action.payload;
      localStorage.setItem("courseData", JSON.stringify(state.courseData));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.courseData = null;
      localStorage.removeItem("courseData");
    });
  },
});

export const { setCourse } = courseSlice.actions;
export default courseSlice.reducer;
