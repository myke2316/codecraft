import { useSelector } from "react-redux";
import { ANALYTICS_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const courseService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAnalytics: builder.mutation({
      query: () => ({
        url: `${ANALYTICS_URL}/fetchAllAnalytics`,
        method: "GET",
      }),
    }),
    fetchUserAnalytics: builder.mutation({
      query: (data) => ({
        url: `${ANALYTICS_URL}/fetch`,
        method: "POST",
        body: data,
      }),
    }),
    createUserAnalytics: builder.mutation({
      query: (data) => ({
        url: `${ANALYTICS_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateUserAnalytics: builder.mutation({
      query: (data) => ({
        url: `${ANALYTICS_URL}/update`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllAnalyticsMutation,
  useCreateUserAnalyticsMutation,
  useFetchUserAnalyticsMutation,
  useUpdateUserAnalyticsMutation,
} = courseService;