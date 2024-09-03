import { apiSlice } from "../apiSlice";
import { ANNOUNCE_URL } from "../../constants"; // Make sure to define ANNOUNCE_URL in your constants file

export const announcementService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: `${ANNOUNCE_URL}/createAnnouncement`,
        method: "POST",
        body: data,
      }),
    }),
    getAnnouncementsByClass: builder.query({
      query: (classId) => ({
        url: `${ANNOUNCE_URL}/class/${classId}/announcement`,
        method: "GET",
      }),
    }),
    getAnnouncementById: builder.query({
      query: (id) => ({
        url: `${ANNOUNCE_URL}/${id}/announcement`,
        method: "GET",
      }),
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, data }) => ({
        url: `${ANNOUNCE_URL}/${id}/update/announcement`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `${ANNOUNCE_URL}/${id}/delete/announcement`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useGetAnnouncementsByClassQuery,
  useGetAnnouncementByIdQuery,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementService;
