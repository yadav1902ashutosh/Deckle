import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Bookmark,
  Trash2,
  CheckCircle,
  MoreVertical,
  BookOpen,
  ArrowUpDown,
  Plus,
} from "lucide-react";

export default function BookshelfList({
  novels = [],
  isManageMode = false,
  selectedIds = [],
  onToggleSelect = () => {},
  onSelectAll = () => {},
  onDeleteSelected = () => {},
}) {
  const [activeFolder, setActiveFolder] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const folders = [
    { id: "all", name: `All (${novels.length})` },
    { id: "xianxia", name: "Xianxia & Martial" },
    { id: "favorites", name: "Favorites" },
    { id: "finished", name: "Finished" },
  ];

  const filteredNovels = novels.filter((n) => {
    if (activeFolder === "all") return true;
    if (activeFolder === "xianxia") return n.tags?.some((t) => /xianxia|cultivation|martial/i.test(t));
    if (activeFolder === "favorites") return n.isFavorite;
    if (activeFolder === "finished") return n.progressPercentage >= 100;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter & Sorter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base sm:text-lg font-semibold text-text-main">
            Saved Works
          </span>
          <span className="text-xs text-text-muted">
            ({filteredNovels.length} of {novels.length} active)
          </span>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border-subtle/40 text-xs text-text-muted">
            <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-text-main font-medium"
            >
              <option value="recent">Sort: Recently Read</option>
              <option value="progress">Sort: Highest Progress</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

          {isManageMode && (
            <button
              onClick={onSelectAll}
              className="px-3 py-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-xs font-medium text-text-main transition-colors"
            >
              {selectedIds.length === filteredNovels.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>
      </div>

      {/* Quick Folder Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {folders.map((folder) => {
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-accent text-white shadow-xs"
                  : "bg-tag hover:bg-card text-text-muted hover:text-text-main"
              }`}
            >
              {folder.name}
            </button>
          );
        })}

        <button
          onClick={() => alert("Custom folder categorization available in Deckle Pro!")}
          className="px-2.5 py-1.5 rounded-full bg-tag hover:bg-card text-text-muted hover:text-text-main text-xs font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Group</span>
        </button>
      </div>

      {/* Batch Actions Bar (when manage mode is active) */}
      {isManageMode && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-text-main animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">{selectedIds.length}</span>
            <span>novels selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDeleteSelected}
              disabled={selectedIds.length === 0}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove from Shelf</span>
            </button>
          </div>
        </div>
      )}

      {/* High-Density Novel Cards Grid (Multi-column responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        {filteredNovels.length === 0 ? (
          <div className="text-center py-12 bg-card/40 rounded-2xl border border-dashed border-border-subtle/60 text-text-muted">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-accent" />
            <p className="font-medium text-sm">No novels found in this shelf category.</p>
            <p className="text-xs mt-1">Explore the Catalog or Rankings to add new stories to your sanctuary.</p>
          </div>
        ) : (
          filteredNovels.map((novel) => {
            const isSelected = selectedIds.includes(novel.id);
            return (
              <div
                key={novel.id}
                className={`bg-card/75 hover:bg-card border border-border-subtle/50 rounded-xl p-3 sm:p-3.5 flex gap-3 sm:gap-4 items-center justify-between shadow-xs transition-all ${
                  isSelected ? "ring-2 ring-accent bg-accent/5" : ""
                }`}
              >
                {/* Manage Checkbox */}
                {isManageMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(novel.id)}
                    className="w-4 h-4 rounded text-accent accent-accent cursor-pointer shrink-0"
                  />
                )}

                <div className="flex gap-3 sm:gap-4 items-center min-w-0 flex-1">
                  {/* Thumbnail Cover */}
                  <div className="relative w-14 sm:w-16 h-18 sm:h-22 rounded-lg overflow-hidden shrink-0 bg-tag border border-border-subtle/40 shadow-xs">
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-full h-full object-cover"
                    />
                    {novel.unreadChapters > 0 && (
                      <div className="absolute top-1 left-1 bg-accent text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm shadow-xs">
                        {novel.unreadChapters} New
                      </div>
                    )}
                  </div>

                  {/* Novel Information */}
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/book/${novel.slug}`}
                        className="font-serif text-sm sm:text-base font-semibold text-text-main hover:text-accent transition-colors truncate"
                      >
                        {novel.title}
                      </Link>
                      {novel.status && (
                        <span className="px-1.5 py-0.2 rounded bg-tag text-text-muted text-[10px] font-medium uppercase tracking-wider">
                          {novel.status}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-muted">
                      {novel.author} · {novel.totalWords || "3.8M words"}
                    </p>

                    <p className="text-xs text-text-main truncate font-sans">
                      Latest: Ch. {novel.latestChapterNumber}: {novel.latestChapterTitle}
                    </p>

                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-accent font-medium text-[11px]">
                        Read up to Ch. {novel.currentChapterNumber} ({novel.progressPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Resume Chapter Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/book/${novel.slug}/chapter/${novel.currentChapterNumber || 1}`}
                    title={`Resume Chapter ${novel.currentChapterNumber}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-tag hover:bg-accent text-accent hover:text-white flex items-center justify-center transition-all shadow-xs group"
                  >
                    <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
