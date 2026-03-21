import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';

const EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '🎉', '🔥', '👏', '🤔', '😢'];

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getAvatarColor(name) {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function Chat({ roomId, currentMember, messages }) {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const messageData = {
      roomId,
      displayName: currentMember?.displayName,
      message: input.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit('chat:message', messageData);
    setInput('');
    setShowEmojis(false);
  };

  const handleEmojiClick = (emoji) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="font-semibold text-primary mb-2">{t('room.chat.noMessages')}</h3>
            <p className="text-sm text-secondary">{t('room.chat.startConversation')}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.displayName === currentMember?.displayName;
              const showAvatar = index === 0 || messages[index - 1].displayName !== msg.displayName;
              
              return (
                <motion.div
                  key={`${msg.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.displayName)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {getInitials(msg.displayName)}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}
                    
                    {/* Message */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <span className="text-xs text-secondary mb-1">
                          {msg.displayName}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl max-w-full break-words ${
                          isMe
                            ? 'bg-violet-500 text-white rounded-br-md'
                            : 'bg-secondary text-primary rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-card border-t border-custom"
          >
            <div className="flex items-center gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-card border-t border-custom">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-3 text-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('room.chat.placeholder')}
            className="flex-1 bg-secondary border border-custom rounded-xl px-4 py-3 text-primary placeholder-secondary outline-none focus:border-violet-500/50 transition-colors"
          />
          
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
