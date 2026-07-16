// Socket.io handlers for real-time chat operations
import Message from '../models/Message.js';

// Dictionary mapping: userId -> socketId (tracks who is currently online)
const onlineUsers = new Map();

const socketHandler = (io) => {
  // Listen for initial browser connections
  io.on('connection', (socket) => {
    console.log(`User connected with socket ID: ${socket.id}`);

    // Event: Register user online when they log in
    socket.on('register_user', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        // Broadcast the updated online users array to all clients
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`User registered: ${userId} on socket: ${socket.id}`);
      }
    });

    // Event: Join a specific chat room for two users
    socket.on('join_room', ({ senderId, receiverId }) => {
      // We sort the user IDs alphabetically so that regardless of who starts the chat,
      // both users join the exact same room name (e.g. "userA_userB")
      const roomName = [senderId, receiverId].sort().join('_');
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Event: Handle sending a chat message
    socket.on('send_message', async ({ senderId, receiverId, content }) => {
      const roomName = [senderId, receiverId].sort().join('_');

      try {
        // 1. Save the new message to MongoDB
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
        });

        const populatedMessage = await message.populate('sender', 'name avatar');

        // 2. Broadcast the message to both users in the room
        io.to(roomName).emit('receive_message', populatedMessage);

        // 3. Notify the receiver in real-time if they are online but not in the room
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('conversation_update', {
            senderId,
            content,
            message: populatedMessage,
          });
        }
      } catch (err) {
        console.error(`Error saving message: ${err.message}`);
      }
    });

    // Event: Handle typing indicator toggles
    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      const roomName = [senderId, receiverId].sort().join('_');
      // Send typing status to the other user in the room
      socket.to(roomName).emit('typing_status', { senderId, isTyping });
    });

    // Event: Handle socket disconnection
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      
      // Find which user ID maps to this socket ID
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId); // Remove from online list
          break;
        }
      }

      // Notify other clients about the disconnection
      if (disconnectedUserId) {
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`User offline: ${disconnectedUserId}`);
      }
    });
  });
};

export default socketHandler;
export { onlineUsers };
