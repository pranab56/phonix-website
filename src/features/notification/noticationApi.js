import { baseApi } from "../../../utils/apiBaseQuery";

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotification: builder.query({
      query: ({page = 1}) => ({
        url: `/notifications?page=${page}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "notification", id: `PAGE_${arg.page}` },
        { type: "notification", id: "LIST" }
      ],
      transformResponse: (res) => {

        return res.data;
      },
    }),

    markSingleRead: builder.mutation({
      query: (id) => {
        return {
          url: `/notifications/mark-single-as-read/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'notification', id: "LIST" }
      ],
    }),

    markAllAsRead: builder.mutation({
      query: () => {
        return {
          url: `/notifications/mark-all-as-read`,
          method: "PATCH",
        };
      },
      invalidatesTags: [{ type: 'notification', id: "LIST" }],
    }),

    deleteSingle: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: 'notification', id: "LIST" }],
    }),

    deleteAll: builder.mutation({
      query: () => ({
        url: `/notifications/all-notifications/delete`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: 'notification', id: "LIST" }],
    }),
  }),
});

export const {
  useDeleteAllMutation,
  useDeleteSingleMutation,
  useGetAllNotificationQuery,
  useMarkAllAsReadMutation,
  useMarkSingleReadMutation
} = commentApi;