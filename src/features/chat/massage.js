import { baseApi } from "../../../utils/apiBaseQuery";

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createChat: builder.mutation({
      query: (data) => ({
        url: "/chats/create-chat",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["chat"],
    }),

    messageSend: builder.mutation({
      query: ({ id, body }) => ({
        url: `/messages/send-message/${id}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["chat"],
    }),

    getAllChat: builder.query({
      query: (value) => ({
        url: `/chats?searchTerm=${value}`,
        method: "GET",
      }),
      providesTags: ["chat", "profile"],
      transformResponse: (res) => {
        return res.data
      }
    }),

    getAllMassage: builder.query({
      query: (value) => ({
        url: `/messages/${value}`,
        method: "GET",
      }),
      providesTags: ["chat"],
      transformResponse: (res) => {
        return res.data
      }
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/chats/mark-chat-as-read/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["chat"],
    }),

    reactMessage: builder.mutation({
      query: (data) => ({
        url: `/messages/react/${data.messageId}`,
        method: "POST",
        body: {reactionType : data.reaction},
      }),
      invalidatesTags: ["chat"],
    }),

    
    DeleteMessage: builder.mutation({
      query: (id) => ({
        url: `/messages/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["chat"],
    }),



  }),
});

export const {
  useCreateChatMutation,
  useMessageSendMutation,
  useGetAllChatQuery,
  useGetAllMassageQuery,
  useMarkAsReadMutation,
  useReactMessageMutation,
  useDeleteMessageMutation
} = commentApi;
