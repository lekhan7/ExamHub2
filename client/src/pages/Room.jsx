import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  Users, 
  FileText, 
  Pencil, 
  Palette, 
  MessageCircle,
  LogOut,
  Globe,
  Lock,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import PDFViewer from '../components/room/PDFViewer';
import Notes from '../components/room/Notes';
import Whiteboard from '../components/room/Whiteboard';
import Chat from '../components/room/Chat';
import LanguageSelector from '../components/LanguageSelector';

const TABS = [
  { id: 'pdf', label: 'room.tabs.pdf', icon: FileText },
  { id: 'notes', label: 'room.tabs.notes', icon: Pencil },
  { id: 'whiteboard', label: 'room.tabs.scribble', icon: Palette },
  { id: 'chat', label: 'room.tabs.chat', icon: MessageCircle },
];

// Avatar colors for members
const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
  'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function Room() {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { 
    currentRoom, 
    currentMember,
    members, 
    activeTab, 
    setActiveTab,
    joinRoom,
    leaveRoom,
    addMember,
    removeMember,
    addMessage,
    updateNotes,
    addCanvasStroke,
    clearCanvas,
    setCurrentRoom,
    setCurrentMember,
    setMembers,
    setCanvasHistoryDirect,
    setMessagesDirect,
    notes,
    canvasHistory,
    messages
  } = useRoom();
  
  const [currentPdf, setCurrentPdf] = useState(null);
  
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCreatorLeaveOptions, setShowCreatorLeaveOptions] = useState(false);
  const [showEndRoomConfirm, setShowEndRoomConfirm] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Session Persistence: Check for saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('examRoom_session');
    
    if (savedSession && !currentRoom && socket && isConnected) {
      const session = JSON.parse(savedSession);
      
      // Check if session is for current room
      if (session.roomId === roomId) {
        setIsReconnecting(true);
        
        // Rejoin the room
        socket.emit('room:join', {
          roomId: session.roomId,
          displayName: session.displayName,
          roomCode: session.roomCode
        });

        // Listen for successful rejoin
        socket.once('room:joined', (data) => {
          joinRoom(data.room, data.member);
          setIsReconnecting(false);
        });

        socket.once('error', (err) => {
          console.error('Failed to rejoin room:', err);
          setIsReconnecting(false);
          localStorage.removeItem('examRoom_session');
          navigate('/');
        });
      }
    }
  }, [roomId, socket, isConnected, currentRoom, joinRoom, navigate]);

  // Save session when room data changes
  useEffect(() => {
    if (currentRoom && currentMember) {
      const session = {
        roomId: currentRoom.id,
        displayName: currentMember.displayName,
        roomCode: currentRoom.roomCode,
        isPublic: currentRoom.isPublic
      };
      localStorage.setItem('examRoom_session', JSON.stringify(session));
    }
  }, [currentRoom, currentMember]);

  // Clear session on actual leave (not refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Don't clear session on refresh - let the rejoin logic handle it
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleMemberJoined = (data) => {
      addMember(data.member);
    };

    const handleMemberLeft = (data) => {
      removeMember(data.displayName);
    };

    const handleNewMessage = (message) => {
      addMessage(message);
    };

    const handleNotesUpdated = (data) => {
      updateNotes(data.content);
    };

    const handleCanvasStroke = (stroke) => {
      addCanvasStroke(stroke);
    };

    const handleCanvasCleared = () => {
      clearCanvas();
    };

    const handleRoomState = (data) => {
      console.log('📡 Received room:state:', data);
      console.log('📊 PDF data in room:state:', data.pdf);
      console.log('📊 PDF data type:', typeof data.pdf);
      console.log('📊 PDF data keys:', data.pdf ? Object.keys(data.pdf) : 'null');
      
      // Update room state when received from server
      if (data.room) {
        setMembers(data.members || []);
        if (data.notes !== undefined) updateNotes(data.notes);
        if (data.pdf !== undefined) {
          console.log('📄 Setting currentPdf to:', data.pdf);
          setCurrentPdf(data.pdf);
          console.log('📄 PDF received from room:state:', data.pdf?.name);
        }
        if (data.canvasHistory !== undefined) {
          // Set canvas history directly for initial load
          setCanvasHistoryDirect(data.canvasHistory);
        }
        if (data.messages !== undefined) {
          // Set messages directly for initial load
          setMessagesDirect(data.messages);
        }
      }
    };

    const handleCreatorChanged = (data) => {
      console.log('👑 Creator changed:', data);
      // Update members list with new creator info
      setMembers(data.members || []);
      
      // Update current member's creator status
      if (currentMember) {
        const updatedMember = {
          ...currentMember,
          isCreator: currentMember.displayName === data.newCreator
        };
        setCurrentMember(updatedMember);
      }
      
      // Update current room creator
      if (currentRoom) {
        setCurrentRoom({
          ...currentRoom,
          creator: data.newCreator
        });
      }
    };

    const handleRoomEnded = (data) => {
      console.log('💥 Room ended:', data);
      // Show popup and redirect to home
      alert(`🚫 ${data.message}`);
      navigate('/');
    };

    const handlePdfUpdated = (data) => {
      if (data.pdf) {
        setCurrentPdf(data.pdf);
        console.log('📄 PDF updated:', data.pdf.name);
      }
    };

    socket.on('room:memberJoined', handleMemberJoined);
    socket.on('room:memberLeft', handleMemberLeft);
    socket.on('chat:newMessage', handleNewMessage);
    socket.on('notes:updated', handleNotesUpdated);
    socket.on('canvas:stroke', handleCanvasStroke);
    socket.on('canvas:cleared', handleCanvasCleared);
    socket.on('room:state', handleRoomState);
    socket.on('room:creatorChanged', handleCreatorChanged);
    socket.on('room:ended', handleRoomEnded);
    socket.on('pdf:updated', handlePdfUpdated);

    return () => {
      socket.off('room:memberJoined', handleMemberJoined);
      socket.off('room:memberLeft', handleMemberLeft);
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('notes:updated', handleNotesUpdated);
      socket.off('canvas:stroke', handleCanvasStroke);
      socket.off('canvas:cleared', handleCanvasCleared);
      socket.off('room:state', handleRoomState);
      socket.off('room:creatorChanged', handleCreatorChanged);
      socket.off('room:ended', handleRoomEnded);
      socket.off('pdf:updated', handlePdfUpdated);
    };
  }, [socket, addMember, removeMember, addMessage, updateNotes, addCanvasStroke, clearCanvas, setMembers]);

  const handleLeave = () => {
    if (currentRoom && currentMember) {
      socket?.emit('room:leave', {
        roomId: currentRoom.id,
        displayName: currentMember.displayName
      });
      leaveRoom();
      localStorage.removeItem('examRoom_session'); // Clear session on intentional leave
    }
    navigate('/');
  };

  const handleLeaveRoomClick = () => {
    if (isCreator) {
      setShowCreatorLeaveOptions(true);
    } else {
      setShowLeaveConfirm(true);
    }
  };

  const handleJustLeave = () => {
    setShowCreatorLeaveOptions(false);
    handleLeave();
  };

  const handleEndRoom = () => {
    setShowCreatorLeaveOptions(false);
    setShowEndRoomConfirm(true);
  };

  const confirmEndRoom = () => {
    if (currentRoom && currentMember) {
      socket?.emit('room:end', {
        roomId: currentRoom.id,
        displayName: currentMember.displayName
      });
    }
  };

  const handleShareLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If no room data, show reconnecting or loading state
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">
            {isReconnecting ? t('room.reconnecting') : t('room.connecting')}
          </p>
          {!isReconnecting && (
            <p className="text-xs text-muted mt-2">
              {t('room.connectionPersist')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const isCreator = currentMember?.isCreator;

  return (
    <div className="h-screen bg-primary flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 bg-card border-r border-custom flex flex-col">
        {/* Room Header */}
        <div className="p-5 border-b border-custom">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleLeaveRoomClick}
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('room.sidebar.leaveRoom')}
            </button>
            <LanguageSelector />
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center text-2xl">
              📚
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-primary truncate">{currentRoom.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-accent bg-violet-500/10 px-2 py-0.5 rounded">
                  {currentRoom.examTag}
                </span>
                <span className="text-xs text-secondary flex items-center gap-1">
                  {currentRoom.isPublic ? (
                    <><Globe className="w-3 h-3" /> {t('home.public')}</>
                  ) : (
                    <><Lock className="w-3 h-3" /> {t('home.private')}</>
                  )}
                </span>
              </div>
              
              {/* Share Link Button */}
              <button
                onClick={handleShareLink}
                className="mt-3 flex items-center gap-2 text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3" />
                    {t('room.copied')}
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    {t('room.shareLink')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('room.sidebar.members')} ({members.length}/10)
            </h2>
          </div>
          
          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.displayName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  member.displayName === currentMember?.displayName 
                    ? 'bg-violet-500/10 border border-violet-500/20' 
                    : 'hover:bg-secondary'
                } transition-colors`}
              >
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.displayName)} flex items-center justify-center text-white text-xs font-bold`}>
                  {getInitials(member.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {member.displayName}
                    {member.displayName === currentMember?.displayName && (
                      <span className="text-violet-400 text-xs ml-1">({t('room.you')})</span>
                    )}
                  </p>
                </div>
                {member.isCreator && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current User Footer */}
        <div className="p-4 border-t border-custom bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(currentMember?.displayName || 'You')} flex items-center justify-center text-white font-bold`}>
              {getInitials(currentMember?.displayName || 'You')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {currentMember?.displayName}
              </p>
              <p className="text-xs text-secondary">
                {isCreator ? t('room.creator') : t('room.member')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-card border-b border-custom">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-secondary hover:text-primary hover:bg-secondary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {t(tab.label)}
            </button>
          ))}
        </div>

        {/* Room Full Banner */}
        {members.length >= 10 && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 text-sm text-center">
            🚫 {t('room.roomFullBanner')}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'pdf' && (
                <PDFViewer 
                  roomId={roomId} 
                  isCreator={isCreator}
                  currentPdf={currentPdf}
                  socket={socket}
                />
              )}
              {activeTab === 'notes' && (
                <Notes 
                  roomId={roomId}
                  notes={notes || currentRoom.notes || ''}
                  currentMember={currentMember}
                />
              )}
              {activeTab === 'whiteboard' && (
                <Whiteboard 
                  roomId={roomId}
                  currentMember={currentMember}
                  canvasHistory={canvasHistory || currentRoom.canvasHistory || []}
                />
              )}
              {activeTab === 'chat' && (
                <Chat 
                  roomId={roomId}
                  currentMember={currentMember}
                  messages={messages || currentRoom.messages || []}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-custom rounded-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Leave Room?</h3>
                <p className="text-sm text-secondary">Are you sure you want to leave?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 btn py-3"
              >
                Stay
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Creator Leave Options Modal */}
      {showCreatorLeaveOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-custom rounded-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-violet-500" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">Leave Room</h2>
              <p className="text-sm text-secondary">What would you like to do?</p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Option A - Just Leave */}
              <button
                onClick={handleJustLeave}
                className="w-full p-4 bg-secondary hover:bg-secondary/80 border border-custom rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">Just Leave</h3>
                    <p className="text-sm text-secondary">You leave but the room stays open</p>
                  </div>
                </div>
              </button>

              {/* Option B - End Room */}
              <button
                onClick={handleEndRoom}
                className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-400">End Room for Everyone</h3>
                    <p className="text-sm text-secondary">Close the room for all members</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowCreatorLeaveOptions(false)}
              className="w-full btn py-3"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* End Room Confirmation Modal */}
      {showEndRoomConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-custom rounded-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">End Room for Everyone?</h3>
                <p className="text-sm text-secondary">
                  Are you sure? This will remove ALL members from the room.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndRoomConfirm(false)}
                className="flex-1 btn py-3"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndRoom}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Yes, End Room
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Room;
