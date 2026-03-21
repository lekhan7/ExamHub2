import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Globe, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';
import { useRoom } from '../../context/RoomContext';

function JoinRoomModal({ room, onClose, onSuccess }) {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { joinRoom } = useRoom();
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const isPublic = room?.isPublic ?? room?.is_public ?? true;

  // Check localStorage for saved name when component mounts
  useEffect(() => {
    const savedName = localStorage.getItem(`roomName_${room?.id}`);
    if (savedName) {
      setDisplayName(savedName);
      setShowNameInput(false);
    } else {
      setShowNameInput(true);
    }
  }, [room?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socket) return;

    if (!displayName.trim()) {
      setError(t('joinRoom.displayNameRequired'));
      return;
    }

    if (!isPublic && !roomCode.trim()) {
      setError(t('joinRoom.roomCodeRequired'));
      return;
    }

    setLoading(true);
    setError('');

    // Save name to localStorage
    localStorage.setItem(`roomName_${room.id}`, displayName.trim());

    const joinData = {
      roomId: room.id,
      displayName: displayName.trim(),
      roomCode: !isPublic ? roomCode.trim() : undefined
    };

    socket.emit('room:join', joinData);

    socket.once('room:joined', (data) => {
      setLoading(false);
      joinRoom(data.room, data.member);
      onSuccess();
    });

    socket.once('error', (err) => {
      setLoading(false);
      // Clear saved name if room doesn't exist
      if (err.message?.includes('Room not found')) {
        localStorage.removeItem(`roomName_${room.id}`);
      }
      setError(err.message || t('joinRoom.joinFailed'));
    });

    // Timeout fallback
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(t('joinRoom.connectionTimeout'));
      }
    }, 10000);
  };

  const handleDirectJoin = () => {
    if (!socket || !displayName) return;
    
    setLoading(true);
    setError('');

    const joinData = {
      roomId: room.id,
      displayName: displayName,
      roomCode: !isPublic ? roomCode.trim() : undefined
    };

    socket.emit('room:join', joinData);

    socket.once('room:joined', (data) => {
      setLoading(false);
      joinRoom(data.room, data.member);
      onSuccess();
    });

    socket.once('error', (err) => {
      setLoading(false);
      // Clear saved name if room doesn't exist
      if (err.message?.includes('Room not found')) {
        localStorage.removeItem(`roomName_${room.id}`);
      }
      setError(err.message || t('joinRoom.joinFailed'));
    });

    // Timeout fallback
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(t('joinRoom.connectionTimeout'));
      }
    }, 10000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-custom rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-custom">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">{t('joinRoom.title')}</h2>
                <p className="text-sm text-secondary">{t('joinRoom.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {/* Room Preview */}
          <div className="p-6 pb-2">
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-primary">{room?.name}</h3>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs">
                  {isPublic ? (
                    <><Globe className="w-3 h-3" /> {t('home.public')}</>
                  ) : (
                    <><Lock className="w-3 h-3" /> {t('home.private')}</>
                  )}
                </div>
              </div>
              <div className="text-sm text-secondary flex items-center gap-2">
                <span className="text-accent">{room?.examTag}</span>
                <span>•</span>
                <span>{room?.memberCount || 1} {t('joinRoom.memberCount', { count: room?.memberCount || 1 })}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          {!showNameInput ? (
            <div className="p-6 space-y-5">
              {/* Show saved name and direct join button */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-green-400 mb-3">
                  Joining as <span className="font-semibold">{displayName}</span>
                </p>
                <button
                  onClick={handleDirectJoin}
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('joinRoom.joining')}
                    </>
                  ) : (
                    <>
                      Rejoin Room
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setShowNameInput(true)}
                className="w-full btn py-3 text-sm"
              >
                Join with different name
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('joinRoom.displayNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('joinRoom.displayNamePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                />
              </div>

              {/* Room Code (private rooms only) */}
              {!isPublic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('joinRoom.roomCodeLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('joinRoom.roomCodePlaceholder')}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="input font-mono text-center tracking-wider"
                  />
                  <p className="text-xs text-muted mt-1">
                    {t('joinRoom.privateRoomNote')}
                  </p>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('joinRoom.joining')}
                  </>
                ) : (
                  <>
                    {t('joinRoom.joinNow')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default JoinRoomModal;
