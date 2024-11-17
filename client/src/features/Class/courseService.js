import { COURSE_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const courseService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourseData: builder.mutation({
      query: () => ({
        url: `${COURSE_URL}/fetch`,
        method: "GET",
      }),
    }),
    getCourseDataQ: builder.query({
      query: () => ({
        url: `${COURSE_URL}/fetch`,
        method: "GET",
      }),
    }),
    updateCourseTitle: builder.mutation({
      query: (data) => ({
        url: `${COURSE_URL}/update-course-title`,
        method: "PUT",
        body: data,
      }),
    }),
    updateLessonTitle: builder.mutation({
      query: (data) => ({
        url: `${COURSE_URL}/update-lesson-title`,
        method: "PUT",
        body: data,
      }),
    }),
    updateDocument: builder.mutation({
      query: (data) => ({
        url: `${COURSE_URL}/update-document`,
        method: "PUT",
        body: data,
      }),
    }),
    updateQuiz: builder.mutation({
      query: (data) => ({
        url: `${COURSE_URL}/update-quiz`,
        method: "PUT",
        body: data,
      }),
    }),
    updateActivity: builder.mutation({
      query: (data) => ({
        url: `${COURSE_URL}/update-activity`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useUpdateCourseTitleMutation,
  useUpdateQuizMutation,
  useUpdateActivityMutation,
  useUpdateLessonTitleMutation,
  useGetCourseDataMutation,
  useGetCourseDataQQuery,
  useUpdateDocumentMutation,
} = courseService;
