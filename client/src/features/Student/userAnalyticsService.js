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
    aggregateAllAnalytics: builder.mutation({
      query: () => ({
        url: `${ANALYTICS_URL}/aggregateAllAnalytics`,
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
  useAggregateAllAnalyticsMutation,
  useCreateUserAnalyticsMutation,
  useFetchUserAnalyticsMutation,
  useUpdateUserAnalyticsMutation,
} = courseService;
