// this is my api query 

import { baseApi } from '../../../../utils/apiBaseQuery';


export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllChat: builder.query({
      query: () => ({
        url: `/chats/`,
        method: "GET",
      }),
      providesTags: ["chat"],
    }),

    /* 
    get all chat response 
      {
    "success": true,
    "message": "Chats retrieved successfully",
    "pagination": {
        "limit": 10,
        "page": 1,
        "total": 1,
        "totalPage": 1
    },
    "data": {
        "chats": [
            {
                "_id": "686de3b62e50dd6cd3871df8",
                "participants": [
                    {
                        "_id": "686ddfbd2e50dd6cd3871836",
                        "userName": "tanvir",
                        "email": "podisi5286@binafex.com",
                        "profile": "/images/roxy-aln-llenwc__ymu-unsplash-1752031639526.jpg",
                        "name": "tanvir"
                    }
                ],
                "lastMessage": {
                    "_id": "686de4092e50dd6cd3871ee6",
                    "chatId": "686de3b62e50dd6cd3871df8",
                    "sender": "686ddfbd2e50dd6cd3871836",
                    "text": "what ?",
                    "images": [],
                    "read": false,
                    "type": "text",
                    "isDeleted": false,
                    "isPinned": false,
                    "replyTo": null,
                    "createdAt": "2025-07-09T03:37:45.699Z",
                    "reactions": [],
                    "updatedAt": "2025-07-09T03:37:45.699Z",
                    "__v": 0
                },
                "status": "active",
                "isDeleted": false,
                "deletedBy": [],
                "readBy": [
                    "686ddfbd2e50dd6cd3871836",
                    "686b5c422e50dd6cd3843f87"
                ],
                "mutedBy": [
                    "686b5c422e50dd6cd3843f87"
                ],
                "pinnedMessages": [],
                "blockedUsers": [
                    {
                        "blocker": "686b5c422e50dd6cd3843f87",
                        "blocked": "686ddfbd2e50dd6cd3871836",
                        "blockedAt": "2025-07-09T04:42:52.449Z",
                        "_id": "686df34ca8e53f6b68ca295b"
                    }
                ],
                "createdAt": "2025-07-09T03:36:22.453Z",
                "updatedAt": "2025-07-09T04:42:52.449Z",
                "__v": 0,
                "isRead": false,
                "unreadCount": 3,
                "isMuted": true,
                "isBlocked": true
            }
        ],
        "unreadChatsCount": 1,
        "totalUnreadMessages": 3
    }
}

    */

    createChat: builder.mutation({
      query: (data) => ({
        url: "/chats/create-chat",
        method: "POST",
        body: data,   // {"participant": "682df69bcf663fd1911b6d87" }
      }),
      invalidatesTags: ["chat"],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/chats/mark-chat-as-read/${id}`, // need chatId 
        method: "PATCH",
      }),
      invalidatesTags: ["chat"],
    }),


    deleteChat: builder.mutation({
      query: (id) => ({
        url: `/chats/delete/${id}`, // need chatId 
        method: "DELETE",
      }),
      invalidatesTags: ["chat"],
    }),



    muteChat: builder.mutation({
      query: ({ id, body }) => ({
        url: `/chats/mute-unmute/${id}`, // need chatId
        method: "PATCH",
        body: body // { "action": "mute" } //'unmute'
      }),
      invalidatesTags: ["chat"],
    }),



    chatBlockAndUnblock: builder.mutation({
      query: ({ chatId, targetId, body }) => ({ // Fixed parameter destructuring
        url: `/chats/block-unblock/${chatId}/${targetId}`,
        method: "PATCH",
        body: body
      }),
      invalidatesTags: ["chat"],
    }),
  }),

  overrideExisting: true
});

export const {
  useGetAllChatQuery,
  useCreateChatMutation,
  useMarkAsReadMutation,
  useDeleteChatMutation,
  useMuteChatMutation,
  useChatBlockAndUnblockMutation,
} = chatApi;
