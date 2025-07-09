'use client';

import { addChats, markChatAsRead, updateLastMessage } from '@/redux/features/chatSlice';
import { addMessage } from '@/redux/features/messageSlice';
import { addNotification } from '@/redux/features/notificationSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket } from '../../utils/socket';

const SocketComponent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("login_user_id");
    if (!loggedInUserId) return;

    const socket = connectSocket(loggedInUserId);

    socket.on(`newMessage::${loggedInUserId}`, (message) => {
      dispatch(addMessage(message));
      dispatch(updateLastMessage({
        chatId: message.chatId,
        message
      }));
    });

    socket.on(`newChat::${loggedInUserId}`, (chat) => {
      dispatch(addChats(chat));
    });


    // In your SocketComponent.js
    socket.on(`chatDeleted::${loggedInUserId}`, (chatId) => {
      dispatch(deleteChatLocally(chatId));
    });

    socket.on(`chatMuted::${loggedInUserId}`, ({ chatId, isMuted }) => {
      dispatch(toggleMuteChat(chatId));
    });

    socket.on(`chatBlocked::${loggedInUserId}`, ({ chatId, isBlocked }) => {
      dispatch(toggleBlockChat(chatId));
    });

    socket.on(`chatMarkedAsRead::${loggedInUserId}`, (chatId) => {
      dispatch(markChatAsRead(chatId));
    });

    socket.on(`notification::${loggedInUserId}`, (notification) => {
      dispatch(addNotification({
        _id: notification._id || Date.now().toString(),
        message: notification.message,
        postId: notification.postId || '',
        commentId: notification.commentId || '',
        type: notification.type || 'info',
        read: false,
        createdAt: notification.createdAt || new Date().toISOString()
      }));
    });

    return () => {
      socket.off(`newMessage::${loggedInUserId}`);
      socket.off(`newChat::${loggedInUserId}`);
      socket.off(`chatMarkedAsRead::${loggedInUserId}`);
      socket.off(`notification::${loggedInUserId}`);
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default SocketComponent;