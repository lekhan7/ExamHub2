import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Pen, 
  Square, 
  Circle, 
  Minus, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2, 
  Download,
  Palette
} from 'lucide-react';
import { buttonHover } from '../../animations/variants';
import { useCanvas } from '../../hooks/useCanvas';

const ScribbleBoard = ({ roomId, history }) => {
  const {
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
    clearCanvas,
    setCanvasHistory
  } = useCanvas(roomId);

  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');

  const colors = [
    '#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
    '#EF4444', '#EC4899', '#F8FAFC', '#475569', '#000000'
  ];

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ];

  useEffect(() => {
    setCanvasHistory(history || []);
  }, [history, setCanvasHistory]);

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }

    if (['line', 'rectangle', 'circle'].includes(currentTool)) {
      setIsDrawingShape(true);
      setShapeStart({ x, y });
    } else {
      startDrawing(e);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDrawingShape) {
      // Preview shape while drawing
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Clear and redraw everything including preview
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw existing strokes
      history.forEach(stroke => {
        // ... redraw logic
      });

      // Draw preview shape
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();

      switch (currentTool) {
        case 'line':
          ctx.moveTo(shapeStart.x, shapeStart.y);
          ctx.lineTo(x, y);
          break;
        case 'rectangle':
          ctx.rect(shapeStart.x, shapeStart.y, x - shapeStart.x, y - shapeStart.y);
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow(x - shapeStart.x, 2) + Math.pow(y - shapeStart.y, 2));
          ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
          break;
      }
      ctx.stroke();
    } else {
      draw(e);
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (isDrawingShape) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      drawShape(shapeStart.x, shapeStart.y, x, y, currentTool);
      setIsDrawingShape(false);
    } else {
      stopDrawing(e);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      addTextToCanvas(textPosition.x, textPosition.y, textInput);
      setShowTextInput(false);
      setTextInput('');
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1 bg-surface2 rounded-lg p-1">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                {...buttonHover}
                onClick={() => setCurrentTool(tool.id)}
                className={`p-2 rounded transition-colors group ${
                  currentTool === tool.id 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-surface text-text-secondary group-hover:text-text-primary'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Color Picker */}
          <div className="relative">
            <motion.button
              {...buttonHover}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center space-x-2 p-2 bg-surface2 hover:bg-surface rounded-lg transition-colors"
            >
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: currentColor }}
              />
              <Palette className="w-4 h-4 text-text-secondary" />
            </motion.button>

            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-lg p-2 shadow-lg z-10"
              >
                <div className="grid grid-cols-5 gap-1">
                  {colors.map((color) => (
                    <motion.button
                      key={color}
                      {...buttonHover}
                      onClick={() => {
                        setCurrentColor(color);
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 transition-colors"
                      style={{ 
                        backgroundColor: color,
                        borderColor: currentColor === color ? '#6366F1' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-text-primary w-8">{strokeWidth}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            {...buttonHover}
            onClick={() => {
              // Undo logic would go here
            }}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4 text-text-secondary" />
          </motion.button>

          <motion.button
            {...buttonHover}
            onClick={() => {
              // Redo logic would go here
            }}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4 text-text-secondary" />
          </motion.button>

          <motion.button
            {...buttonHover}
            onClick={downloadCanvas}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-text-secondary" />
          </motion.button>

          <div className="h-6 w-px bg-border" />

          <motion.button
            {...buttonHover}
            onClick={clearCanvas}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </motion.button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="w-full h-full bg-white rounded-lg shadow-inner relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className={`w-full h-full cursor-crosshair ${
              currentTool === 'eraser' ? 'cursor-grab' : 'cursor-crosshair'
            }`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />

          {/* Text Input Modal */}
          {showTextInput && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bg-white border border-border rounded-lg shadow-lg p-3"
              style={{ left: textPosition.x, top: textPosition.y }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  } else if (e.key === 'Escape') {
                    setShowTextInput(false);
                    setTextInput('');
                  }
                }}
                placeholder="Enter text..."
                className="px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="flex space-x-1 mt-2">
                <button
                  onClick={handleTextSubmit}
                  className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="px-2 py-1 bg-surface text-text-primary text-xs rounded hover:bg-surface2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScribbleBoard;
