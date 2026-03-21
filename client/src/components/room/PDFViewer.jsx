import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

const PDFViewer = ({ currentPdf, isCreator, socket, roomId }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  console.log('🔍 PDFViewer component - currentPdf prop:', currentPdf);
  console.log('🔍 PDFViewer component - currentPdf type:', typeof currentPdf);
  console.log('🔍 PDFViewer component - has PDF data:', !!currentPdf?.data);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only');
      return;
    }

    console.log('📄 File validation:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file size - reject very small files (likely corrupted)
    if (file.size < 1000) {
      console.log('❌ File too small:', file.size, 'bytes');
      alert(`❌ File too small (${file.size} bytes). This appears to be a corrupted PDF. Please select a valid PDF file.`);
      return;
    }

    console.log('✅ File validation passed, proceeding with upload');
    // If we get here, file appears valid, proceed with upload
    await performUpload(file);
  };

  const performUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('roomId', roomId);

      const response = await fetch('https://examhub2-ro0x.onrender.com/api/upload-pdf', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (data.success) {
        // Tell server to broadcast to all room members
        socket.emit('pdf:upload', {
          roomId,
          pdf: {
            data: data.url,
            name: file.name,
            uploadedBy: 'creator',
            fileSize: file.size,
          },
        });
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // No PDF uploaded yet
  if (!currentPdf || !currentPdf.data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
        color: '#aaa'
      }}>
        <p>No PDF uploaded yet</p>
        {isCreator && (
          <label style={{
            cursor: 'pointer',
            background: '#6d28d9',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {uploading ? 'Uploading...' : '📄 Upload PDF'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        )}
        {!isCreator && (
          <p style={{ fontSize: '13px' }}>
            Waiting for creator to upload a PDF...
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  // PDF uploaded — show iframe directly (no PDF.js)
  const pdfUrl = currentPdf.data;
  console.log('🔗 PDFViewer - pdfUrl:', pdfUrl);
  console.log('🔗 PDFViewer - pdfUrl type:', typeof pdfUrl);
  console.log('🔗 PDFViewer - pdfUrl length:', pdfUrl?.length);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: '#1e1e2e',
        borderBottom: '1px solid #333'
      }}>
        <span style={{ color: '#ccc', fontSize: '14px' }}>
          📄 {currentPdf.name}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isCreator && (
            <label style={{
              cursor: 'pointer',
              background: '#6d28d9',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              {uploading ? 'Uploading...' : '↑ Replace PDF'}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* PDF Render Area - IFRAME ONLY */}
      <div style={{ padding: '16px', height: 'calc(100% - 60px)' }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ 
            border: 'none', 
            borderRadius: '8px',
            minHeight: '600px'
          }}
          title={currentPdf.name}
          onLoad={() => console.log('✅ PDF iframe loaded successfully')}
          onError={(e) => {
            console.error('❌ PDF iframe error:', e);
            console.error('❌ PDF iframe src:', pdfUrl);
            setError('Failed to load PDF. The file may be corrupted or inaccessible.');
          }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
