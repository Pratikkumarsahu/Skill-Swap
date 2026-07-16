// Context provider for WebSockets (Socket.io) real-time features
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Connect socket when user logs in, disconnect on logout
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection to server
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Register user ID with the server on connect
    newSocket.on('connect', () => {
      newSocket.emit('register_user', user._id);
    });

    // Listen for online users array updates
    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Clean up connection on component unmount
    return () => {
      newSocket.close();
    };
  }, [user]);

  const value = {
    socket,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
