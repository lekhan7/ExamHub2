import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Pencil, 
  FileText,
  Globe,
  Lock,
  Crown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';
import CreateRoomModal from '../components/modals/CreateRoomModal';
import JoinRoomModal from '../components/modals/JoinRoomModal';
import LanguageSelector from '../components/LanguageSelector';
import RoomFullModal from '../components/RoomFullModal';

const SERVER_URL = 'http://localhost:3001';

const examIcons = {
  'UPSC Civil Services': '🏛️',
  'SSC CGL': '📊',
  'SSC CHSL': '📝',
  'SSC MTS': '📋',
  'IBPS PO': '🏦',
  'IBPS Clerk': '💰',
  'SBI PO': '🏛️',
  'SBI Clerk': '💵',
  'RBI Grade B': '🏦',
  'SEBI Grade A': '📈',
  'NEET UG': '🩺',
  'JEE Main': '🔬',
  'JEE Advanced': '🧮',
  'GATE': '⚙️',
  'CAT': '📚',
  'GMAT': '🌐',
  'GRE': '🎓',
  'IELTS/TOEFL': '🗣️',
  'NDA': '🎖️',
  'CDS': '⚔️',
  'AFCAT': '✈️',
  'RRB NTPC': '🚂',
  'RRB Group D': '🛤️',
  'CLAT': '⚖️',
  'AILET': '📜',
  'CA Foundation': '📊',
  'CS Foundation': '📋',
};

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { publicRooms, updatePublicRooms } = useRoom();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePrivateModal, setShowCreatePrivateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRoomFullModal, setShowRoomFullModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch public rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/rooms`);
        const rooms = await response.json();
        updatePublicRooms(rooms);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [updatePublicRooms]);

  // Listen for real-time room updates
  useEffect(() => {
    if (!socket) return;

    const handlePublicRoomsUpdate = (rooms) => {
      updatePublicRooms(rooms);
    };

    const handleRoomFull = () => {
      setShowRoomFullModal(true);
    };

    socket.on('publicRooms:update', handlePublicRoomsUpdate);
    socket.on('room_full', handleRoomFull);
    
    return () => {
      socket.off('publicRooms:update', handlePublicRoomsUpdate);
      socket.off('room_full', handleRoomFull);
    };
  }, [socket, updatePublicRooms]);

  const handleJoinClick = (room) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  const features = [
    { icon: FileText, title: t('home.features.pdf'), desc: t('home.features.pdfDesc') },
    { icon: Pencil, title: t('home.features.notes'), desc: t('home.features.notesDesc') },
    { icon: MessageCircle, title: t('home.features.chat'), desc: t('home.features.chatDesc') },
    { icon: BookOpen, title: t('home.features.whiteboard'), desc: t('home.features.whiteboardDesc') },
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">{t('home.title')}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <LanguageSelector />
              <div className="flex items-center gap-2 text-sm text-secondary">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? t('common.connected') : t('common.disconnected')}
              </div>
              <button
                onClick={() => navigate('/join')}
                className="btn hidden sm:flex"
              >
                <Globe className="w-4 h-4" />
                {t('navbar.joinRoom')}
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                {t('home.hero.tagline')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-primary">{t('home.hero.title')}</span>
              <br />
              <span className="gradient-text">{t('home.hero.subtitle')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary max-w-2xl mx-auto mb-10"
            >
              {t('home.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-8 py-4 text-lg animate-pulse-glow"
              >
                <Plus className="w-5 h-5" />
                {t('home.createRoom')}
              </button>
              <button
                onClick={() => setShowCreatePrivateModal(true)}
                className="btn px-8 py-4 text-lg border-2 border-violet-500/50 hover:border-violet-500"
              >
                <Lock className="w-5 h-5" />
                {t('home.createRoom')} {t('createRoom.private')}
              </button>
              <button
                onClick={() => navigate('/join')}
                className="btn px-8 py-4 text-lg"
              >
                <Globe className="w-5 h-5" />
                {t('home.joinRoom')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Rooms Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">{t('home.sections.publicRooms')}</h2>
              <p className="text-secondary">{t('home.sections.publicRoomsDesc')}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('home.sections.roomsActive', { count: publicRooms.length })}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : publicRooms.length === 0 ? (
            <div className="text-center py-20 card">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t('home.sections.noPublicRoomsTitle')}</h3>
              <p className="text-secondary mb-6">{t('home.sections.noPublicRoomsDesc')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                {t('home.createRoom')}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center text-2xl">
                        {examIcons[room.examTag] || '📚'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary line-clamp-1">{room.name}</h3>
                        <p className="text-sm text-accent">{t('home.exam')}: {room.examTag}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-secondary">
                      <Users className="w-4 h-4" />
                      {t('home.userCount', { current: room.memberCount || 1, max: 10 })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {t('home.live')}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs">
                      <Globe className="w-3 h-3" />
                      {t('home.public')}
                    </div>
                    {(room.memberCount || 1) >= 10 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                        {t('home.full')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="truncate max-w-[100px]">{room.creator}</span>
                    </div>
                    <button
                      onClick={() => handleJoinClick(room)}
                      disabled={(room.memberCount || 1) >= 10}
                      className={`btn-primary px-6 ${(room.memberCount || 1) >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={(room.memberCount || 1) >= 10 ? t('home.roomFullTooltip') : ''}
                    >
                      {t('home.join')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(roomId) => navigate(`/room/${roomId}`)}
          initialIsPublic={null}
        />
      )}

      {/* Create Private Room Modal */}
      {showCreatePrivateModal && (
        <CreateRoomModal 
          onClose={() => setShowCreatePrivateModal(false)}
          onSuccess={(roomId) => navigate(`/room/${roomId}`)}
          initialIsPublic={false}
        />
      )}

      {/* Join Room Modal */}
      {showJoinModal && selectedRoom && (
        <JoinRoomModal
          room={selectedRoom}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => navigate(`/room/${selectedRoom.id}`)}
        />
      )}

      {/* Room Full Modal */}
      <RoomFullModal 
        isOpen={showRoomFullModal}
        onClose={() => setShowRoomFullModal(false)}
      />

      {/* Floating Create Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center z-40 hover:shadow-violet-500/50 transition-all"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

export default Home;
