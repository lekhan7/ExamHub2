import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, User, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';

function Notes({ roomId, notes: initialNotes, currentMember }) {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const [notes, setNotes] = useState(initialNotes?.content || initialNotes || '');
  const [savedBy, setSavedBy] = useState(initialNotes?.savedBy || null);
  const [savedAt, setSavedAt] = useState(initialNotes?.savedAt || null);
  const [isSaved, setIsSaved] = useState(!!initialNotes?.savedBy);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with parent state when initialNotes changes
  useEffect(() => {
    if (initialNotes) {
      if (typeof initialNotes === 'object' && initialNotes.content !== undefined) {
        setNotes(initialNotes.content);
        setSavedBy(initialNotes.savedBy || null);
        setSavedAt(initialNotes.savedAt || null);
        setIsSaved(!!initialNotes.savedBy);
      } else {
        setNotes(initialNotes);
      }
    }
  }, [initialNotes]);

  // Listen for notes updates from server
  useEffect(() => {
    if (!socket) return;

    const handleNotesUpdated = (data) => {
      if (data.editedBy !== currentMember?.displayName) {
        setNotes(data.content);
        setSavedBy(data.savedBy || null);
        setSavedAt(data.savedAt || null);
        setIsSaved(!!data.savedBy);
        setHasChanges(false);
      }
    };

    socket.on('notes:updated', handleNotesUpdated);
    return () => socket.off('notes:updated', handleNotesUpdated);
  }, [socket, currentMember]);

  const handleChange = (e) => {
    // Don't allow editing if already saved by someone
    if (isSaved) return;
    
    setNotes(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!socket || !notes.trim()) return;
    
    setIsSaving(true);
    
    const saveData = {
      roomId,
      content: notes,
      savedBy: currentMember?.displayName,
      savedAt: new Date().toISOString()
    };
    
    socket.emit('notes:save', saveData);
    
    // Update local state immediately
    setSavedBy(currentMember?.displayName);
    setSavedAt(saveData.savedAt);
    setIsSaved(true);
    setHasChanges(false);
    setIsSaving(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-custom">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            {isSaved ? (
              <Lock className="w-5 h-5 text-violet-400" />
            ) : (
              <Save className="w-5 h-5 text-violet-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-primary">{t('room.tabs.notes')}</h3>
            <p className="text-xs text-secondary">
              {isSaved 
                ? `${t('room.notes.savedBy')} ${savedBy}` 
                : t('room.notes.typeAndSave')
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isSaved && savedBy && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm">
              <User className="w-4 h-4" />
              <span>{t('room.notes.savedBy')} <strong>{savedBy}</strong></span>
            </div>
          )}
          
          {!isSaved && (
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !notes.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                hasChanges && notes.trim()
                  ? 'bg-violet-500 hover:bg-violet-600 text-white'
                  : 'bg-violet-500/20 text-violet-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('room.notes.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('room.notes.save')}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-hidden">
        <textarea
          value={notes}
          onChange={handleChange}
          disabled={isSaved}
          placeholder={isSaved 
            ? t('room.notes.lockedPlaceholder')
            : t('room.notes.placeholder')
          }
          className={`w-full h-full bg-card border border-custom rounded-xl p-6 text-primary resize-none outline-none transition-colors leading-relaxed ${
            isSaved 
              ? 'cursor-not-allowed opacity-70 bg-secondary/50' 
              : 'focus:border-violet-500/50'
          }`}
        />
      </div>

      {/* Footer */}
      <div className="p-3 bg-card border-t border-custom">
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>{notes.length} characters</span>
          {isSaved && savedAt && (
            <span className="flex items-center gap-1 text-green-400">
              <Check className="w-3 h-3" />
              Saved at {new Date(savedAt).toLocaleTimeString()} by {savedBy}
            </span>
          )}
          {!isSaved && hasChanges && (
            <span className="flex items-center gap-1 text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
