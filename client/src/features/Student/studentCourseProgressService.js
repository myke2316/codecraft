import { useSelector } from "react-redux";
import { PROGRESS_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const courseService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchUserProgress: builder.mutation({
      query: (data) => ({
        url: `${PROGRESS_URL}/fetch`,
        method: "POST",
        body: data,
      }),
    }),
    createUserProgress: builder.mutation({
      query: (data) => ({
        url: `${PROGRESS_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateUserProgress: builder.mutation({
      query: (data) => ({
        url: `${PROGRESS_URL}/update`,
        method: "POST",
        body: data,
      }),
    }),
    getAllProgress: builder.mutation({
      query: () => ({
        url: `${PROGRESS_URL}/getAllProgress`,
        method: "GET",
      }),
    }),
    getProgressData: builder.query({
      query: () => ({
        url: `${PROGRESS_URL}/getAllProgress`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetProgressDataQuery,
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
  useUpdateUserProgressMutation,
  useGetAllProgressMutation
} = courseService;
