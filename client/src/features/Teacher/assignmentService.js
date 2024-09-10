import { ACTIVITY_ASSIGNMENT_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const activityAssignmentService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createActivityAssignment: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/create`,
        method: "POST",
        body: data,
      }),
    }),
    fetchAssignmentByClassId: builder.mutation({
      query: (classId) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/get/class/${classId}`,
        method: "GET",
      }),
    }),
    fetchAssignmentById: builder.mutation({
      query: (assignmentId) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/get/assignment/${assignmentId}`,
        method: "GET",
      }),
    }),
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/delete/${assignmentId}`,
        method: "DELETE",
      }),
    }),
    editAssignment: builder.mutation({
      query: (body) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/edit/${body.assignmentId}`,
        method: "PUT",
        body: body,
    
      }),
    }),
  }),
});

export const {
  useDeleteAssignmentMutation,
  useEditAssignmentMutation,
  useFetchAssignmentByIdMutation,
  useCreateActivityAssignmentMutation,
  useFetchAssignmentByClassIdMutation,
} = activityAssignmentService;
