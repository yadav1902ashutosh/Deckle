import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  List,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Palette,
} from "lucide-react";
import { DECKLE_THEMES } from "../../utils/themeConfig";

export default function ReaderHeader({
  visible = true,
  bookSlug = "battle-through-the-heavens",
  bookTitle = "Battle Through the Heavens",
  chapterNum = 1663,
  chapterVolume = "Final Volume",
  progressText = "100% Series Climax",
  estReadingTime = "~18 min",
  activeTheme = "parchment",
  onSelectTheme,
  onToggleTOC,
  onToggleSettings,
  isBookmarked = false,
  onToggleBookmark,
}) {
  const [mobileThemeOpen, setMobileThemeOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  // Close mobile theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(e.target)
      ) {
        setMobileThemeOpen(false);
      }
    };
    if (mobileThemeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileThemeOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between border-b border-border-subtle/40 transition-all duration-300 shadow-xs ${
        visible
          ? "transform translate-y-0 opacity-100"
          : "transform -translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Left: Return to Novel & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/book/${bookSlug}`}
          className="flex items-center gap-1.5 text-text-main hover:text-accent transition-colors text-sm font-semibold truncate group"
          title="Return to Novel Overview"
        >
          <ArrowLeft className="w-4 h-4 text-accent group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span className="truncate">{bookTitle}</span>
        </Link>
        <span className="text-border-subtle text-xs hidden sm:inline">•</span>
        <span className="text-xs text-text-muted hidden sm:inline truncate">
          Ch. {chapterNum} ({chapterVolume})
        </span>
      </div>

      {/* Right: Progress, Theme Dots & Utility Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Subtle reading progress badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-tag text-xs text-text-muted border border-border-subtle/50">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>{progressText}</span>
          <span className="text-border-subtle">|</span>
          <span>{estReadingTime}</span>
        </div>

        {/* Mobile Theme Toggle Button */}
        <div className="relative sm:hidden" ref={themeDropdownRef}>
          <button
            type="button"
            onClick={() => setMobileThemeOpen(!mobileThemeOpen)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors relative flex items-center justify-center cursor-pointer"
            aria-label="Change reading theme"
            title="Switch theme"
          >
            <Palette className="w-4 h-4" />
            <span
              className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-card"
              style={{
                backgroundColor: DECKLE_THEMES.find((t) => t.id === activeTheme)?.color || "#fdf9f0",
              }}
            />
          </button>

          {/* Mobile Theme Popover */}
          {mobileThemeOpen && (
            <div className="absolute right-0 top-11 z-50 bg-card rounded-xl border border-border-subtle p-2 shadow-xl w-44 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Reading Themes
              </div>
              {DECKLE_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme && onSelectTheme(t.id);
                    setMobileThemeOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    activeTheme === t.id
                      ? "bg-tag text-text-main font-semibold ring-1 ring-accent"
                      : "text-text-muted hover:text-text-main hover:bg-page"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border shrink-0"
                    style={{ backgroundColor: t.color, borderColor: t.border }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Palette Theme Dots (Tablet & Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border-subtle">
          {DECKLE_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme && onSelectTheme(t.id)}
              title={`${t.name} (${t.desc})`}
              className={`w-4 h-4 rounded-full border cursor-pointer transition-all ${
                activeTheme === t.id
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: t.color, borderColor: t.border }}
            />
          ))}
        </div>

        {/* Sleek Utility Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTOC}
            className="p-2 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Chapter Directory (Catalog)"
            aria-label="Table of Contents"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleSettings}
            className="p-2 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Reading Display Settings"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg hover:bg-tag transition-colors cursor-pointer ${
              isBookmarked ? "text-accent" : "text-text-muted hover:text-accent"
            }`}
            title={isBookmarked ? "In Bookshelf" : "Save to Bookshelf"}
            aria-label="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
