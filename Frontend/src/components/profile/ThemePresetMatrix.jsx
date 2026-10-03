import React from "react";
import { Palette, Check, Sparkles } from "lucide-react";
import { DECKLE_THEMES, applyTheme } from "../../utils/themeConfig";

export default function ThemePresetMatrix({
  activeTheme = "parchment",
  onThemeSelect = () => {},
  fontFamily = "serif",
  fontSize = 18,
  lineHeight = 1.8,
  indentEnabled = true,
}) {
  const currentPreset = DECKLE_THEMES.find((t) => t.id === activeTheme) || DECKLE_THEMES[0];

  const handleSelect = (id) => {
    applyTheme(id);
    onThemeSelect(id);
  };

  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-text-main">
            Ambient Reading Canvas
          </h2>
        </div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Active: {currentPreset.name}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-text-muted">
        Calibrate the optical density and paper reproduction of your continuous reader viewport.
      </p>

      {/* 5 Theme Swatches */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {DECKLE_THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`group relative flex flex-col items-center p-3 rounded-xl cursor-pointer border transition-all ${
                isActive
                  ? "ring-2 ring-accent border-accent shadow-xs scale-102"
                  : "border-border-subtle/50 hover:border-accent/60"
              }`}
              style={{ backgroundColor: theme.color }}
            >
              <div
                className="w-8 h-8 rounded-full mb-2 flex items-center justify-center shadow-xs border"
                style={{ backgroundColor: theme.color, borderColor: theme.border }}
              >
                {isActive && <Check className="w-4 h-4 text-accent" />}
              </div>

              <span
                className="text-xs font-semibold"
                style={{ color: theme.textColor }}
              >
                {theme.name}
              </span>

              <span
                className="text-[10px] opacity-75"
                style={{ color: theme.textColor }}
              >
                {theme.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Reading Preview Callout with Dynamic Typography Sync */}
      <div className="p-4 sm:p-5 rounded-xl bg-tag/60 border border-border-subtle/40 transition-all flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Live Viewport Preview — Chapter 142</span>
          </div>
          <span className="text-[11px] font-mono">
            {fontFamily === "sans" ? "Plus Jakarta" : fontFamily === "source-han" ? "Source Han" : "Newsreader"} • {fontSize}px • {lineHeight}×
          </span>
        </div>

        <div className="p-3 bg-card/60 rounded-lg border border-border-subtle/30 overflow-hidden">
          <p
            className={`text-text-main italic transition-all ${
              fontFamily === "sans"
                ? "font-sans"
                : fontFamily === "source-han"
                ? "font-serif tracking-wide"
                : "font-serif"
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              textIndent: indentEnabled ? "2em" : "0",
            }}
          >
            “The ink in the celestial codex did not dry with age; instead, it drifted like pulverized starlight across the deckled vellum, whispering forgotten dao mantras into the quiet chamber.”
          </p>
        </div>
      </div>
    </section>
  );
}
