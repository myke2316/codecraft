import { useSelector } from "react-redux";
import { ACTIVITYSUBMISSION_URL } from "../../../constants";
import { apiSlice } from "../../apiSlice";

export const activityService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchUserActivitySubmission: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITYSUBMISSION_URL}/fetch`,
        method: "POST",
        body: data,
      }),
    }),
    createUserActivitySubmission: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITYSUBMISSION_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateUserActivitySubmission: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITYSUBMISSION_URL}/update`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useFetchUserActivitySubmissionMutation,
  useCreateUserActivitySubmissionMutation,
  useUpdateUserActivitySubmissionMutation,
} = activityService;
