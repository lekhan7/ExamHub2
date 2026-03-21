import { useEffect } from 'react';
import { useRoom as useRoomContext } from '../context/RoomContext';

export const useRoom = () => {
  const roomContext = useRoomContext();
  
  useEffect(() => {
    // Fetch public rooms on component mount
    if (roomContext.isConnected) {
      roomContext.fetchPublicRooms();
    }
  }, [roomContext.isConnected]);

  const createRoom = (roomData) => {
    return new Promise((resolve, reject) => {
      roomContext.createRoom(roomData);
      
      // Listen for room creation response
      const handleRoomCreated = (data) => {
        resolve(data);
        roomContext.socket.off('room:created', handleRoomCreated);
      };
      
      const handleError = (error) => {
        reject(error);
        roomContext.socket.off('error', handleError);
      };
      
      roomContext.socket.on('room:created', handleRoomCreated);
      roomContext.socket.on('error', handleError);
    });
  };

  const joinRoom = (roomData) => {
    return new Promise((resolve, reject) => {
      roomContext.joinRoom(roomData);
      
      // Listen for room state response
      const handleRoomState = (data) => {
        resolve(data);
        roomContext.socket.off('room:state', handleRoomState);
      };
      
      const handleError = (error) => {
        reject(error);
        roomContext.socket.off('error', handleError);
      };
      
      roomContext.socket.on('room:state', handleRoomState);
      roomContext.socket.on('error', handleError);
    });
  };

  return {
    ...roomContext,
    createRoom,
    joinRoom
  };
};
