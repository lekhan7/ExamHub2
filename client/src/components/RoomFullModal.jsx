import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Users } from 'lucide-react';

const RoomFullModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBrowseRooms = () => {
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-custom rounded-2xl max-w-md w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5 text-secondary" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-bold text-primary mb-2">
            {t('roomFull.title')}
          </h3>
          
          <p className="text-secondary mb-6">
            {t('roomFull.message')}
          </p>

          <button
            onClick={handleBrowseRooms}
            className="w-full btn-primary py-3"
          >
            {t('roomFull.browseRooms')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomFullModal;
