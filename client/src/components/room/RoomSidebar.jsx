import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, Globe, Lock, Copy, LogOut, User, FileText } from 'lucide-react';
import { buttonHover, memberSlide, pulseDot } from '../../animations/variants';
import MemberWorkViewer from './MemberWorkViewer';

const RoomSidebar = ({ room, members, memberData, user, onLeaveRoom, onViewUserWork }) => {
  const [copied, setCopied] = useState(false);

  // Get member-specific data for display
  const getMemberData = (member) => {
    const userId = member.socketId || member.displayName;
    return memberData?.[userId] || {};
  };

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

  const copyInviteLink = async () => {
    try {
      const inviteUrl = `${window.location.origin}/room/${room.id}${!room.isPublic ? `?code=${room.roomCode}` : ''}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Room Info */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary mb-3 line-clamp-2">
          {room.name}
        </h1>
        
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExamTagColor(room.examTag)}`}>
            {room.examTag}
          </span>
          <div className="flex items-center space-x-1 text-text-secondary">
            {room.isPublic ? (
              <Globe className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            <span className="text-xs">{room.isPublic ? 'Public' : 'Private'}</span>
          </div>
        </div>

        {/* Room Code for Private Rooms */}
        {!room.isPublic && (
          <div className="bg-surface2 border border-border rounded-lg p-3 mb-3">
            <div className="text-xs text-text-secondary mb-1">Room Code:</div>
            <div className="font-mono font-bold text-primary text-sm">
              {room.roomCode}
            </div>
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            In this room ({members.length})
          </h2>
          <Users className="w-4 h-4 text-text-secondary" />
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {members.map((member) => (
              <motion.div
                key={member.socketId}
                variants={memberSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center space-x-3 p-3 hover:bg-surface2 rounded-lg cursor-pointer transition-colors"
                onClick={() => onViewUserWork && onViewUserWork(member)}
              >
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <motion.div
                    variants={pulseDot}
                    animate="animate"
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface"
                  />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {member.displayName}
                    </span>
                    {member.isCreator && (
                      <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    )}
                    {/* PDF Badge */}
                    {(() => {
                      const memberSpecificData = getMemberData(member);
                      return memberSpecificData.pdf && (
                        <div className="flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          <FileText className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-20">{memberSpecificData.pdf.name}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {member.isCreator ? 'Room Creator' : 'Member'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border space-y-3">
        <motion.button
          {...buttonHover}
          onClick={copyInviteLink}
          className="w-full bg-surface hover:bg-surface2 border border-border text-text-primary font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {copied ? (
            <>
              <div className="w-4 h-4 text-success" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Invite Link</span>
            </>
          )}
        </motion.button>

        <motion.button
          {...buttonHover}
          onClick={onLeaveRoom}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </motion.button>
      </div>
    </div>
  );
};

export default RoomSidebar;
