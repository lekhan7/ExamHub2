import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, KeyRound, ArrowRight, Users, BookOpen } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useRoom } from '../context/RoomContext';

function JoinRoom() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { joinRoom } = useRoom();
  const [roomId, setRoomId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState('id'); // 'id' or 'name'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Check localStorage for saved name when roomId changes
  useEffect(() => {
    if (roomId.trim()) {
      const cleanRoomId = roomId.trim();
      if (cleanRoomId.includes('/room/')) {
        const extractedId = cleanRoomId.split('/room/').pop().split('/')[0];
        const savedName = localStorage.getItem(`roomName_${extractedId}`);
        if (savedName) {
          setDisplayName(savedName);
          setShowNameInput(false);
        } else {
          setShowNameInput(true);
          setDisplayName('');
        }
      } else {
        const savedName = localStorage.getItem(`roomName_${cleanRoomId}`);
        if (savedName) {
          setDisplayName(savedName);
          setShowNameInput(false);
        } else {
          setShowNameInput(true);
          setDisplayName('');
        }
      }
    }
  }, [roomId]);

  const handleSubmitId = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter a room ID or link');
      return;
    }
    setError('');
    setStep('name');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!socket) return;

    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);
    setError('');

    // Extract room ID from potential full URL
    let cleanRoomId = roomId.trim();
    if (cleanRoomId.includes('/room/')) {
      cleanRoomId = cleanRoomId.split('/room/').pop().split('/')[0];
    }

    // Save name to localStorage
    localStorage.setItem(`roomName_${cleanRoomId}`, displayName.trim());

    const joinData = {
      roomId: cleanRoomId,
      displayName: displayName.trim(),
      roomCode: roomCode.trim() || undefined
    };

    socket.emit('room:join', joinData);

    socket.once('room:joined', (data) => {
      setLoading(false);
      joinRoom(data.room, data.member);
      navigate(`/room/${cleanRoomId}`);
    });

    socket.once('error', (err) => {
      setLoading(false);
      // Clear saved name if room doesn't exist
      if (err.message?.includes('Room not found')) {
        localStorage.removeItem(`roomName_${cleanRoomId}`);
      }
      setError(err.message || 'Failed to join room');
    });

    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Connection timeout. Please try again.');
      }
    }, 10000);
  };

  const handleDirectJoin = () => {
    if (!socket || !displayName) return;
    
    setLoading(true);
    setError('');

    // Extract room ID from potential full URL
    let cleanRoomId = roomId.trim();
    if (cleanRoomId.includes('/room/')) {
      cleanRoomId = cleanRoomId.split('/room/').pop().split('/')[0];
    }

    const joinData = {
      roomId: cleanRoomId,
      displayName: displayName,
      roomCode: roomCode.trim() || undefined
    };

    socket.emit('room:join', joinData);

    socket.once('room:joined', (data) => {
      setLoading(false);
      joinRoom(data.room, data.member);
      navigate(`/room/${cleanRoomId}`);
    });

    socket.once('error', (err) => {
      setLoading(false);
      // Clear saved name if room doesn't exist
      if (err.message?.includes('Room not found')) {
        localStorage.removeItem(`roomName_${cleanRoomId}`);
      }
      setError(err.message || 'Failed to join room');
    });

    setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Connection timeout. Please try again.');
      }
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Card */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              {step === 'id' ? <KeyRound className="w-8 h-8 text-white" /> : <Users className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {step === 'id' ? 'Join a Private Room' : 'Enter Your Name'}
            </h1>
            <p className="text-secondary">
              {step === 'id' 
                ? 'Paste the room link or enter the room ID' 
                : 'This is how others will see you in the room'}
            </p>
          </div>

          {step === 'id' ? (
            <form onSubmit={handleSubmitId} className="space-y-5">
              {/* Room ID / Link */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Room ID or Link
                </label>
                <input
                  type="text"
                  placeholder="Paste room link or enter ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>

              {/* Room Code (optional for private rooms) */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Room Code <span className="text-muted">(if private)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter code (optional)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="input font-mono"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="w-full btn-primary py-4 text-lg">
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              {!showNameInput ? (
                <>
                  {/* Show saved name and direct join button */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-400 mb-3">
                      Rejoining as <span className="font-semibold">{displayName}</span>
                    </p>
                    <button
                      onClick={handleDirectJoin}
                      disabled={loading}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Room
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
                </>
              ) : (
                <form onSubmit={handleJoin} className="space-y-5">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Your Display Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('id');
                        setShowNameInput(false);
                      }}
                      className="btn flex-1 py-4"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-[2] py-4 text-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Room
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          Don't have a room?{' '}
          <button 
            onClick={() => navigate('/')}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Create one
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default JoinRoom;
