import React from "react";
import { X, Check } from "lucide-react";
import { DECKLE_THEMES } from "../../utils/themeConfig";

export default function ReaderSettingsModal({
  isOpen = false,
  onClose,
  activeTheme = "parchment",
  onSelectTheme,
  fontFamily = "serif",
  onSelectFont,
  fontSize = 19,
  onSetFontSize,
  isLiteraryIndent = true,
  onToggleIndent,
  textAlign = "justify",
  onToggleAlign,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border-subtle space-y-5 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <span className="font-serif text-base font-bold text-text-main">
            Reading Preferences
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-tag transition-colors cursor-pointer"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Background Color Themes */}
        <div>
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Reading Background
          </label>
          <div className="grid grid-cols-5 gap-2">
            {DECKLE_THEMES.map((t) => {
              const isSelected = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTheme && onSelectTheme(t.id)}
                  title={`${t.name} (${t.desc})`}
                  className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border-2 ${
                    isSelected
                      ? "border-accent ring-1 ring-accent shadow-xs"
                      : "border-border-subtle hover:border-accent/40"
                  }`}
                  style={{ backgroundColor: t.color }}
                >
                  <span
                    className="w-4 h-4 rounded-full border shadow-2xs"
                    style={{ backgroundColor: t.color, borderColor: t.border }}
                  />
                  <span
                    className="text-[10px] font-semibold truncate max-w-full"
                    style={{ color: t.textColor }}
                  >
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Typeface Selector */}
        <div>
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Typeface
          </label>
          <div className="grid grid-cols-2 gap-2 bg-page p-1 rounded-xl text-center text-xs font-medium border border-border-subtle">
            <button
              type="button"
              onClick={() => onSelectFont && onSelectFont("serif")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                fontFamily === "serif"
                  ? "bg-card text-accent font-semibold shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Newsreader (Serif)
            </button>
            <button
              type="button"
              onClick={() => onSelectFont && onSelectFont("sans")}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                fontFamily === "sans"
                  ? "bg-card text-accent font-semibold shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Sans-Serif (Clean)
            </button>
          </div>
        </div>

        {/* 3. Font Size Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-text-muted">Font Sizing</span>
            <span className="text-accent font-bold">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSetFontSize && onSetFontSize(Math.max(14, fontSize - 1))}
              disabled={fontSize <= 14}
              className="w-9 h-9 rounded-xl bg-page text-text-main font-bold hover:bg-tag transition-colors border border-border-subtle disabled:opacity-40 flex items-center justify-center cursor-pointer"
            >
              A-
            </button>
            <input
              type="range"
              min="14"
              max="28"
              value={fontSize}
              onChange={(e) => onSetFontSize && onSetFontSize(Number(e.target.value))}
              className="flex-1 accent-accent cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onSetFontSize && onSetFontSize(Math.min(28, fontSize + 1))}
              disabled={fontSize >= 28}
              className="w-9 h-9 rounded-xl bg-page text-text-main font-bold hover:bg-tag transition-colors border border-border-subtle disabled:opacity-40 flex items-center justify-center cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        {/* 4. Formatting Toggles (Indent & Alignment) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleIndent}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors cursor-pointer ${
              isLiteraryIndent
                ? "bg-tag border-accent text-accent"
                : "bg-page border-border-subtle text-text-muted hover:text-text-main"
            }`}
          >
            <span>Paragraph Indent (2em)</span>
            {isLiteraryIndent && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onToggleAlign}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors cursor-pointer ${
              textAlign === "justify"
                ? "bg-tag border-accent text-accent"
                : "bg-page border-border-subtle text-text-muted hover:text-text-main"
            }`}
          >
            <span>Justified Align</span>
            {textAlign === "justify" && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Apply CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-accent text-accent-text font-semibold rounded-xl text-xs hover:bg-accent-hover transition-colors cursor-pointer shadow-sm"
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
}
