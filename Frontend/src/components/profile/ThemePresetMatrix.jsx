import React from "react";
import { Palette, Check } from "lucide-react";
import { DECKLE_THEMES, applyTheme } from "../../utils/themeConfig";

export default function ThemePresetMatrix({
  activeTheme = "parchment",
  onThemeSelect = () => {},
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

      {/* Live Reading Preview Callout */}
      <div className="p-4 rounded-xl bg-tag/60 border border-border-subtle/40 transition-all flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Viewport Preview — Chapter 142</span>
          <span>Optimal 65 Chars/Line</span>
        </div>

        <p className="font-serif text-sm sm:text-base text-text-main italic leading-relaxed">
          “The ink in the celestial codex did not dry with age; instead, it drifted like pulverized starlight across the deckled vellum, whispering forgotten dao mantras into the quiet chamber.”
        </p>
      </div>
    </section>
  );
}
