import { authApi } from "@/features/auth/authApi";
import authReducer from "@/features/auth/authSlice";
import chatsReducer from "@/redux/features/chatSlice";
import messageReducer from "@/redux/features/messageSlice";
import notificationReducer from "@/redux/features/notificationSlice";
import { configureStore } from "@reduxjs/toolkit";

const apis = [authApi];

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
    message: messageReducer,
    notifications: notificationReducer,
    chats: chatsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
