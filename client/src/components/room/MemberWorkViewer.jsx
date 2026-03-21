import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Palette, Download } from 'lucide-react';
import { modalOverlay, modalContent } from '../../animations/variants';

const MemberWorkViewer = ({ member, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('pdf');

  if (!member) return null;

  // Get member data from the member object
  const memberData = member.memberData || {};
  const pdf = member.pdf || memberData.pdf;
  const notes = member.notes || memberData.notes;
  const canvasHistory = member.canvasHistory || memberData.canvasHistory;

  const renderPDFViewer = () => {
    if (!pdf) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-16 h-16 text-text-secondary mb-4" />
          <p className="text-text-secondary">No PDF uploaded yet.</p>
        </div>
      );
    }
    
    // Check if pdf.data is a URL (starts with http) or base64 data
    const isUrl = typeof pdf.data === 'string' && pdf.data.startsWith('http');
    const pdfSrc = isUrl ? pdf.data : `data:application/pdf;base64,${pdf.data}`;
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {pdf.name}
          </h3>
          <button
            onClick={() => {
              if (isUrl) {
                // For URLs, open in new tab
                window.open(pdf.data, '_blank');
              } else {
                // For base64, trigger download
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${pdf.data}`;
                link.download = pdf.name;
                link.click();
              }
            }}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={pdfSrc}
            className="w-full h-full border-0"
            title={pdf.name}
          />
        </div>
      </div>
    );
  };

  const renderNotesViewer = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Notes
        </h3>
      </div>
      <div className="flex-1 p-4">
        {notes ? (
          <div className="bg-surface border border-border rounded-lg p-4 h-full">
            <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono">
              {notes}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-text-secondary mb-4" />
            <p className="text-text-secondary">No notes yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCanvasViewer = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Sketch Board
        </h3>
      </div>
      <div className="flex-1 p-4">
        {canvasHistory && canvasHistory.length > 0 ? (
          <div className="bg-surface border border-border rounded-lg p-4 h-full">
            <div className="text-xs text-text-secondary mb-2">
              Read-only view of {member.displayName}'s sketches
            </div>
            <div className="border border-border rounded bg-white">
              {canvasHistory.map((stroke, index) => (
                <div key={index} className="border-b border-border p-2">
                  <div className="text-xs text-text-secondary">
                    {stroke.type === 'text' ? 'Text' : `Drawing (${stroke.color || 'black'})`}
                  </div>
                  {stroke.type === 'text' ? (
                    <div className="p-2 bg-yellow-50 rounded">
                      <p className="text-sm">{stroke.text}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-4xl" style={{ color: stroke.color || 'black' }}>
                        {stroke.type === 'path' ? '✏️ Sketch' : '📍 Point'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Palette className="w-16 h-16 text-text-secondary mb-4" />
            <p className="text-text-secondary">No sketches yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'canvas', label: 'Sketches', icon: '✏️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pdf':
        return renderPDFViewer();
      case 'notes':
        return renderNotesViewer();
      case 'canvas':
        return renderCanvasViewer();
      default:
        return renderPDFViewer();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary flex items-center">
                <span className="text-2xl mr-3">👤</span>
                {member.displayName}'s Work
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {renderTabContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemberWorkViewer;
