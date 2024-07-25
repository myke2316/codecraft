import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../LoginRegister/userSlice";

const initialState = {
  userAnalytics: localStorage.getItem("userAnalytics")
    ? JSON.parse(localStorage.getItem("userAnalytics"))
    : [] ,
};

const userAnalyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setUserAnalytics: (state, action) => {
      state.userAnalytics = { ...state.userAnalytics, ...action.payload };
      localStorage.setItem(
        "userAnalytics",
        JSON.stringify(state.userAnalytics)
      );
    },
    updateUserAnalytics: (state, action) => {
      state.userAnalytics = action.payload;
      localStorage.setItem("userAnalytics", JSON.stringify(state.userAnalytics));
    },

    updateBadge: (state, action) => {
      if (!state.userAnalytics.badges) {
        state.userAnalytics.badges = [];
      }
      state.userAnalytics.badges.push(action.payload);
      localStorage.setItem(
        "userAnalytics",
        JSON.stringify(state.userAnalytics)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.userAnalytics = {};
      localStorage.removeItem("userAnalytics");
    });
  },
});

export const {
  setUserAnalytics,
  updateUserAnalytics,
  updateBadge,
} = userAnalyticsSlice.actions;
export default userAnalyticsSlice.reducer;
