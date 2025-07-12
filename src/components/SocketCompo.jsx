'use client';
import {
  addChats,
  deleteChatLocally,
  markChatAsRead,
  toggleBlockChat,
  toggleMuteChat,
  updateLastMessage
} from '@/redux/features/chatSlice';
import {
  addMessage,
  updateMessageDelete,
  updateMessagePin,
  updateMessageReaction
} from '@/redux/features/messageSlice';
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

    // Message events
    socket.on(`newMessage::${loggedInUserId}`, (message) => {
      // Ensure message has proper structure before adding
      if (!message.sender) {
        message.sender = {
          _id: message.senderId || 'unknown',
          userName: 'Unknown',
          profile: null
        };
      }
      dispatch(addMessage(message));
      dispatch(updateLastMessage({
        chatId: message.chatId,
        message
      }));
    });

    // Message reaction events
    socket.on(`messageReacted::${loggedInUserId}`, (data) => {
      dispatch(updateMessageReaction({
        messageId: data.messageId,
        reaction: data.reactionType,
        userId: data.userId
      }));
    });

    // Message pin/unpin events
    socket.on(`messagePinned::${loggedInUserId}`, (data) => {
      dispatch(updateMessagePin({
        messageId: data.messageId,
        isPinned: data.action === 'pin',
        pinnedBy: data.pinnedBy
      }));
    });

    // Message deletion events
    socket.on(`messageDeleted::${loggedInUserId}`, (data) => {
      dispatch(updateMessageDelete({
        messageId: data.messageId
      }));
      dispatch(updateLastMessage({
        chatId: data.chatId,
        message: {
          _id: data.messageId,
          text: "This message has been deleted.",
          isDeleted: true
        }
      }));
    });

    // Chat events
    socket.on(`newChat::${loggedInUserId}`, (chat) => {
      dispatch(addChats(chat));
    });

    socket.on(`chatDeleted::${loggedInUserId}`, (chatId) => {
      dispatch(deleteChatLocally(chatId));
    });

    socket.on(`chatMuted::${loggedInUserId}`, ({ chatId, isMuted }) => {
      dispatch(toggleMuteChat({ chatId, isMuted }));
    });

    socket.on(`chatBlocked::${loggedInUserId}`, ({ chatId, isBlocked }) => {
      dispatch(toggleBlockChat({ chatId, isBlocked }));
    });

    socket.on(`chatMarkedAsRead::${loggedInUserId}`, (chatId) => {
      dispatch(markChatAsRead(chatId));
    });

    // Notification events
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
      socket.off(`messageReacted::${loggedInUserId}`);
      socket.off(`messagePinned::${loggedInUserId}`);
      socket.off(`messageDeleted::${loggedInUserId}`);
      socket.off(`newChat::${loggedInUserId}`);
      socket.off(`chatDeleted::${loggedInUserId}`);
      socket.off(`chatMuted::${loggedInUserId}`);
      socket.off(`chatBlocked::${loggedInUserId}`);
      socket.off(`chatMarkedAsRead::${loggedInUserId}`);
      socket.off(`notification::${loggedInUserId}`);
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default SocketComponent;