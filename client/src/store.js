import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/LoginRegister/userSlice";
import classReducer from "./features/Teacher/classSlice";
import courseReducer from "./features/Class/courseSlice";
import { apiSlice } from "./features/apiSlice";
import studentCourseProgressSlice from "./features/Student/studentCourseProgressSlice";
import userAnalyticsSlice from "./features/Student/userAnalyticsSlice";
import quizSubmissionSlice from "./features/Course/Quiz/quizSubmissionSlice";
import activitySubmissionSlice from "./features/Course/CodingActivity/activitySubmissionSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: userReducer,
    class: classReducer,
    course: courseReducer,
    studentProgress: studentCourseProgressSlice,
    userAnalytics: userAnalyticsSlice,
    userQuizSubmission: quizSubmissionSlice,
    userActivitySubmission: activitySubmissionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
