import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { buttonHover } from '../../animations/variants';
import socketService from '../../socket/socket';

const MemberPDFUpload = ({ roomId, user }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const pdfData = event.target.result;
        
        // Get user ID from socket or create one
        const userId = user?.socketId || 'user-' + Date.now();
        
        // Check if user is creator
        const isCreator = user?.isCreator || false;
        
        if (isCreator) {
          // Creator's PDF is shared with everyone
          socketService.emit('pdf:upload', {
            roomId,
            pdfData,
            fileName: file.name,
            uploadedBy: user?.displayName || 'User',
            isPrivate: false
          });
          
          console.log('📤 Uploading shared PDF for creator:', user?.displayName);
        } else {
          // Non-creator PDF is private
          socketService.emit('pdf:upload', {
            roomId,
            pdfData,
            fileName: file.name,
            uploadedBy: user?.displayName || 'User',
            isPrivate: true
          });
          
          console.log('📤 Uploading private PDF for user:', user?.displayName);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ Error reading file:', err);
      setError('Failed to read file');
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Upload Your PDF
        </h3>
        {uploading && (
          <div className="text-xs text-primary animate-pulse">
            Uploading...
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-border rounded-lg p-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4
            file:border-0 file:rounded file:bg-surface file:text-text-primary
            hover:file:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 cursor-not-allowed"
        />
        
        <div className="flex items-center justify-center text-center">
          <Upload className="w-8 h-8 text-text-secondary mb-2" />
          <p className="text-sm text-text-secondary">
            {uploading ? 'Uploading your PDF...' : 'Click to upload your PDF'}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            This PDF will be stored under your user profile and visible to others
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberPDFUpload;
