import { io } from 'socket.io-client';

let socket = null;

export function initSocket(userId) {
  if (socket) {
    return socket;
  }
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  socket = io(API, {
    path: '/socket.io'
  });
  socket.on('connect', () => {
    console.log('Connected to socket', socket.id);
    if (userId) socket.emit('join', userId);
  });
  return socket;
}

export function getSocket() {
  return socket;
}