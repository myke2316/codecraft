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
    setDecrementTries: (state, action) => {
      const { courseId, lessonId, activityId } = action.payload;
      const course = state.activitySubmissions.courses.find(
        (course) => course.courseId === courseId
      );
      if (course) {
        const lesson = course.lessons.find(
          (lesson) => lesson.lessonId === lessonId
        );
        if (lesson) {
          const activity = lesson.activities.find(
            (activity) => activity.activityId === activityId
          );
          if (activity && activity.tries > 0) {
            activity.tries -= 1;
            localStorage.setItem(
              "activitySubmissions",
              JSON.stringify(state.activitySubmissions)
            );
          }
        }
      }
    }, resetActivity: (state, action) => {
      state.activitySubmissions= {}
       },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.activitySubmissions = [];
      localStorage.removeItem("activitySubmissions");
    });
  },
});

export const { resetActivity,setActivitySubmission, updateActivitySubmission,setDecrementTries } =
  activitySubmissionSlice.actions;
export default activitySubmissionSlice.reducer;
