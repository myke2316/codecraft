import { QNA_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const questionService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchQuestions: builder.mutation({
      query: () => ({
        url: `${QNA_URL}/fetch`,
        method: "GET",
      }),
    }),
    fetchQuestionById: builder.mutation({
      query: (id) => ({
        url: `${QNA_URL}/fetch/${id}`,
        method: "GET",
      }),
    }),
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${QNA_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    updateQuestion: builder.mutation({
      query: ({ questionId, ...data }) => ({
        url: `${QNA_URL}/update/${questionId}`,
        method: "PUT",
        body: data,
      }),
    }),
    addAnswer: builder.mutation({
      query: ({ questionId, ...data }) => ({
        url: `${QNA_URL}/answer/${questionId}`,
        method: "POST",
        body: data,
      }),
    }),
    updateAnswer: builder.mutation({
      query: ({ questionId, answerId, ...data }) => ({
        url: `${QNA_URL}/update/answer/${questionId}/${answerId}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `${QNA_URL}/delete/${id}`,
        method: "DELETE",
      }),
    }),
    deleteAnswer: builder.mutation({
      query: ({ questionId, answerId, authorId }) => ({
        url: `${QNA_URL}/delete/${questionId}/${answerId}`,
        method: "DELETE",
        body: { authorId },
      }),
    }),
    fetchAnswerById: builder.query({
      query: ({ questionId, answerId }) => ({
        url: `${QNA_URL}/questions/${questionId}/answers/${answerId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useFetchQuestionsMutation,
  useFetchQuestionByIdMutation,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useAddAnswerMutation,
  useUpdateAnswerMutation,
  useDeleteAnswerMutation,
  useDeleteQuestionMutation,
  useFetchAnswerByIdQuery,
} = questionService;
