import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  userProgress: localStorage.getItem("userProgress")
    ? JSON.parse(localStorage.getItem("userProgress"))
    : {},
};

const userProgressSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setUserProgress: (state, action) => {
      state.userProgress = { ...state.userProgress, ...action.payload };
      localStorage.setItem("userProgress", JSON.stringify(state.userProgress));
    },
    addCourseProgress: (state, action) => {
      state.userProgress.coursesProgress.push(action.payload);
      localStorage.setItem("userProgress", JSON.stringify(state.userProgress));
    },
    updateCourseProgress: (state, action) => {
      const courseId = action.payload.courseId;
      const courseIndex = state.userProgress.courseProgress.findIndex(
        (course) => course.courseId === courseId
      );
      if (courseIndex !== -1) {
        state.userProgress.coursesProgress[courseIndex] = action.payload;
        localStorage.setItem(
          "userProgress",
          JSON.stringify(state.userProgress)
        );
      }
    },
    // Add more reducers for updating lesson progress, quiz progress, etc.
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.userProgress = {};
      localStorage.removeItem("userProgress");
    });
  },
});

export const { setUserProgress, addCourseProgress, updateCourseProgress } =
  userProgressSlice.actions;
export default userProgressSlice.reducer;
