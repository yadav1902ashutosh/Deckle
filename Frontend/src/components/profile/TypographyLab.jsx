import React, { useState } from "react";
import { Type, AlignJustify, AlignLeft } from "lucide-react";

export default function TypographyLab({
  fontFamily = "serif",
  onFontFamilyChange = () => {},
  fontSize = 18,
  onFontSizeChange = () => {},
  lineHeight = 1.8,
  onLineHeightChange = () => {},
  indentEnabled = true,
  onIndentToggle = () => {},
}) {
  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 transition-colors">
      <div className="flex items-center gap-2">
        <Type className="w-5 h-5 text-accent" />
        <h2 className="font-serif text-lg font-semibold text-text-main">
          Typography Engine
        </h2>
      </div>

      {/* Font Family Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Primary Font Face
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onFontFamilyChange("serif")}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              fontFamily === "serif"
                ? "bg-accent/10 border-accent text-accent"
                : "bg-tag/60 border-border-subtle/40 hover:bg-tag text-text-main"
            }`}
          >
            <div className="font-serif font-semibold text-sm">Newsreader Serif</div>
            <div className="text-[11px] text-text-muted mt-0.5">Classic Publishing Standard</div>
          </button>

          <button
            onClick={() => onFontFamilyChange("source-han")}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              fontFamily === "source-han"
                ? "bg-accent/10 border-accent text-accent"
                : "bg-tag/60 border-border-subtle/40 hover:bg-tag text-text-main"
            }`}
          >
            <div className="font-serif font-semibold text-sm">Source Han Serif</div>
            <div className="text-[11px] text-text-muted mt-0.5">East Asian Orthography</div>
          </button>

          <button
            onClick={() => onFontFamilyChange("sans")}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              fontFamily === "sans"
                ? "bg-accent/10 border-accent text-accent"
                : "bg-tag/60 border-border-subtle/40 hover:bg-tag text-text-main"
            }`}
          >
            <div className="font-sans font-semibold text-sm">Plus Jakarta Sans</div>
            <div className="text-[11px] text-text-muted mt-0.5">High Legibility Modern</div>
          </button>
        </div>
      </div>

      {/* Sliders: Font Size & Line Height */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font Size */}
        <div className="p-3.5 bg-tag/60 border border-border-subtle/40 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-main">Base Font Size</span>
            <span className="font-bold text-accent">{fontSize} px</span>
          </div>
          <input
            type="range"
            min="14"
            max="28"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer h-1.5 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>14px (Dense)</span>
            <span>20px</span>
            <span>28px (Relaxed)</span>
          </div>
        </div>

        {/* Line Spacing */}
        <div className="p-3.5 bg-tag/60 border border-border-subtle/40 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-main">Line Spacing (Leading)</span>
            <span className="font-bold text-accent">{lineHeight} ×</span>
          </div>
          <input
            type="range"
            min="1.4"
            max="2.4"
            step="0.1"
            value={lineHeight}
            onChange={(e) => onLineHeightChange(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer h-1.5 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>1.4x (Compact)</span>
            <span>1.8x</span>
            <span>2.4x (Airy)</span>
          </div>
        </div>
      </div>

      {/* Paragraph Indentation Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-tag/60 border border-border-subtle/40 rounded-xl gap-3">
        <div>
          <div className="text-xs font-semibold text-text-main">Paragraph Indentation Mode</div>
          <div className="text-[11px] text-text-muted">
            Choose between traditional 2em novel indentation or modern web block spacing
          </div>
        </div>

        <div className="flex bg-card p-1 rounded-xl border border-border-subtle/50 text-xs">
          <button
            onClick={() => onIndentToggle(true)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              indentEnabled
                ? "bg-accent text-white shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Indent 2em
          </button>
          <button
            onClick={() => onIndentToggle(false)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              !indentEnabled
                ? "bg-accent text-white shadow-xs"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Block Spaced
          </button>
        </div>
      </div>
    </section>
  );
}
