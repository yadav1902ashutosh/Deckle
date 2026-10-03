import React from "react";
import { CloudCheck, Keyboard, MousePointerClick, Maximize } from "lucide-react";

export default function ReadingErgonomics({
  autoSave = true,
  onAutoSaveToggle = () => {},
  hardwareKeys = true,
  onHardwareKeysToggle = () => {},
  tapCenterToggle = true,
  onTapCenterToggle = () => {},
  immersiveFullscreen = false,
  onFullscreenToggle = () => {},
}) {
  const toggles = [
    {
      id: "autosave",
      title: "Auto-save reading progress to cloud",
      desc: "Instant sub-second cloud bookmark synchronization across devices",
      icon: CloudCheck,
      value: autoSave,
      onChange: onAutoSaveToggle,
    },
    {
      id: "hardware",
      title: "Volume & Hardware Arrow Page Turning",
      desc: "Turn chapters and scrolls via mobile volume keys or keyboard arrows (←/→)",
      icon: Keyboard,
      value: hardwareKeys,
      onChange: onHardwareKeysToggle,
    },
    {
      id: "tapCenter",
      title: "Tap Screen Center to Toggle Chrome",
      desc: "Reveals header, chapter scrubber, and font sliders seamlessly",
      icon: MousePointerClick,
      value: tapCenterToggle,
      onChange: onTapCenterToggle,
    },
    {
      id: "fullscreen",
      title: "Immersive Full-Screen on Chapter Entry",
      desc: "Conceals browser navigation chrome for unadulterated focus",
      icon: Maximize,
      value: immersiveFullscreen,
      onChange: onFullscreenToggle,
    },
  ];

  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 transition-colors">
      <div className="flex items-center gap-2">
        <MousePointerClick className="w-5 h-5 text-accent" />
        <h2 className="font-serif text-lg font-semibold text-text-main">
          Reading Ergonomics &amp; Gestures
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {toggles.map((t) => {
          const IconComponent = t.icon;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 hover:bg-tag/50 rounded-xl transition-colors border border-transparent hover:border-border-subtle/30"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-9 h-9 rounded-lg bg-tag flex items-center justify-center text-accent shrink-0">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium text-text-main">{t.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{t.desc}</div>
                </div>
              </div>

              {/* iOS style toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={t.value}
                  onChange={(e) => t.onChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-border-subtle/70 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}
