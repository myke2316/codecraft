import { SUBMISSION_URL } from "../../constants"; // Replace with the actual URL constant for submissions
import { apiSlice } from "../apiSlice";

export const submissionService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation for submitting an assignment
    submitAssignment: builder.mutation({
      query: (data) => ({
        url: `${SUBMISSION_URL}/submit`,
        method: "POST",
        body: data,
      }),
    }),

    // Mutation for deleting a submission
    deleteSubmission: builder.mutation({
      query: (submissionId) => ({
        url: `${SUBMISSION_URL}/delete/${submissionId}`,
        method: "DELETE",
      }),
    }),
    fetchAllSubmissionByClassId: builder.query({
      query: (classId) => ({
        url: `${SUBMISSION_URL}/submissions/class/${classId}`,
        method: "GET",
      }),
    }),
    fetchSubmissionByAssignmentAndStudentId: builder.query({
      query: ({ assignmentId, studentId }) => ({
        url: `${SUBMISSION_URL}/submissions/${assignmentId}/${studentId}`,
        method: "GET",
      }),
    }),
    getAssignmentByAssignmentId: builder.query({
      query: (assignmentId) => ({
        url: `${SUBMISSION_URL}/submissions/get/assignment/${assignmentId}`,
        method: "GET",
      }),
    }),
    teacherGradeFeedBack: builder.mutation({
      query: ({ submissionId, grade, feedback }) => ({
        url: `${SUBMISSION_URL}/submissions/${submissionId}/feedback`,
        method: "PATCH",
        body: {
          grade,
          feedback,
        },
      }),
    }),
  }),
});

export const {
  useTeacherGradeFeedBackMutation,
  useGetAssignmentByAssignmentIdQuery,
  useFetchSubmissionByAssignmentAndStudentIdQuery,
  useFetchAllSubmissionByClassIdQuery,
  useSubmitAssignmentMutation,
  useDeleteSubmissionMutation,
} = submissionService;
