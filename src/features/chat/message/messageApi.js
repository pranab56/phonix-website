import { baseApi } from '../../../../utils/apiBaseQuery';

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMassage: builder.query({
      query: ({ chatId, page = 1 }) => ({
        url: `/messages/${chatId}`,
        method: "GET",
        params: { page }
      }),
      providesTags: (result) =>
        result?.data?.messages
          ? [
            ...result.data.messages.map(({ _id }) => ({ type: 'Message', id: _id })),
            { type: 'Message', id: 'LIST' },
            { type: 'PinnedMessage', id: 'LIST' }
          ]
          : [{ type: 'Message', id: 'LIST' }],
    }),

    reactMessage: builder.mutation({
      query: ({ messageId, reaction }) => ({
        url: `/messages/react/${messageId}`,
        method: "POST",
        body: {
          reactionType: reaction, //  {"reactionType": "like" } //'like' | 'love' | 'thumbs_up' | 'laugh' | 'angry' | 'sad'
        },
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'Message', id: messageId },
        { type: 'Message', id: 'LIST' }
      ],
    }),

    messageSend: builder.mutation({
      query: ({ chatId, body }) => ({
        url: `/messages/send-message/${chatId}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),

    pinMessage: builder.mutation({
      query: ({ messageId, action }) => ({
        url: `/messages/pin-unpin/${messageId}`,
        method: "PATCH",
        body: { action }  // { "action": "pin"}  // unpin 
      }),
      invalidatesTags: (result, error, { messageId }) => [
        { type: 'Message', id: messageId },
        { type: 'PinnedMessage', id: 'LIST' }
      ],
    }),

    replyMessage: builder.mutation({
      query: ({ chatId, messageId, body }) => ({
        url: `/messages/${chatId}/reply/${messageId}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: 'Message', id: 'LIST' }],
    }),
  }),
  overrideExisting: true
});

export const {
  useGetAllMassageQuery,
  useMessageSendMutation,
  usePinMessageMutation,
  useReactMessageMutation,
  useReplyMessageMutation
} = messageApi;