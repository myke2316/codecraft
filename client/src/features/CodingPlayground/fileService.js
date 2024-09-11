import { SANDBOX_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const fileService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: `${SANDBOX_URL}/upload`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
  }),
});

export const { useUploadFileMutation } = fileService;
