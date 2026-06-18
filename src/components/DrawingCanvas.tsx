import { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  onReady: (canvas: HTMLCanvasElement) => void;
  presenterMode: boolean;
}

export function DrawingCanvas({ onReady, presenterMode }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = 320;
    canvas.height = 320;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = presenterMode ? 14 : 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
    onReady(canvas);
  }, [onReady, presenterMode]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const p = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    setDrawing(true);
  };

  const moveDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const p = getPoint(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="aspect-square w-full max-w-80 touch-none rounded-2xl border-2 border-white/20 bg-white shadow-glow"
      onPointerDown={startDraw}
      onPointerMove={moveDraw}
      onPointerUp={endDraw}
      onPointerLeave={endDraw}
      aria-label="Drawing canvas"
    />
  );
}
