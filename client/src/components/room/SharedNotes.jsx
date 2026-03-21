import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, List, ListOrdered, Type, Highlighter, Code, Download, Edit3 } from 'lucide-react';
import { buttonHover } from '../../animations/variants';
import { useRoom } from '../../context/RoomContext';
import { formatTimestamp } from '../../utils/helpers';

const SharedNotes = ({ roomId, content }) => {
  const [notes, setNotes] = useState(content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentlyEditing, setCurrentlyEditing] = useState(null);
  const textareaRef = useRef(null);
  
  const { updateNotes, user } = useRoom();

  useEffect(() => {
    setNotes(content || '');
  }, [content]);

  // Listen for notes updates from server
  useEffect(() => {
    const handleNotesUpdated = (data) => {
      console.log('📝 Notes updated from server:', data);
      if (data.content !== undefined) {
        setNotes(data.content);
        setLastSaved(new Date());
      }
      if (data.editedBy && data.editedBy !== user?.displayName) {
        setCurrentlyEditing(data.editedBy);
        setTimeout(() => setCurrentlyEditing(null), 2000);
      }
    };

    // Subscribe to notes updates
    if (window.socket) {
      window.socket.on('notes:updated', handleNotesUpdated);
    }

    return () => {
      if (window.socket) {
        window.socket.off('notes:updated', handleNotesUpdated);
      }
    };
  }, [user?.displayName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing && notes !== content) {
        console.log('💾 Auto-saving notes...', { roomId, notesLength: notes.length });
        updateNotes(roomId, notes, user.displayName);
        setLastSaved(new Date());
        setIsEditing(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [notes, isEditing, content, roomId, user.displayName, updateNotes]);

  const handleTextChange = (e) => {
    setNotes(e.target.value);
    setIsEditing(true);
  };

  const handleFormatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'bullet':
        formattedText = `• ${selectedText}`;
        break;
      case 'numbered':
        formattedText = `1. ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newNotes = notes.substring(0, start) + formattedText + notes.substring(end);
    setNotes(newNotes);
    setIsEditing(true);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const exportNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: Underline, label: 'Underline', action: 'underline' },
    { icon: Type, label: 'Heading 1', action: 'h1' },
    { icon: Type, label: 'Heading 2', action: 'h2' },
    { icon: List, label: 'Bullet List', action: 'bullet' },
    { icon: ListOrdered, label: 'Numbered List', action: 'numbered' },
    { icon: Highlighter, label: 'Highlight', action: 'highlight' },
    { icon: Code, label: 'Code', action: 'code' }
  ];

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-surface2 rounded-lg p-1">
            {formatButtons.map((btn, index) => (
              <motion.button
                key={index}
                {...buttonHover}
                onClick={() => handleFormatText(btn.action)}
                className="p-2 hover:bg-surface rounded transition-colors group"
                title={btn.label}
              >
                <btn.icon className="w-4 h-4 text-text-secondary group-hover:text-text-primary" />
              </motion.button>
            ))}
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Edit3 className="w-4 h-4" />
            <span>Markdown supported</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Currently Editing Indicator */}
          {currentlyEditing && currentlyEditing !== user.displayName && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-sm text-primary"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>{currentlyEditing} is editing...</span>
            </motion.div>
          )}

          {/* Last Saved Indicator */}
          {lastSaved && (
            <div className="text-sm text-text-secondary">
              Last saved {formatTimestamp(lastSaved)}
            </div>
          )}

          {/* Export Button */}
          <motion.button
            {...buttonHover}
            onClick={exportNotes}
            className="flex items-center space-x-2 bg-surface hover:bg-surface2 border border-border text-text-primary px-3 py-1 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </motion.button>
        </div>
      </div>

      {/* Notes Editor */}
      <div className="flex-1 p-6">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleTextChange}
          onFocus={() => setCurrentlyEditing(user.displayName)}
          onBlur={() => setCurrentlyEditing(null)}
          placeholder="Start taking notes together... 

Try formatting:
• **Bold text** for important points
• *Italic text* for emphasis  
• __Underline__ for key terms
• # Heading 1 and ## Heading 2 for structure
• • Bullet points for lists
• 1. Numbered lists for steps
• `Code` for technical terms
• ==Highlight== for crucial information

Everyone sees your changes in real-time!"
          className="w-full h-full bg-surface2 border border-border rounded-lg p-4 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm leading-relaxed"
        />
      </div>
    </div>
  );
};

export default SharedNotes;
