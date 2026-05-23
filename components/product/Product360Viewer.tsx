"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  images: string[];
  alt: string;
}

export default function Product360Viewer({ images, alt }: Props) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = images.length;

  const goToFrame = useCallback((idx: number) => {
    setFrameIndex(((idx % total) + total) % total);
  }, [total]);

  // Auto-rotate
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        setFrameIndex((i) => (i + 1) % total);
      }, 80);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [autoPlay, total]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    lastFrameRef.current = frameIndex;
    setAutoPlay(false);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    const sensitivity = Math.max(1, Math.floor((containerRef.current?.offsetWidth ?? 300) / total));
    const frameDelta = Math.floor(delta / sensitivity);
    goToFrame(lastFrameRef.current + frameDelta);
  }, [isDragging, goToFrame, total]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartX.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    lastFrameRef.current = frameIndex;
    setAutoPlay(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.touches[0].clientX - dragStartX.current;
    const sensitivity = Math.max(1, Math.floor((containerRef.current?.offsetWidth ?? 300) / total));
    const frameDelta = Math.floor(delta / sensitivity);
    goToFrame(lastFrameRef.current + frameDelta);
  };

  const onTouchEnd = () => { dragStartX.current = null; };

  // Fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") goToFrame(frameIndex + 1);
      if (e.key === "ArrowLeft") goToFrame(frameIndex - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [frameIndex, goToFrame]);

  const wrapperCls = fullscreen
    ? "fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    : "relative w-full";

  return (
    <div className={wrapperCls}>
      {/* Main viewer */}
      <div
        ref={containerRef}
        className={`relative select-none overflow-hidden bg-muted rounded-2xl ${fullscreen ? "w-full max-w-2xl" : "aspect-square"}`}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Current frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[frameIndex]}
          alt={`${alt} - angle ${frameIndex + 1}`}
          className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
        />

        {/* 360 badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
          <span className="text-[10px] tracking-widest">360°</span>
        </div>

        {/* Frame counter */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2 py-1 rounded-full backdrop-blur-sm">
          {frameIndex + 1} / {total}
        </div>

        {/* Drag hint — fades after first drag */}
        {!isDragging && frameIndex === 0 && !autoPlay && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none animate-pulse">
            <span>← Drag to rotate →</span>
          </div>
        )}

        {/* Rotation progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-full mx-4 mb-3">
          <div
            className="h-full bg-brand rounded-full transition-all duration-75"
            style={{ width: `${((frameIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => goToFrame(frameIndex - 1)}
          title="Previous frame"
        >
          ◀
        </Button>

        <Button
          variant={autoPlay ? "brand" : "outline"}
          size="sm" className="h-8 gap-1.5 px-3"
          onClick={() => setAutoPlay((v) => !v)}
        >
          {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {autoPlay ? "Pause" : "Auto Rotate"}
        </Button>

        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => goToFrame(frameIndex + 1)}
          title="Next frame"
        >
          ▶
        </Button>

        <div className="h-6 border-l mx-1" />

        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
          disabled={zoom <= 1}
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
          disabled={zoom >= 3}
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => { setZoom(1); setFrameIndex(0); setAutoPlay(false); }}
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline" size="icon" className="h-8 w-8"
          onClick={() => setFullscreen((v) => !v)}
          title="Fullscreen"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Fullscreen close */}
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full h-9 w-9 flex items-center justify-center text-lg transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
