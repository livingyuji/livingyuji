'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rectangle' | 'ellipse' | 'fill';

const PALETTE = [
  '#000000', '#7F7F7F', '#880015', '#ED1C24', '#FF7F27', '#FFF200', '#22B14C', '#00A2E8', '#3F48CC', '#A349A4',
  '#FFFFFF', '#C3C3C3', '#B97A57', '#FFAEC9', '#FFC90E', '#EFE4B0', '#B5E61D', '#99D9EA', '#7092BE', '#C8BFE7',
];

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill white canvas background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryIdx(0);
  }, []);

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), data]);
    setHistoryIdx((prev) => prev + 1);
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history[historyIdx - 1], 0, 0);
      setHistoryIdx(historyIdx - 1);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history[historyIdx + 1], 0, 0);
      setHistoryIdx(historyIdx + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `LivingYuji_Paint_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Canvas drawing mouse events
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
      ctx.lineWidth = currentTool === 'pencil' ? 1 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (currentTool === 'fill') {
      // Simple fill
      ctx.fillStyle = currentColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistoryState();
    }
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(e);

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (['line', 'rectangle', 'ellipse'].includes(currentTool)) {
      // Restore before preview
      if (history[historyIdx]) {
        ctx.putImageData(history[historyIdx], 0, 0);
      }
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();

      if (currentTool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
      } else if (currentTool === 'rectangle') {
        ctx.rect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
      } else if (currentTool === 'ellipse') {
        const radiusX = Math.abs((coords.x - startPos.x) / 2);
        const radiusY = Math.abs((coords.y - startPos.y) / 2);
        const centerX = Math.min(startPos.x, coords.x) + radiusX;
        const centerY = Math.min(startPos.y, coords.y) + radiusY;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    saveHistoryState();
  };

  return (
    <div className="h-full flex flex-col bg-[#1E2330] text-slate-200 select-none text-xs">
      {/* Windows Paint Ribbon / Toolbar */}
      <div className="px-3 py-2 bg-[#252C3D] border-b border-white/10 flex items-center justify-between gap-4 shrink-0 overflow-x-auto window-scroll">
        {/* Actions (New, Undo, Redo, Save) */}
        <div className="flex items-center gap-1">
          <button onClick={clearCanvas} className="p-1.5 rounded hover:bg-white/10" title="New / Clear">📄 New</button>
          <button onClick={undo} disabled={historyIdx <= 0} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-40" title="Undo">↩️</button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-40" title="Redo">↪️</button>
          <button onClick={exportPNG} className="px-2.5 py-1.5 bg-[#0078D4] hover:bg-[#0086F0] text-white rounded font-medium flex items-center gap-1 shadow-sm">
            💾 Save PNG
          </button>
        </div>

        <div className="w-[1px] h-7 bg-white/10" />

        {/* Tools Palette */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentTool('brush')}
            className={`p-1.5 rounded-lg border transition-all ${
              currentTool === 'brush' ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white' : 'border-transparent hover:bg-white/10'
            }`}
            title="Brush"
          >
            🖌️ Brush
          </button>
          <button
            onClick={() => setCurrentTool('pencil')}
            className={`p-1.5 rounded-lg border transition-all ${
              currentTool === 'pencil' ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white' : 'border-transparent hover:bg-white/10'
            }`}
            title="Pencil"
          >
            ✏️ Pencil
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-1.5 rounded-lg border transition-all ${
              currentTool === 'eraser' ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white' : 'border-transparent hover:bg-white/10'
            }`}
            title="Eraser"
          >
            🧹 Eraser
          </button>
          <button
            onClick={() => setCurrentTool('fill')}
            className={`p-1.5 rounded-lg border transition-all ${
              currentTool === 'fill' ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white' : 'border-transparent hover:bg-white/10'
            }`}
            title="Fill Bucket"
          >
            🪣 Fill
          </button>
        </div>

        <div className="w-[1px] h-7 bg-white/10" />

        {/* Shapes */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentTool('line')}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              currentTool === 'line' ? 'bg-[#38BDF8]/20 border-[#38BDF8]' : 'border-transparent hover:bg-white/10'
            }`}
            title="Line"
          >
            📏 Line
          </button>
          <button
            onClick={() => setCurrentTool('rectangle')}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              currentTool === 'rectangle' ? 'bg-[#38BDF8]/20 border-[#38BDF8]' : 'border-transparent hover:bg-white/10'
            }`}
            title="Rectangle"
          >
            ▭ Box
          </button>
          <button
            onClick={() => setCurrentTool('ellipse')}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              currentTool === 'ellipse' ? 'bg-[#38BDF8]/20 border-[#38BDF8]' : 'border-transparent hover:bg-white/10'
            }`}
            title="Circle / Ellipse"
          >
            ⭕ Circle
          </button>
        </div>

        <div className="w-[1px] h-7 bg-white/10" />

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Size:</span>
          <input
            type="range"
            min="1"
            max="32"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-16 accent-[#38BDF8]"
          />
          <span className="w-4 tabular-nums text-slate-300">{brushSize}</span>
        </div>

        <div className="w-[1px] h-7 bg-white/10" />

        {/* Current Color & Palette */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: currentColor }}
            title="Current Color"
          />
          <div className="grid grid-cols-10 gap-1">
            {PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className="w-4 h-4 rounded-sm border border-black/40 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="flex-1 bg-[#151922] p-4 flex items-center justify-center overflow-auto window-scroll">
        <canvas
          ref={canvasRef}
          width={840}
          height={540}
          onMouseDown={startDraw}
          onMouseMove={drawMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          className="bg-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-sm cursor-crosshair border border-slate-700"
        />
      </div>

      {/* Footer Status */}
      <div className="h-6 px-3 bg-[#1B202D] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>840 × 540 px</span>
        <span>Tool: {currentTool.toUpperCase()}</span>
      </div>
    </div>
  );
}
