import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../../LoginRegister/userSlice";

const initialState = {
  quizSubmissions: localStorage.getItem("quizSubmissions")
    ? JSON.parse(localStorage.getItem("quizSubmissions"))
    : {}
};

const quizSubmissionSlice = createSlice({
  name: "quizSubmissions",
  initialState,
  reducers: {
   setQuizSubmission: (state, action) => {
    state.quizSubmissions = { ...state.quizSubmissions, ...action.payload };
     
      localStorage.setItem(
        "quizSubmissions",
        JSON.stringify(state.quizSubmissions)
      );
    },
    updateQuizSubmission: (state, action) => {
      const index = state.quizSubmissions.findIndex(
        (submission) => submission.quizId === action.payload.quizId
      );
      if (index !== -1) {
        state.quizSubmissions[index] = action.payload;
      }
      localStorage.setItem(
        "quizSubmissions",
        JSON.stringify(state.quizSubmissions)
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.quizSubmissions = [];
      localStorage.removeItem("quizSubmissions");
    });
  },
});

export const { setQuizSubmission, updateQuizSubmission } =
  quizSubmissionSlice.actions;
export default quizSubmissionSlice.reducer;
