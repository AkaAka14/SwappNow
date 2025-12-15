
const { Server } = require('socket.io');

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    path: process.env.SOCKET_IO_PATH || '/socket.io'
  });

  // Basic 1:1 messaging and presence
  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    // join room for the user (client should emit 'join' with userId)
    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      socket.data.userId = userId;
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    });

    // send private message: { toUserId, body }
    socket.on('private_message', (payload) => {
      const { toUserId, body, fromUserId } = payload;
      const room = `user:${toUserId}`;
      io.to(room).emit('private_message', {
        fromUserId,
        body,
        ts: Date.now()
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });

  return io;
}

module.exports = { initSockets };