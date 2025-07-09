import { createSlice } from '@reduxjs/toolkit';
import { messageApi } from '../../features/chat/message/messageApi';


const initialState = {
  messages: [],
  pinnedMessages: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
  limit: 10
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      // Prevent duplicates
      if (!state.messages.some(msg => msg._id === action.payload._id)) {
        state.messages.unshift(action.payload);
      }
    },
    resetMessages: (state) => {
      state.messages = [];
      state.pinnedMessages = [];
      state.page = 1;
      state.hasMore = true;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(messageApi.endpoints.getAllMassage.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(messageApi.endpoints.getAllMassage.matchFulfilled, (state, { payload }) => {
        state.isLoading = false;
        if (payload.data) {
          // For initial load or new chat
          if (state.page === 1) {
            state.messages = payload.data.messages || [];
            state.pinnedMessages = payload.data.pinnedMessages || [];
          } else {
            // For pagination - append new messages
            const newMessages = payload.data.messages || [];
            const existingIds = new Set(state.messages.map(msg => msg._id));
            const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg._id));
            state.messages = [...state.messages, ...uniqueNewMessages];
          }
          state.hasMore = payload.data.messages?.length === state.limit;
        }
      })
      .addMatcher(messageApi.endpoints.getAllMassage.matchRejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      });
  }
});

export const { addMessage, resetMessages, setPage } = messageSlice.actions;
export default messageSlice.reducer;