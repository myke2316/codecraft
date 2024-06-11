import { CLASS_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const classService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClass: builder.mutation({
      query: (data) => ({
        url: `${CLASS_URL}/createClass`,
        method: "POST",
        body: data,
      }),
    }),
    fetchClass: builder.mutation({
      query: (id) => ({
        url: id ? `${CLASS_URL}/fetchClass/${id}` : `${CLASS_URL}/fetchClass`,
        method: "GET",
      }),
    }),
    joinClass: builder.mutation({
      query: (data) => ({
        url: `${CLASS_URL}/joinClass`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateClassMutation,
  useFetchClassMutation,
  useJoinClassMutation,
} = classService;