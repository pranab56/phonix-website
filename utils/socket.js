import { io } from 'socket.io-client';
import { baseURL } from './BaseURL';


let socket = null;

export const connectSocket = (userId) => {
  if (socket && socket.connected) {
    return socket;
  }
  socket = io(baseURL, {
    auth: { userId }
  });

  socket.on('connect', () => {
    // console.log('Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    // console.log('Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    // console.error('Connect error:', error.message);
  });

  return socket;
};

export const getSocket = () => socket;
