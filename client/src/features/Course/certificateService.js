import { CERTIFICATE_URL, SIGNATURE_URL } from "../../constants";
import { apiSlice } from "../apiSlice";

export const certificateService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCertificate: builder.mutation({
      query: (data) => ({
        url: `${CERTIFICATE_URL}/student/certificate`,
        method: "POST",
        body: data,
      }),
    }),  getCertificate: builder.query({
      query: (userId) => ({
        url: `${CERTIFICATE_URL}/getCertificate/${userId}`,
        method: "GET",
      }),
    }),

    createSignature: builder.mutation({
      query: (data) => ({
        url: `${CERTIFICATE_URL}/upload-signature`,
        method: "POST",
        body: data,
      }),
    }),
    updateSignature: builder.mutation({
      query: (data) => ({
        url: `${CERTIFICATE_URL}/update-signature`,
        method: "PUT",
        body: data,
      }),
    }),
    getSignature: builder.query({
      query: (userId) => ({
        url: `${CERTIFICATE_URL}/get-signature/${userId}`,
        method: "GET",
      }),
    }),  getSignatureForStudent: builder.query({
      query: ({studentId, classId}) => ({
        url: `${CERTIFICATE_URL}/get-certificate/${studentId}/class/${classId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCertificateMutation,useGetSignatureQuery,useGetSignatureForStudentQuery,
useGetCertificateQuery,
  useUpdateSignatureMutation,
  useCreateSignatureMutation,
} = certificateService;
