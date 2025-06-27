
import { createSlice } from '@reduxjs/toolkit';
import { commentApi } from '../../features/notification/noticationApi';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notification: [],
    unreadCount: 0
  },
  reducers: {
    addNotification: (state, action) => {
      // Check if notification already exists
      const exists = state.notification.some(
        notif => notif._id === action.payload._id
      );
      if (!exists) {
        state.notification.unshift(action.payload); // Add to beginning
        state.unreadCount += 1;
      }
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      commentApi?.endpoints?.getAllNotification?.matchFulfilled,
      (state, { payload }) => {
        state.meta = payload?.meta;
        state.notification = payload?.data;
        state.unreadCount = payload?.unreadNotifications || 0;
      }
    );
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;