import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, Globe, Lock, Crown, ExternalLink } from 'lucide-react';
import { buttonHover, staggerContainer } from '../animations/variants';
import { useRoom } from '../context/RoomContext';
import { getTimeAgo } from '../utils/helpers';

const MyExams = () => {
  const [myRooms, setMyRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isConnected } = useRoom();

  useEffect(() => {
    // Load user's rooms from localStorage
    const loadMyRooms = () => {
      const displayName = localStorage.getItem('displayName');
      const savedRooms = localStorage.getItem('myRooms');
      
      if (savedRooms) {
        try {
          const rooms = JSON.parse(savedRooms);
          // Filter rooms where user is creator or has joined
          const userRooms = rooms.filter(room => 
            room.creator === displayName || room.joinedBy?.includes(displayName)
          );
          setMyRooms(userRooms);
        } catch (error) {
          console.error('Error loading rooms:', error);
        }
      }
    };

    loadMyRooms();
    
    // Listen for storage changes
    const handleStorageChange = () => loadMyRooms();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getExamTagColor = (tag) => {
    const colors = {
      'UPSC': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'JEE': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'NEET': 'bg-green-500/20 text-green-400 border-green-500/30',
      'GATE': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'CAT': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'SSC': 'bg-red-500/20 text-red-400 border-red-500/30',
      'GRE': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'GMAT': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleEnterRoom = (roomId) => {
    window.location.href = `/room/${roomId}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Connecting to Server...
          </h2>
          <p className="text-text-secondary">
            Please wait while we connect you to the study platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            My Study Rooms
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Access all the study rooms you've created or joined. Continue your collaborative learning journey.
          </p>
        </motion.div>

        {/* Create Room Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="text-center mb-8"
        >
          <motion.button
            {...buttonHover}
            onClick={handleCreateRoom}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Room</span>
          </motion.button>
        </motion.div>

        {/* Rooms Grid */}
        {myRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="text-center py-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <BookOpen className="w-24 h-24 text-primary mx-auto mb-6 relative" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              No Study Rooms Yet
            </h3>
            <p className="text-text-secondary text-lg max-w-md mx-auto mb-8">
              You haven't created or joined any study rooms yet. Start by creating your first room or joining an existing one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                {...buttonHover}
                onClick={handleCreateRoom}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg"
              >
                Create Your First Room
              </motion.button>
              <motion.button
                {...buttonHover}
                onClick={() => window.location.href = '/'}
                className="bg-surface hover:bg-surface2 border border-border text-text-primary font-medium py-3 px-6 rounded-lg"
              >
                Browse Public Rooms
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myRooms.map((room, index) => (
              <motion.div
                key={room.id}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }
                }}
                whileHover={{ y: -4 }}
                className="bg-surface border border-border rounded-xl p-6 hover:bg-surface2 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                      {room.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExamTagColor(room.examTag)}`}>
                        {room.examTag}
                      </span>
                      {room.creator === user?.displayName && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Crown className="w-3 h-3" />
                          <span className="text-xs">Creator</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-text-secondary text-sm">
                      <Users className="w-4 h-4" />
                      <span>{room.memberCount || 0} member{(room.memberCount || 0) !== 1 ? 's' : ''} online</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-text-secondary text-sm">
                      {room.isPublic ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary">
                    Created {getTimeAgo(room.createdAt)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <motion.button
                    {...buttonHover}
                    onClick={() => handleEnterRoom(room.id)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Enter Room</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(room) => {
            setShowCreateModal(false);
            // Add room to localStorage
            const displayName = localStorage.getItem('displayName');
            const newRoom = {
              ...room,
              joinedBy: [displayName]
            };
            
            const existingRooms = JSON.parse(localStorage.getItem('myRooms') || '[]');
            existingRooms.push(newRoom);
            localStorage.setItem('myRooms', JSON.stringify(existingRooms));
            
            // Navigate to room
            window.location.href = `/room/${room.id}`;
          }}
        />
      )}
    </div>
  );
};

// Import CreateRoomModal at the top
import CreateRoomModal from '../components/modals/CreateRoomModal';

export default MyExams;
