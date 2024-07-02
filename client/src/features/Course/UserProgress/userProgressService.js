import { PROGRESS_URL } from "../../../constants";
import { apiSlice } from "../apiSlice";

export const userProgressService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    setProgress: builder.mutation({
      query: (data) => ({
        url: `${PROGRESS_URL}/set`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSetProgressMutation } = userProgressService;
