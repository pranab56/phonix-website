import { createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../features/chat/chatList/chatApi';

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: [],
    unreadCount: 0
  },
  reducers: {
    addChats: (state, action) => {
      state.chats.push(action.payload);
      state.unreadCount += 1;
    },
    markChatAsRead: (state, action) => {
      const chat = state.chats.find(c => c._id === action.payload);
      if (chat) {
        chat.lastMessage.read = true;
        chat.unreadCount = 0;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    deleteChatLocally: (state, action) => {
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
    },
    toggleMuteChat: (state, action) => {
      const chatIndex = state.chats.findIndex(c => c._id === action.payload);
      if (chatIndex !== -1) {
        state.chats[chatIndex].isMuted = !state.chats[chatIndex].isMuted;
        // Also update mutedBy array to match the API response structure
        const userId = localStorage.getItem("login_user_id");
        if (state.chats[chatIndex].isMuted) {
          if (!state.chats[chatIndex].mutedBy.includes(userId)) {
            state.chats[chatIndex].mutedBy.push(userId);
          }
        } else {
          state.chats[chatIndex].mutedBy = state.chats[chatIndex].mutedBy.filter(id => id !== userId);
        }
      }
    },
    toggleBlockChat: (state, action) => {
      const chat = state.chats.find(c => c._id === action.payload);
      if (chat) {
        chat.isBlocked = !chat.isBlocked;
      }
    },
    updateLastMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.lastMessage = message;
        if (!message.read) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      chatApi?.endpoints?.getAllChat?.matchFulfilled,
      (state, { payload }) => {
        state.chats = payload?.data?.chats || [];
        state.unreadCount = payload?.data?.totalUnreadMessages || 0;
      }
    );
  }
});

export const {
  addChats,
  markChatAsRead,
  deleteChatLocally,
  toggleMuteChat,
  toggleBlockChat,
  updateLastMessage
} = chatsSlice.actions;
export default chatsSlice.reducer;