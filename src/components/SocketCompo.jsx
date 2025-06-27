'use client';

import { addMessage } from '@/redux/features/messageSlice';
import { addNotification } from '@/redux/features/notificationSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket } from '../../utils/socket';
import { addChats } from '../redux/features/chatSlice';

const SocketComponent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("login_user_id");
    if (!loggedInUserId) return;

    // console.log(`Setting up socket for user ID: ${loggedInUserId}`);

    const socket = connectSocket(loggedInUserId);

    // console.log(socket)

    // Add the event listener for new messages
    socket.on(`newMessage::${loggedInUserId}`, async (message) => {
      // console.log('New message received:', message);
      dispatch(addMessage(message));
    });

    // Add the event listener for new chat updates
    socket.on(`newChat::${loggedInUserId}`, (chat) => {
      // console.log('New chat received:', chat);
      console.log(chat)
      addChats(dispatch(chat))

    });


    // console.log('New notification received:', loggedInUserId);
    // Add the event listener for notifications
    // socket.on(`notification::${loggedInUserId}`, async (notification) => {
    socket.on(`notification::${loggedInUserId}`, async (notification) => {
      // console.log('New notification received:', notification);

      // Format the notification to match your expected structure
      const formattedNotification = {
        _id: notification._id || notification.id || Date.now().toString(),
        message: notification.message || notification.content || '',
        postId: notification.postId || '',
        commentId: notification.commentId || '',
        type: notification.type || 'info',
        read: false,
        createdAt: notification.createdAt || new Date().toISOString()
      };

      dispatch(addNotification(formattedNotification));

    });

    // Cleanup function to remove event listeners
    return () => {
      socket.off(`newMessage::${loggedInUserId}`);
      socket.off(`newChat::${loggedInUserId}`);
      socket.off(`notification::${loggedInUserId}`);
      socket.disconnect();
    };
  }, []);

  return  // No UI to render
};

export default SocketComponent;
