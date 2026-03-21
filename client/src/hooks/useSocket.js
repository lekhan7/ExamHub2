import { useEffect, useState } from 'react';
import socketService from '../socket/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return { socket, isConnected, emit, on, off };
};
