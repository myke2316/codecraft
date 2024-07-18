import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  userAnalytics: localStorage.getItem("userAnalytics")
    ? JSON.parse(localStorage.getItem("userAnalytics"))
    : {},
};

const userAnalyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setUserAnalytics: (state, action) => {
      state.userAnalytics = { ...state.userAnalytics, ...action.payload };
      localStorage.setItem("userAnalytics", JSON.stringify(state.userAnalytics));
    },
    updateUserAnalyticss: (state, action) => {
      const courseId = action.payload.courseId;
      const courseIndex = state.userAnalytics.courseAnalytics.findIndex(
        (course) => course.courseId === courseId
      );
      if (courseIndex !== -1) {
        state.userAnalytics.courseAnalytics[courseIndex] = action.payload;
        localStorage.setItem(
          "userAnalytics",
          JSON.stringify(state.userAnalytics)
        );
      }
    },
    updateBadge: (state, action) => {
        state.userAnalytics.badges.push(action.payload);
        localStorage.setItem("userAnalytics", JSON.stringify(state.userAnalytics));
      },
  
    
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.userAnalytics = {};
      localStorage.removeItem("userAnalytics");
    });
  },
});

export const { setUserAnalytics, addCourseProgress, updateCourseProgress,updateBadge } =
  userAnalyticsSlice.actions;
export default userAnalyticsSlice.reducer;
