import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Globe, Lock, Copy, Check, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';
import { useRoom } from '../../context/RoomContext';

const EXAM_OPTIONS = [
  'UPSC Civil Services',
  'SSC CGL',
  'SSC CHSL',
  'SSC MTS',
  'IBPS PO',
  'IBPS Clerk',
  'SBI PO',
  'SBI Clerk',
  'RBI Grade B',
  'SEBI Grade A',
  'NEET UG',
  'JEE Main',
  'JEE Advanced',
  'GATE',
  'CAT',
  'GMAT',
  'GRE',
  'IELTS/TOEFL',
  'NDA',
  'CDS',
  'AFCAT',
  'RRB NTPC',
  'RRB Group D',
  'CLAT',
  'AILET',
  'CA Foundation',
  'CS Foundation',
  'Custom'
];

function CreateRoomModal({ onClose, onSuccess, initialIsPublic = null }) {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const { setCurrentMember, joinRoom } = useRoom();
  const [step, setStep] = useState('form');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    roomName: '',
    examTag: 'UPSC Civil Services',
    customExam: '',
    creatorName: '',
    isPublic: initialIsPublic !== null ? initialIsPublic : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socket) return;

    setLoading(true);
    
    const roomData = {
      roomName: formData.roomName,
      examTag: formData.examTag === 'Custom' ? formData.customExam : formData.examTag,
      isPublic: formData.isPublic,
      creatorName: formData.creatorName
    };

    socket.emit('room:create', roomData);

    socket.once('room:created', (data) => {
      setLoading(false);
      setCreatedRoom(data.room);
      setCurrentMember(data.member);
      joinRoom(data.room, data.member);
      setStep('success');
    });

    socket.once('error', (error) => {
      setLoading(false);
      console.error('Room creation failed:', error);
    });
  };

  const handleEnterRoom = () => {
    if (createdRoom) {
      onSuccess(createdRoom.id);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${createdRoom.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="bg-card border border-custom rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-custom">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                {step === 'form' ? (
                  initialIsPublic === false ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )
                ) : (
                  <Crown className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {step === 'form' 
                    ? (initialIsPublic === false ? t('createRoom.privateTitle') : t('createRoom.title'))
                    : t('createRoom.roomCreated')}
                </h2>
                <p className="text-sm text-secondary">
                  {step === 'form' 
                    ? (initialIsPublic === false ? t('createRoom.privateDesc') : t('createRoom.description'))
                    : t('createRoom.shareAndStudy')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UPSC History Group"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="input"
                />
              </div>

              {/* Exam Selection */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Competitive Exam
                </label>
                <select
                  value={formData.examTag}
                  onChange={(e) => setFormData({ ...formData, examTag: e.target.value })}
                  className="input"
                >
                  {EXAM_OPTIONS.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              {/* Custom Exam Input */}
              {formData.examTag === 'Custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium text-primary mb-2">
                    Custom Exam Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter exam name"
                    value={formData.customExam}
                    onChange={(e) => setFormData({ ...formData, customExam: e.target.value })}
                    className="input"
                  />
                </motion.div>
              )}

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Your Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={formData.creatorName}
                  onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                  className="input"
                />
                <p className="text-xs text-muted mt-1">This is how others will see you in the room</p>
              </div>

              {/* Room Type Toggle - Only show when not pre-selected */}
              {initialIsPublic === null && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-3">
                    Room Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPublic: true })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.isPublic
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-custom hover:border-violet-500/50'
                      }`}
                    >
                      <Globe className={`w-6 h-6 ${formData.isPublic ? 'text-violet-400' : 'text-secondary'}`} />
                      <span className={`font-medium ${formData.isPublic ? 'text-violet-400' : 'text-secondary'}`}>
                        Public
                      </span>
                      <span className="text-xs text-muted">Anyone can join</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPublic: false })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        !formData.isPublic
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-custom hover:border-violet-500/50'
                      }`}
                    >
                      <Lock className={`w-6 h-6 ${!formData.isPublic ? 'text-violet-400' : 'text-secondary'}`} />
                      <span className={`font-medium ${!formData.isPublic ? 'text-violet-400' : 'text-secondary'}`}>
                        Private
                      </span>
                      <span className="text-xs text-muted">Invite only</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden Room Type Indicator - Show when pre-selected */}
              {initialIsPublic !== null && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-violet-400" />
                    <div>
                      <span className="font-medium text-primary">Private Room</span>
                      <p className="text-xs text-muted">This room will be hidden and only accessible via room code</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Room
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="p-6 space-y-5">
              {/* Success Message */}
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {createdRoom?.isPublic ? 'Public Room Created!' : 'Private Room Ready!'}
                </h3>
                <p className="text-secondary">
                  {createdRoom?.isPublic 
                    ? 'Your room is now visible on the homepage'
                    : 'Share the room code to invite others'
                  }
                </p>
              </div>

              {/* Room Info */}
              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Room Name</span>
                  <span className="font-medium text-primary">{createdRoom?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Exam</span>
                  <span className="font-medium text-accent">{createdRoom?.examTag}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Type</span>
                  <span className="font-medium text-primary">
                    {createdRoom?.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>

              {/* Room Code (for private rooms) */}
              {!createdRoom?.isPublic && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                  <label className="block text-sm font-medium text-violet-400 mb-2">
                    Room Code
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-secondary px-4 py-3 rounded-lg font-mono text-lg text-primary text-center">
                      {createdRoom?.roomCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdRoom?.roomCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-3 bg-secondary hover:bg-hover rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-2 text-center">
                    Share this code with people you want to invite
                  </p>
                </div>
              )}

              {/* Share Link */}
              <div className="bg-secondary rounded-xl p-4">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Room Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/room/${createdRoom?.id}`}
                    className="flex-1 bg-primary px-4 py-2 rounded-lg text-sm text-primary outline-none"
                  />
                  <button
                    onClick={copyRoomLink}
                    className="btn"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleEnterRoom}
                  className="w-full btn-primary py-4 text-lg"
                >
                  Enter Room →
                </button>
                <button
                  onClick={onClose}
                  className="w-full btn py-3"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateRoomModal;
