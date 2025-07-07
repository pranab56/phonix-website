import { baseApi } from '../../../../utils/apiBaseQuery';


export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMassage: builder.query({
      query: (id) => ({
        url: `/messages/${id}`,
        method: "GET",
      }),
      providesTags: ["chat"],
    }),


    reactMessage: builder.mutation({
      query: (id, reaction) => ({
        url: `/messages/react/${id}`,
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
      query: (id, body) => ({
        url: `/messages/send-message/${id}`,
        method: "POST",
        body: body,  // formData {message : "message" , image : "image"}
      }),
      invalidatesTags: ["chat"],
    }),


    pinMessage: builder.mutation({
      query: (id, body) => ({
        url: `/messages/pin-unpin/${id}`,
        method: "PATCH",
        body: body  // {"action" :  "pin" or "unpin"}
      }),
      invalidatesTags: ["chat"],
    }),


    replyMessage: builder.mutation({
      query: (chatid, messageid, body) => ({
        url: `/messages/${chatid}/reply/${messageid}`,
        method: "POST",
        body: body,
      }),
    }),

  }),
});

export const {
  useDeleteMessageMutation,
  useGetAllMassageQuery,
  useMessageSendMutation,
  usePinMessageMutation,
  useReactMessageMutation,
  useReplyMessageMutation
} = commentApi;
