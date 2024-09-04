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
        url: `${ACTIVITY_ASSIGNMENT_URL}/get/${classId}`,
        method: "GET",
     
      }),
    }),
  }),
});

export const {
  useCreateActivityAssignmentMutation,
  useFetchAssignmentByClassIdMutation,
} = activityAssignmentService;
