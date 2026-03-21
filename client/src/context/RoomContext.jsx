import { createContext, useContext, useState, useCallback } from 'react';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState('');
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [activeTab, setActiveTab] = useState('pdf');

  const updatePublicRooms = useCallback((rooms) => {
    setPublicRooms(rooms);
  }, []);

  const joinRoom = useCallback((roomData, memberData) => {
    setCurrentRoom(roomData);
    setCurrentMember(memberData);
    setMembers(roomData.members || []);
    setMessages(roomData.messages || []);
    setNotes(roomData.notes || '');
    setCanvasHistory(roomData.canvasHistory || []);
    setCurrentPdf(roomData.pdf || null);
  }, []);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
    setCurrentMember(null);
    setMembers([]);
    setMessages([]);
    setNotes('');
    setCanvasHistory([]);
    setCurrentPdf(null);
    setActiveTab('pdf');
  }, []);

  const addMember = useCallback((member) => {
    setMembers(prev => {
      const exists = prev.find(m => m.displayName === member.displayName);
      if (exists) {
        return prev.map(m => m.displayName === member.displayName ? member : m);
      }
      return [...prev, member];
    });
  }, []);

  const removeMember = useCallback((displayName) => {
    setMembers(prev => prev.filter(m => m.displayName !== displayName));
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateNotes = useCallback((content) => {
    setNotes(content);
  }, []);

  const addCanvasStroke = useCallback((stroke) => {
    setCanvasHistory(prev => [...prev, stroke]);
  }, []);

  const clearCanvas = useCallback(() => {
    setCanvasHistory([]);
  }, []);

  const updatePdf = useCallback((pdf) => {
    setCurrentPdf(pdf);
  }, []);

  const setCanvasHistoryDirect = useCallback((history) => {
    setCanvasHistory(history);
  }, []);

  const setMessagesDirect = useCallback((messages) => {
    setMessages(messages);
  }, []);

  const value = {
    currentRoom,
    currentMember,
    members,
    publicRooms,
    messages,
    notes,
    canvasHistory,
    currentPdf,
    activeTab,
    setActiveTab,
    setCurrentRoom,
    setCurrentMember,
    setMembers,
    updatePublicRooms,
    joinRoom,
    leaveRoom,
    addMember,
    removeMember,
    addMessage,
    updateNotes,
    addCanvasStroke,
    clearCanvas,
    updatePdf,
    setCanvasHistoryDirect,
    setMessagesDirect,
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
