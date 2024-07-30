import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../../LoginRegister/userSlice";

const initialState = {
  activitySubmissions: localStorage.getItem("activitySubmissions")
    ? JSON.parse(localStorage.getItem("activitySubmissions"))
    : {},
};

const activitySubmissionSlice = createSlice({
  name: "activitySubmissions",
  initialState,
  reducers: {
    setActivitySubmission: (state, action) => {
      state.activitySubmissions = {
        ...state.activitySubmissions,
        ...action.payload,
      };
      localStorage.setItem(
        "activitySubmissions",
        JSON.stringify(state.activitySubmissions)
      );
    },
    updateActivitySubmission: (state, action) => {
      const index = state.activitySubmissions.findIndex(
        (submission) => submission.activityId === action.payload.activityId
      );
      if (index !== -1) {
        state.activitySubmissions[index] = action.payload;
      }
      localStorage.setItem(
        "activitySubmissions",
        JSON.stringify(state.activitySubmissions)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.activitySubmissions = [];
      localStorage.removeItem("activitySubmissions");
    });
  },
});

export const { setActivitySubmission, updateActivitySubmission } =
  activitySubmissionSlice.actions;
export default activitySubmissionSlice.reducer;
