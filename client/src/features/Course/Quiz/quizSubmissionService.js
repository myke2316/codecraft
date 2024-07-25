import { useSelector } from "react-redux";
import { QUIZSUBMISSION_URL } from "../../../constants";
import { apiSlice } from "../../apiSlice";

export const courseService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchUserQuizSubmission: builder.mutation({
      query: (data) => ({
        url: `${QUIZSUBMISSION_URL}/fetch`,
        method: "POST",
        body: data,
      }),
    }),
    createUserQuizSubmission: builder.mutation({
      query: (data) => ({
        url: `${QUIZSUBMISSION_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateUserQuizSubmission: builder.mutation({
      query: (data) => ({
        url: `${QUIZSUBMISSION_URL}/update`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useFetchUserQuizSubmissionMutation,
  useCreateUserQuizSubmissionMutation,
  useUpdateUserQuizSubmissionMutation,
} = courseService;
