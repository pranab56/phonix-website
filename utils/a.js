import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (socket) {
    return socket;
  }
  console.log("conneting socket")
  socket = io('http://10.0.60.123:5002', {
    auth: { userId: "680e138cf9641e6b49578141" }
  });
  console.log("first connection")
  socket.on('connect', () => {
    console.log('Connected to the socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from the socket server');
  });

  return socket;
};

export const getSocket = () => socket;
