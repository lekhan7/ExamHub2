import React from 'react';
import { FileText, Palette, Download, ArrowLeft } from 'lucide-react';

const UserWorkViewer = ({ viewingUser, memberData, onBackToOwnWork, activeTab, setActiveTab }) => {
  if (!viewingUser) return null;

  // Get member-specific data
  const userMemberData = memberData?.[viewingUser.socketId] || memberData?.[viewingUser.displayName] || {};
  const pdf = userMemberData.pdf;
  const notes = userMemberData.notes;
  const canvasHistory = userMemberData.canvasHistory;

  const renderPDFViewer = () => (
    <div className="flex flex-col h-full">
      {pdf ? (
        <>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {pdf.name}
            </h3>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${pdf.data}`;
                link.download = pdf.name;
                link.click();
              }}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4">
            <iframe
              src={`data:application/pdf;base64,${pdf.data}`}
              className="w-full h-full border-0"
              title={pdf.name}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-16 h-16 text-text-secondary mb-4" />
          <p className="text-text-secondary">No PDF uploaded.</p>
        </div>
      )}
    </div>
  );

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
              Read-only view of {viewingUser.displayName}'s sketches
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
    { id: 'pdf', label: '📄 PDF', icon: '📄' },
    { id: 'notes', label: '📝 Notes', icon: '📝' },
    { id: 'canvas', label: '✏️ Sketches', icon: '✏️' }
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
    <div className="flex-1 flex flex-col">
      {/* User Header */}
      <div className="bg-surface border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToOwnWork}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {viewingUser.displayName}'s Work
              </h2>
              <p className="text-sm text-text-secondary">
                {viewingUser.isCreator ? 'Room Creator' : 'Member'}
              </p>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default UserWorkViewer;
