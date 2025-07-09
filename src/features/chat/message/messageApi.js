import { baseApi } from '../../../../utils/apiBaseQuery';

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMassage: builder.query({
      query: ({ chatId, page = 1, limit = 10 }) => ({
        url: `/messages/${chatId}`,
        method: "GET",
        params: { page, limit }
      }),
      providesTags: ["chat"],
      // Custom merge function for pagination
      serializeQueryArgs: ({ queryArgs }) => {
        return queryArgs.chatId; // Group cache by chatId only
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: {
            ...newItems.data,
            messages: [...(currentCache.data?.messages || []), ...(newItems.data?.messages || [])]
          }
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page || currentArg?.chatId !== previousArg?.chatId;
      }
    }),

    reactMessage: builder.mutation({
      query: ({ messageId, reaction }) => ({
        url: `/messages/react/${messageId}`,
        method: "PATCH",
        body: {
          reactionType: reaction,  //'like' | 'love' | 'thumbs_up' | 'laugh' | 'angry' | 'sad'
        },
      }),
      invalidatesTags: ["chat"],
    }),

    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/messages/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["chat"],
    }),

    messageSend: builder.mutation({
      query: ({ chatId, body }) => ({
        url: `/messages/send-message/${chatId}`,
        method: "POST",
        body: body,  // formData {message : "message" , image : "image"}
      }),
      invalidatesTags: ["chat"],
      async onQueryStarted({ chatId, body }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          messageApi.util.updateQueryData('getAllMassage', { chatId }, (draft) => {
            if (draft.data?.messages) {
              draft.data.messages.unshift({
                _id: `optimistic-${Date.now()}`,
                chatId,
                sender: {
                  _id: localStorage.getItem("login_user_id"),
                  profile: localStorage.getItem("user_profile")
                },
                text: body.get('text') || '',
                images: body.get('image') ? [body.get('image').name] : [],
                read: false,
                type: body.get('image') ? 'image' : 'text',
                isDeleted: false,
                isPinned: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __v: 0
              });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      }
    }),

    pinMessage: builder.mutation({
      query: ({ messageId, action }) => ({
        url: `/messages/pin-unpin/${messageId}`,
        method: "PATCH",
        body: { action }  // {"action" :  "pin" or "unpin"}
      }),
      invalidatesTags: ["chat"],
    }),

    replyMessage: builder.mutation({
      query: ({ chatId, messageId, body }) => ({
        url: `/messages/${chatId}/reply/${messageId}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["chat"],
    }),
  }),
  overrideExisting: true
});

export const {
  useDeleteMessageMutation,
  useGetAllMassageQuery,
  useMessageSendMutation,
  usePinMessageMutation,
  useReactMessageMutation,
  useReplyMessageMutation
} = messageApi;