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
  }),
});

export const { useGetCourseDataMutation,useGetCourseDataQQuery } = courseService;
