import { FILES_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const fileService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: (data) => ({
        url: `${FILES_URL}/upload`,
        method: "POST",
        body:data
      }),
    }),
  }),
});

export const { useUploadFileMutation } = fileService;
