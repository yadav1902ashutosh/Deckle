import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Monitor,
  Tv,
  Eye,
  Info,
  Upload,
  BookOpen,
  User,
  Image as ImageIcon,
} from "lucide-react";

/**
 * YouTube-style Image Framing & Multi-Device Preview Modal
 * Supports: 'banner' | 'avatar' | 'cover'
 */
export default function ImageFramingModal({
  isOpen,
  onClose,
  onConfirm,
  imageSrc,
  type = "banner", // 'banner' | 'avatar' | 'cover'
  title = null,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentImage, setCurrentImage] = useState(imageSrc);
  const [devicePreview, setDevicePreview] = useState("all"); // 'all' (mobile safe) | 'desktop' | 'tv' | 'mockup'

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Reset zoom and pan when image or type changes
  useEffect(() => {
    setCurrentImage(imageSrc);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDevicePreview(type === "banner" ? "all" : "default");
  }, [imageSrc, type, isOpen]);

  if (!isOpen || !currentImage) return null;

  // Drag handling
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target.result);
        handleReset();
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop & Confirm: draws the viewable area onto an HTML5 canvas and returns a clean dataURL
  const handleConfirm = () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = imgRef.current;

      if (!img) {
        onConfirm(currentImage);
        onClose();
        return;
      }

      let targetWidth = 1200;
      let targetHeight = 675;

      if (type === "avatar") {
        targetWidth = 400;
        targetHeight = 400;
      } else if (type === "cover") {
        targetWidth = 600;
        targetHeight = 900;
      } else if (type === "banner") {
        targetWidth = 2048;
        targetHeight = 1152;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw background
      ctx.fillStyle = "#1e1a17";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Simple centered draw with zoom & relative pan
      const baseAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = targetWidth / targetHeight;

      let drawW, drawH;
      if (baseAspect > targetAspect) {
        drawH = targetHeight * zoom;
        drawW = drawH * baseAspect;
      } else {
        drawW = targetWidth * zoom;
        drawH = drawW / baseAspect;
      }

      const drawX = (targetWidth - drawW) / 2 + (pan.x / 100) * targetWidth;
      const drawY = (targetHeight - drawH) / 2 + (pan.y / 100) * targetHeight;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const croppedUrl = canvas.toDataURL("image/jpeg", 0.92);
      onConfirm(croppedUrl);
      onClose();
    } catch (err) {
      console.warn("Canvas export fallback:", err);
      onConfirm(currentImage);
      onClose();
    }
  };

  const modalTitle =
    title ||
    (type === "banner"
      ? "Customize Banner Image"
      : type === "avatar"
      ? "Customize Profile Picture"
      : "Frame Novel Cover");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-card border border-border-subtle rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle/50 bg-tag/40">
          <div>
            <h2 className="font-serif text-lg font-bold text-text-main">
              {modalTitle}
            </h2>
            <p className="text-xs text-text-muted">
              {type === "banner" &&
                "Your banner will display differently across mobile, desktop, and large screens."}
              {type === "avatar" &&
                "Your avatar will be cropped as a circle across reader channels and comment cards."}
              {type === "cover" &&
                "Verify your title and artwork fit comfortably across catalog cards and spotlight heroes."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= INTERACTIVE WORKSPACE CANVAS ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#12100e]">
          {/* 1. Main Viewport Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* The Raw Uploaded Image with Pan & Zoom */}
            <img
              ref={imgRef}
              src={currentImage}
              alt="Framing preview"
              className="max-w-none transition-transform duration-75 pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />

            {/* ================= A. BANNER FRAMING GUIDES (YOUTUBE MULTI-DEVICE VIEWABILITY) ================= */}
            {type === "banner" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 16:9 Full TV bounds box */}
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Top & Bottom Shaded Slices (Outside Desktop strip) */}
                  <div className="absolute top-0 inset-x-0 h-[28%] bg-black/60 backdrop-blur-[1px] border-b border-dashed border-white/20 flex items-start justify-center pt-2">
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                      <Tv className="w-3 h-3 text-accent" />
                      Viewable on TV / Wide Screens (2560 × 1440)
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 h-[28%] bg-black/60 backdrop-blur-[1px] border-t border-dashed border-white/20 flex items-end justify-center pb-2">
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 bg-black/70 px-2 py-0.5 rounded">
                      TV Bleed Zone
                    </span>
                  </div>

                  {/* Desktop Middle Strip (Full width, ~44% height) */}
                  <div className="absolute inset-x-0 h-[44%] border-y-2 border-white/30 flex items-center justify-between px-3">
                    {/* Left & Right Shaded Areas (Outside Mobile Safe Area) */}
                    <div className="absolute left-0 inset-y-0 w-[22%] bg-black/45 border-r border-dashed border-amber-400/50 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-zinc-300 -rotate-90 hidden sm:inline">
                        Desktop only
                      </span>
                    </div>

                    <div className="absolute right-0 inset-y-0 w-[22%] bg-black/45 border-l border-dashed border-amber-400/50 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-zinc-300 rotate-90 hidden sm:inline">
                        Desktop only
                      </span>
                    </div>

                    {/* Central Mobile & All-Devices Safe Zone Box */}
                    <div className="relative mx-auto w-[56%] h-full border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-semibold text-amber-300 bg-black/80 px-2.5 py-1 rounded shadow-md border border-amber-400/40 flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        <span>All Devices &amp; Mobile Safe Area</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= B. AVATAR CIRCULAR FRAMING OVERLAY ================= */}
            {type === "avatar" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Dark circular vignette mask */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] relative flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-dashed border-white/40" />
                  <span className="absolute -bottom-8 text-xs font-mono text-accent bg-black/80 px-3 py-1 rounded-full border border-accent/40">
                    Circular Crop Area (400 × 400)
                  </span>
                </div>
              </div>
            )}

            {/* ================= C. BOOK COVER PORTRAIT FRAMING ================= */}
            {type === "cover" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 2:3 vertical portrait mask */}
                <div className="w-48 h-72 sm:w-56 sm:h-84 border-4 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-lg relative flex items-center justify-center">
                  {/* Safe margin zone (10% padding for title & typography) */}
                  <div className="w-[85%] h-[85%] border border-dashed border-amber-400/60 rounded flex flex-col justify-between p-2">
                    <span className="text-[9px] font-mono text-amber-300 bg-black/70 px-1 rounded self-start">
                      Safe Title Zone
                    </span>
                    <span className="text-[9px] font-mono text-amber-300 bg-black/70 px-1 rounded self-end">
                      Author Byline Zone
                    </span>
                  </div>
                  <span className="absolute -bottom-8 text-xs font-mono text-accent bg-black/80 px-3 py-1 rounded-full border border-accent/40">
                    2:3 Standard Book Ratio
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Device Viewability Badges & Instructions */}
          {type === "banner" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-card border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-text-main">
                    Viewable on all devices
                  </span>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Keep your channel name, author logo, and focal artwork in the central safe box.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border-subtle rounded-xl p-3 flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-text-main">
                    Viewable on desktop
                  </span>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Extended horizontal slice will be revealed across desktop monitors.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border-subtle rounded-xl p-3 flex items-start gap-2.5">
                <Tv className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-text-main">
                    Viewable on TV
                  </span>
                  <p className="text-[11px] text-text-muted leading-tight">
                    Full 16:9 canvas displayed on smart TV devices and extra-wide setups.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Live Device Mockup Simulator (YouTube style preview) */}
          <div className="bg-card border border-border-subtle rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-accent" />
                <span>Live Rendering Simulation</span>
              </span>
              <span className="text-[11px] text-text-muted">
                Drag on canvas above to align
              </span>
            </div>

            {type === "banner" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Channel Banner Mockup */}
                <div className="border border-border-subtle/60 rounded-xl overflow-hidden bg-page">
                  <div className="px-3 py-1.5 bg-tag border-b border-border-subtle/40 flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                    <Monitor className="w-3 h-3 text-accent" />
                    <span>Desktop Channel Viewport</span>
                  </div>
                  <div className="h-20 w-full overflow-hidden relative">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${zoom}) translate(${pan.x * 0.2}px, ${pan.y * 0.2}px)`,
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Channel Banner Mockup */}
                <div className="border border-border-subtle/60 rounded-xl overflow-hidden bg-page max-w-xs mx-auto md:max-w-none w-full">
                  <div className="px-3 py-1.5 bg-tag border-b border-border-subtle/40 flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                    <Smartphone className="w-3 h-3 text-amber-400" />
                    <span>Mobile Screen Viewport</span>
                  </div>
                  <div className="h-16 w-full overflow-hidden relative">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${zoom * 1.2}) translate(${pan.x * 0.25}px, ${pan.y * 0.25}px)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {type === "avatar" && (
              <div className="flex items-center justify-around py-2 gap-4">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-accent mx-auto">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">Channel Header</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-border-subtle mx-auto">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">Comment / Card</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-border-subtle mx-auto">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">Top Nav Bar</span>
                </div>
              </div>
            )}

            {type === "cover" && (
              <div className="flex items-center justify-around py-2 gap-4">
                <div className="text-center space-y-1">
                  <div className="w-20 h-28 rounded-md overflow-hidden shadow-md border border-border-subtle mx-auto">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">Catalog Card</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-28 h-36 rounded-lg overflow-hidden shadow-lg border border-accent/40 mx-auto">
                    <img
                      src={currentImage}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${zoom})` }}
                    />
                  </div>
                  <span className="text-[10px] text-accent font-semibold">Spotlight Hero</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER CONTROLS ================= */}
        <div className="px-6 py-4 border-t border-border-subtle/50 bg-tag/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Zoom Slider & Reset */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-text-muted flex items-center gap-1 shrink-0">
              <ZoomOut className="w-3.5 h-3.5" />
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-32 sm:w-44 accent-accent cursor-pointer"
            />
            <span className="text-xs text-text-muted flex items-center gap-1 shrink-0">
              <ZoomIn className="w-3.5 h-3.5" />
            </span>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:bg-card text-text-muted hover:text-text-main transition-colors text-xs flex items-center gap-1 border border-border-subtle/50 cursor-pointer"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-card hover:bg-tag border border-border-subtle text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span>Change Image</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag transition-colors text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
