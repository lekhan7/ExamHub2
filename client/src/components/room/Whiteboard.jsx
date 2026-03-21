import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Palette,
  Minus,
  Circle,
  Square
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../../context/SocketContext';

const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#d946ef', '#f43f5e'
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];

function Whiteboard({ roomId, currentMember, canvasHistory }) {
  const { t } = useTranslation();
  const { socket } = useSocket();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [tool, setTool] = useState('pen'); // 'pen', 'eraser'
  const [context, setContext] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setContext(ctx);

    // Set canvas size
    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Fill with dark background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw history
      redrawCanvas(ctx, canvasHistory);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw when history changes
  useEffect(() => {
    if (context && canvasRef.current) {
      redrawCanvas(context, canvasHistory);
    }
  }, [canvasHistory, context]);

  const redrawCanvas = (ctx, strokes) => {
    const canvas = canvasRef.current;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke, false);
    });
  };

  const drawStroke = (ctx, stroke, emit = true) => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    
    if (stroke.points.length > 0) {
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((point, index) => {
        if (index > 0) ctx.lineTo(point.x, point.y);
      });
    }
    
    ctx.stroke();

    if (emit && socket) {
      socket.emit('canvas:draw', {
        roomId,
        strokeData: {
          ...stroke,
          displayName: currentMember?.displayName
        }
      });
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
    context.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !context) return;
    setIsDrawing(false);
    context.closePath();
    
    // Save stroke to history
    // Note: Full implementation would track all points and emit
  };

  const handleClear = () => {
    if (!context || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    context.fillStyle = '#1a1a2e';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    socket?.emit('canvas:clear', {
      roomId,
      clearedBy: currentMember?.displayName
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-card border-b border-custom">
        <div className="flex items-center gap-4">
          {/* Tools */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'pen' ? 'bg-violet-500 text-white' : 'hover:bg-hover text-secondary'
              }`}
              title={t('room.scribble.pen')}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-colors ${
                tool === 'eraser' ? 'bg-violet-500 text-white' : 'hover:bg-hover text-secondary'
              }`}
              title={t('room.scribble.eraser')}
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  strokeWidth === width ? 'bg-violet-500/20' : 'hover:bg-secondary'
                }`}
              >
                <div
                  className={`rounded-full ${
                    strokeWidth === width ? 'bg-violet-400' : 'bg-secondary'
                  }`}
                  style={{ width: width, height: width }}
                />
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color === c && tool === 'pen' ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('room.scribble.clear')}
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative bg-secondary/30 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 cursor-crosshair touch-none"
        />
      </div>

      {/* Hint */}
      <div className="p-2 bg-card border-t border-custom text-center">
        <p className="text-xs text-secondary">
          Draw together in real-time • All members can see your strokes
        </p>
      </div>
    </div>
  );
}

export default Whiteboard;
