import { apiSlice } from "../../../apiSlice"; 
import { ACTIVEUSERLOG_URL } from "../../../../constants"; 

export const activeUserService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchActiveUserLogs: builder.query({
      query: () => ({
        url: `${ACTIVEUSERLOG_URL}`, // Assuming a GET request to fetch all active logs
        method: "GET",
      }),
    }),

  }),
});

export const { useFetchActiveUserLogsQuery } =
  activeUserService;
