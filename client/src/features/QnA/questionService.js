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
    voteQuestion: builder.mutation({
      query: ({ questionId, userId, vote }) => ({
        url: `${QNA_URL}/questions/${questionId}/vote`,
        method: "POST",
        body: { userId, vote }, // Send the vote payload
      }),
    }),
    getQuestionVote: builder.query({
      query: ({ questionId }) => ({
        url: `${QNA_URL}/questions/${questionId}/allVote`,
        method: "GET",
      }),
    }),
    voteAnswer: builder.mutation({
      query: ({ questionId, answerId,userId,vote }) => ({
        url: `${QNA_URL}/questions/${questionId}/answers/${answerId}/vote`,
        method: "POST",
        body: { userId, vote }, // Send the vote payload
      }),
    }),
    getAnswerVote: builder.query({
      query: ({ questionId,answerId }) => ({
        url: `${QNA_URL}/questions/${questionId}/answers/${answerId}/allVote`,
        method: "GET",
      }),
    }),getUserVote: builder.query({
      query: ({ userId }) => ({
        url: `${QNA_URL}/questions/answer/${userId}/allVote`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useVoteAnswerMutation,useGetAnswerVoteQuery,useGetUserVoteQuery,
  useGetQuestionVoteQuery,
  useVoteQuestionMutation,
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
