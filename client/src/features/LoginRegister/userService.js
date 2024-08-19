import { USER_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const userService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUser: builder.mutation({
      query: () => ({
        url: `${USER_URL}/getAllUser`,
        method: "GET",
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    updateRole: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/update-role`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: "GET",
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/reset-password/${data.resetToken}`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllUserMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateRoleMutation,
} = userService;
