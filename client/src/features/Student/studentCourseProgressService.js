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
  }),
});

export const {
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
  useUpdateUserProgressMutation,
} = courseService;
