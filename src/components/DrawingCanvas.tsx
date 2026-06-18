import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface DrawingCanvasHandle {
  /** The underlying canvas element, used for reading pixels. */
  getCanvas: () => HTMLCanvasElement | null;
  /** Clears the drawing surface. */
  clear: () => void;
  /** True when the visitor has drawn at least one stroke. */
  isDirty: () => boolean;
}

interface DrawingCanvasProps {
  /** Logical pixel size of the square canvas. */
  size?: number;
  /** Called whenever a stroke ends, so parents can refresh live state. */
  onStrokeEnd?: () => void;
  /** Called when the first stroke begins (e.g. to hide a hint). */
  onDrawStart?: () => void;
  disabled?: boolean;
}

/**
 * A simple, touch-friendly drawing surface. Strokes are bright on a dark
 * background so that brightness maps cleanly to "ink" during feature
 * extraction. Supports mouse, touch, and pen via Pointer Events.
 */
const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas(
  { size = 320, onStrokeEnd, onDrawStart, disabled = false },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Use the device pixel ratio for crisp lines on high-DPI screens.
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const prepareContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#FFE7C2';
    ctx.shadowColor = 'rgba(255,150,60,0.9)';
    ctx.shadowBlur = 6;
    return ctx;
  };

  const paintBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0A0E14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintBackground();
    dirty.current = false;
    setIsEmpty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, dpr]);

  const clear = () => {
    paintBackground();
    dirty.current = false;
    setIsEmpty(true);
  };

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    clear,
    isDirty: () => dirty.current,
  }));

  const getPoint = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * size,
      y: ((e.clientY - rect.top) / rect.height) * size,
    };
  };

  const start = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    if (!dirty.current && onDrawStart) onDrawStart();
    const p = getPoint(e);
    last.current = p;
    // Draw a dot so a single tap registers as ink.
    const ctx = prepareContext();
    if (ctx) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE7C2';
      ctx.fill();
    }
    dirty.current = true;
    setIsEmpty(false);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || disabled) return;
    e.preventDefault();
    const ctx = prepareContext();
    if (!ctx || !last.current) return;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    drawing.current = false;
    last.current = null;
    if (onStrokeEnd) onStrokeEnd();
  };

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Drawing area. Use your finger, pen, or mouse to draw."
        className={`touch-none rounded-2xl border-2 transition ${
          disabled
            ? 'border-amd-line opacity-60'
            : 'border-amd-orange/50 shadow-glow-orange'
        }`}
        style={{ width: size, height: size, cursor: disabled ? 'not-allowed' : 'crosshair' }}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      />
      {isEmpty && !disabled && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center text-slate-500">
            <div className="mb-1 text-4xl">✏️</div>
            <div className="text-sm font-medium">Draw here</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;
