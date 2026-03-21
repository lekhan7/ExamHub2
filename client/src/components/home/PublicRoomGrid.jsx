import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Lock, Globe, Wifi, WifiOff } from 'lucide-react';
import { staggerContainer, roomCard, pulseDot } from '../../animations/variants';
import PublicRoomCard from './PublicRoomCard';

const PublicRoomGrid = ({ rooms, onJoinRoom, isConnected }) => {
  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <WifiOff className="w-16 h-16 text-text-secondary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Connecting to Server...
        </h3>
        <p className="text-text-secondary">
          Please wait while we connect you to the study rooms.
        </p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <Users className="w-16 h-16 text-primary mx-auto mb-4 relative" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-4">
          No rooms yet. Be the first!
        </h3>
        <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
          Create a study room and start collaborating with other exam aspirants.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.dispatchEvent(new CustomEvent('openCreateRoomModal'))}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Create the First Room
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {rooms.map((room, index) => (
          <PublicRoomCard
            key={room.id}
            room={room}
            index={index}
            onJoinRoom={onJoinRoom}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default PublicRoomGrid;
