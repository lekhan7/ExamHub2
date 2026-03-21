import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';
import socketService from '../socket/socket';

export const useCanvas = (roomId) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#6366F1');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const strokesRef = useRef([]); // Store all strokes for redrawing
  
  const { drawStroke, addText, clearCanvas, user } = useRoom();

  // Listen for strokes from other users
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleCanvasStroke = (strokeData) => {
      console.log('🎨 Received canvas stroke:', strokeData);
      // Don't redraw our own strokes (already drawn locally)
      if (strokeData.drawnBy !== user?.displayName) {
        strokesRef.current.push(strokeData);
        drawStrokeOnCanvas(strokeData);
      }
    };

    const handleCanvasText = (textData) => {
      console.log('📝 Received canvas text:', textData);
      if (textData.drawnBy !== user?.displayName) {
        strokesRef.current.push(textData);
        drawTextOnCanvas(textData);
      }
    };

    const handleCanvasCleared = (data) => {
      console.log('🧹 Canvas cleared by:', data.clearedBy);
      strokesRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on('canvas:stroke', handleCanvasStroke);
    socket.on('canvas:text', handleCanvasText);
    socket.on('canvas:cleared', handleCanvasCleared);

    return () => {
      socket.off('canvas:stroke', handleCanvasStroke);
      socket.off('canvas:text', handleCanvasText);
      socket.off('canvas:cleared', handleCanvasCleared);
    };
  }, [user?.displayName]);

  // Function to draw a stroke on canvas
  const drawStrokeOnCanvas = useCallback((stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.beginPath();
    
    switch (stroke.tool) {
      case 'pen':
      case 'eraser':
        // For pen strokes, we would need the full path
        // For now, draw a dot at the start position
        ctx.moveTo(stroke.startX, stroke.startY);
        ctx.lineTo(stroke.endX, stroke.endY);
        break;
      case 'line':
        ctx.moveTo(stroke.startX, stroke.startY);
        ctx.lineTo(stroke.endX, stroke.endY);
        break;
      case 'rectangle':
        ctx.rect(stroke.startX, stroke.startY, stroke.endX - stroke.startX, stroke.endY - stroke.startY);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(stroke.endX - stroke.startX, 2) + Math.pow(stroke.endY - stroke.startY, 2));
        ctx.arc(stroke.startX, stroke.startY, radius, 0, 2 * Math.PI);
        break;
    }
    
    ctx.stroke();
  }, []);

  // Function to draw text on canvas
  const drawTextOnCanvas = useCallback((textData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.font = `${textData.fontSize || 16}px Arial`;
    ctx.fillStyle = textData.color;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillText(textData.text, textData.x, textData.y);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Redraw all strokes from history
    if (canvasHistory && canvasHistory.length > 0) {
      canvasHistory.forEach(stroke => {
        drawStrokeOnCanvas(stroke);
      });
    }
  }, [canvasHistory, drawStrokeOnCanvas]);

  const startDrawing = useCallback((e) => {
    if (currentTool === 'text') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [currentTool]);

  const draw = useCallback((e) => {
    if (!isDrawing || currentTool === 'text') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = strokeWidth;
    
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }, [isDrawing, currentTool, currentColor, strokeWidth]);

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool !== 'text' && currentTool !== 'eraser') {
      const strokeData = {
        tool: currentTool,
        color: currentColor,
        strokeWidth,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        timestamp: Date.now(),
        drawnBy: user?.displayName
      };
      
      drawStroke(roomId, strokeData);
    }
    
    setIsDrawing(false);
  }, [isDrawing, currentTool, currentColor, strokeWidth, roomId, user, drawStroke]);

  const drawShape = useCallback((startX, startY, endX, endY, shape) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = strokeWidth;
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.beginPath();
    
    switch (shape) {
      case 'line':
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        break;
      case 'rectangle':
        ctx.rect(startX, startY, endX - startX, endY - startY);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        break;
    }
    
    ctx.stroke();
    
    const strokeData = {
      tool: shape,
      color: currentColor,
      strokeWidth,
      startX,
      startY,
      endX,
      endY,
      timestamp: Date.now(),
      drawnBy: user?.displayName
    };
    
    drawStroke(roomId, strokeData);
  }, [currentColor, strokeWidth, roomId, user, drawStroke]);

  const addTextToCanvas = useCallback((x, y, text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${strokeWidth * 8}px Arial`;
    ctx.fillStyle = currentColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillText(text, x, y);
    
    const textData = {
      tool: 'text',
      text,
      x,
      y,
      color: currentColor,
      fontSize: strokeWidth * 8,
      timestamp: Date.now(),
      drawnBy: user?.displayName
    };
    
    addText(roomId, textData);
  }, [currentColor, strokeWidth, roomId, user, addText]);

  const clearCanvasLocal = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    clearCanvas(roomId, user?.displayName);
  }, [roomId, user, clearCanvas]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvasHistory.forEach((stroke) => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.strokeWidth;
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
      
      if (stroke.tool === 'text') {
        ctx.font = `${stroke.fontSize}px Arial`;
        ctx.fillStyle = stroke.color;
        ctx.fillText(stroke.text, stroke.x, stroke.y);
      } else {
        ctx.beginPath();
        
        switch (stroke.tool) {
          case 'pen':
            // For pen strokes, we'd need to store the full path
            break;
          case 'line':
            ctx.moveTo(stroke.startX, stroke.startY);
            ctx.lineTo(stroke.endX, stroke.endY);
            break;
          case 'rectangle':
            ctx.rect(stroke.startX, stroke.startY, stroke.endX - stroke.startX, stroke.endY - stroke.startY);
            break;
          case 'circle':
            const radius = Math.sqrt(Math.pow(stroke.endX - stroke.startX, 2) + Math.pow(stroke.endY - stroke.startY, 2));
            ctx.arc(stroke.startX, stroke.startY, radius, 0, 2 * Math.PI);
            break;
        }
        
        ctx.stroke();
      }
    });
  }, [canvasHistory]);

  return {
    canvasRef,
    isDrawing,
    currentTool,
    currentColor,
    strokeWidth,
    setCurrentTool,
    setCurrentColor,
    setStrokeWidth,
    startDrawing,
    draw,
    stopDrawing,
    drawShape,
    addTextToCanvas,
    clearCanvas: clearCanvasLocal,
    setCanvasHistory
  };
};
