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
    deleteActivityAssignment: builder.mutation({
      query: (id) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/delete/${id}`,
        method: "DELETE",
      }),
    }),
    fetchActivityAssignmentById: builder.mutation({
      query: (id) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/get/${id}`,
        method: "GET",
      }),
    }),
    updateActivityAssignment: builder.mutation({
      query: (data) => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/update`,
        method: "PUT",
        body: data,
      }),
    }),
    fetchAllActivityAssignments: builder.mutation({
      query: () => ({
        url: `${ACTIVITY_ASSIGNMENT_URL}/fetchAll`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateActivityAssignmentMutation,
  useDeleteActivityAssignmentMutation,
  useFetchActivityAssignmentByIdMutation,
  useUpdateActivityAssignmentMutation,
  useFetchAllActivityAssignmentsMutation,
} = activityAssignmentService;
