import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Lock, Globe, Wifi } from 'lucide-react';
import { roomCard, pulseDot, buttonHover } from '../../animations/variants';

const PublicRoomCard = ({ room, index, onJoinRoom }) => {
  const [savedName, setSavedName] = useState(null);

  // Check localStorage for saved name when component mounts or room changes
  useEffect(() => {
    const saved = localStorage.getItem(`roomName_${room.id}`);
    setSavedName(saved);
  }, [room.id]);
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <motion.div
      variants={roomCard}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ y: -4 }}
      className="bg-surface border border-border rounded-xl p-6 hover:bg-surface2 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Room Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
            {room.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExamTagColor(room.examTag)}`}>
              {room.examTag}
            </span>
            <div className="flex items-center space-x-1 text-success">
              <motion.div
                variants={pulseDot}
                animate="animate"
                className="w-2 h-2 bg-success rounded-full"
              />
              <span className="text-xs font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Users className="w-4 h-4" />
          <span>Created by {room.creator}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-text-secondary text-sm">
            <Users className="w-4 h-4" />
            <span>{room.memberCount} member{room.memberCount !== 1 ? 's' : ''} online</span>
          </div>
          
          <div className="flex items-center space-x-1 text-text-secondary text-sm">
            <Globe className="w-4 h-4" />
            <span>Public</span>
          </div>
        </div>

        <div className="text-xs text-text-secondary">
          Created {formatTimeAgo(room.createdAt)}
        </div>
      </div>

      {/* Join Button */}
      <motion.button
        {...buttonHover}
        onClick={() => onJoinRoom(room)}
        className={`w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
          savedName 
            ? 'border-2 border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400' 
            : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>
          {savedName ? `Rejoin as ${savedName} →` : 'Join Room'}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default PublicRoomCard;
