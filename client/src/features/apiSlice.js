import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BACKEND_URL, BASE_URL } from "../constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  withCredentials: true,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Classes"],
  endpoints: (builder) => ({}),
});
