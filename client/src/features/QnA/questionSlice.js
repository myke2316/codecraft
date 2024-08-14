import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../../LoginRegister/userSlice";

const initialState = {
  questions: [],
  questionDetail: null,
  status: 'idle',
  error: null,
};

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setQuestionDetail: (state, action) => {
      state.questionDetail = action.payload;
    },
    addQuestion: (state, action) => {
      state.questions.push(action.payload);
    },
    updateQuestion: (state, action) => {
      const index = state.questions.findIndex(
        (question) => question._id === action.payload._id
      );
      if (index !== -1) {
        state.questions[index] = action.payload;
      }
    },
    addAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);
      if (question) {
        question.answers.push(answer);
      }
    },
    updateAnswer: (state, action) => {
      const { questionId, answerId, content, codeBlocks, updatedAt } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);
      if (question) {
        const answer = question.answers.find((a) => a._id === answerId);
        if (answer) {
          answer.content = content;
          answer.codeBlocks = codeBlocks;
          answer.updatedAt = updatedAt;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.questions = [];
      state.questionDetail = null;
      state.status = 'idle';
      state.error = null;
    });
  },
});

export const {
  setQuestions,
  setQuestionDetail,
  addQuestion,
  updateQuestion,
  addAnswer,
  updateAnswer
} = questionSlice.actions;
export default questionSlice.reducer;
