import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserX, FileText, Edit3, X } from 'lucide-react';
import { toastSlide } from '../../animations/variants';
import { useRoom } from '../../context/RoomContext';

const ToastNotifications = () => {
  const [toasts, setToasts] = useState([]);
  const { members, user } = useRoom();

  useEffect(() => {
    // Listen for member join/leave events
    const handleMemberJoined = (data) => {
      if (data.displayName !== user?.displayName) {
        addToast({
          id: Date.now(),
          type: 'join',
          message: `${data.displayName} joined the room`,
          icon: UserCheck,
          color: 'success'
        });
      }
    };

    const handleMemberLeft = (data) => {
      if (data.displayName !== user?.displayName) {
        addToast({
          id: Date.now(),
          type: 'leave',
          message: `${data.displayName} left the room`,
          icon: UserX,
          color: 'warning'
        });
      }
    };

    const handlePDFUploaded = (data) => {
      addToast({
        id: Date.now(),
        type: 'pdf',
        message: `${data.uploadedBy} shared a PDF: ${data.fileName}`,
        icon: FileText,
        color: 'primary'
      });
    };

    const handleNotesUpdated = (data) => {
      if (data.editedBy !== user?.displayName) {
        addToast({
          id: Date.now(),
          type: 'notes',
          message: `${data.editedBy} updated the notes`,
          icon: Edit3,
          color: 'info'
        });
      }
    };

    // Set up event listeners
    window.addEventListener('room:memberJoined', handleMemberJoined);
    window.addEventListener('room:memberLeft', handleMemberLeft);
    window.addEventListener('pdf:uploaded', handlePDFUploaded);
    window.addEventListener('notes:updated', handleNotesUpdated);

    return () => {
      window.removeEventListener('room:memberJoined', handleMemberJoined);
      window.removeEventListener('room:memberLeft', handleMemberLeft);
      window.removeEventListener('pdf:uploaded', handlePDFUploaded);
      window.removeEventListener('notes:updated', handleNotesUpdated);
    };
  }, [user]);

  const addToast = (toast) => {
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastColor = (color) => {
    const colors = {
      success: 'bg-success/10 border-success/30 text-success',
      warning: 'bg-warning/10 border-warning/30 text-warning',
      primary: 'bg-primary/10 border-primary/30 text-primary',
      info: 'bg-info/10 border-info/30 text-info'
    };
    return colors[color] || colors.info;
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={toastSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm min-w-[300px] max-w-md ${getToastColor(toast.color)}`}
          >
            <toast.icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">
              {toast.message}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;
