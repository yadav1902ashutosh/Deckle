import React, { useState } from "react";
import { HardDrive, DownloadCloud, Trash2, CheckCircle2, FileText, Image, Type } from "lucide-react";

export default function StorageFootprintWidget({
  onClearCache = () => {},
  onCacheNext = () => {},
}) {
  const [cachedItems, setCachedItems] = useState([
    {
      id: "lotm",
      title: "Lord of the Mysteries (Ch. 1–1300)",
      size: "9.2 MB",
      type: "text",
    },
    {
      id: "mortal",
      title: "A Record of a Mortal's Journey (Ch. 1–600)",
      size: "4.1 MB",
      type: "text",
    },
    {
      id: "fonts",
      title: "Deckle Core Typeface Subsets",
      size: "1.5 MB",
      type: "font",
    },
  ]);

  const [isCaching, setIsCaching] = useState(false);

  const handleClear = () => {
    setCachedItems([]);
    onClearCache();
  };

  const handleCacheNext50 = () => {
    setIsCaching(true);
    setTimeout(() => {
      setIsCaching(false);
      setCachedItems((prev) => [
        ...prev,
        {
          id: "btth_cached",
          title: "Battle Through the Heavens (Ch. 46–95)",
          size: "1.8 MB",
          type: "text",
        },
      ]);
      onCacheNext();
    }, 1200);
  };

  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-base sm:text-lg font-semibold text-text-main">
            Storage &amp; Offline Cache
          </h2>
        </div>
        <span className="bg-tag border border-border-subtle/40 text-accent font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-accent" /> PWA Synchronized
        </span>
      </div>

      {/* Storage Bar Visualization */}
      <div className="p-3.5 bg-tag/60 border border-border-subtle/40 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-main font-semibold">14.8 MB Utilized</span>
          <span className="text-text-muted">500 MB Allocated Quota</span>
        </div>

        {/* Custom multi-segment bar */}
        <div className="w-full bg-border-subtle/50 h-2.5 rounded-full overflow-hidden flex gap-0.5">
          <div
            className="bg-accent h-full rounded-l-full transition-all duration-300"
            style={{ width: "18%" }}
            title="Manuscript Text Cache (18%)"
          />
          <div
            className="bg-accent/60 h-full transition-all duration-300"
            style={{ width: "8%" }}
            title="Cover Thumbnails (8%)"
          />
          <div
            className="bg-text-muted/40 h-full rounded-r-full transition-all duration-300"
            style={{ width: "4%" }}
            title="Reader Typography Fonts (4%)"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-1 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Manuscript Text ({cachedItems.length} items)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent/60" />
            <span>Covers &amp; Assets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-text-muted/40" />
            <span>Fonts</span>
          </div>
        </div>
      </div>

      {/* Cached Novels Mini-list */}
      <div className="space-y-2 text-xs">
        {cachedItems.length === 0 ? (
          <div className="p-3 rounded-xl bg-tag/40 text-center text-text-muted text-xs">
            Offline cache cleared. Download chapters to read offline.
          </div>
        ) : (
          cachedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-tag/50 border border-border-subtle/30 text-text-main hover:bg-tag transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {item.type === "font" ? (
                  <Type className="w-3.5 h-3.5 text-accent shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                )}
                <span className="truncate text-xs font-medium">{item.title}</span>
              </div>
              <span className="font-mono text-[11px] text-text-muted shrink-0 font-semibold">
                {item.size}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Cache Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleClear}
          disabled={cachedItems.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 disabled:opacity-40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cache</span>
        </button>

        <button
          onClick={handleCacheNext50}
          disabled={isCaching}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <DownloadCloud className={`w-3.5 h-3.5 ${isCaching ? "animate-bounce" : ""}`} />
          <span>{isCaching ? "Caching..." : "Cache Next 50 Ch."}</span>
        </button>
      </div>
    </section>
  );
}
