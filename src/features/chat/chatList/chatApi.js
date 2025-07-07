import { baseApi } from '../../../../utils/apiBaseQuery';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllChat: builder.query({
      query: (searchTerm = '') => ({
        url: `/chats/?search=${searchTerm}`,
        method: "GET",
      }),
      providesTags: ["chat"],
      transformResponse: (res) => ({
        chats: res.data?.chats || [],
        unreadChatsCount: res.data?.unreadChatsCount || 0,
        totalUnreadMessages: res.data?.totalUnreadMessages || 0
      })
    }),

    createChat: builder.mutation({
      query: (data) => ({
        url: "/chats/create-chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["chat"],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/chat/mark-chat-as-read/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["chat"],
    }),

    deleteChat: builder.mutation({
      query: () => ({
        url: `/chat/delete/`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      invalidatesTags: ["chat"],
    }),

    muteChat: builder.mutation({
      query: ({ id, action }) => ({
        url: `/chat/mute-unmute/${id}`,
        method: "PATCH",
        body: { action }
      }),
      invalidatesTags: ["chat"],
    }),

    chatBlockAndUnblock: builder.mutation({
      query: ({ id, action }) => ({
        url: `/chat/block-unblock/chatId/${id}`,
        method: "PATCH",
        body: { action }
      }),
      invalidatesTags: ["chat"],
    }),
  }),
});

export const {
  useGetAllChatQuery,
  useCreateChatMutation,
  useMarkAsReadMutation,
  useDeleteChatMutation,
  useMuteChatMutation,
  useChatBlockAndUnblockMutation,
} = chatApi;