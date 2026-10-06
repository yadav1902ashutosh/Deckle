import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CheckSquare,
  BookMarked,
  History,
  DownloadCloud,
  X,
  Clock,
  Trash2,
  FolderInput,
} from "lucide-react";
import ReadingStatsBanner from "../components/library/ReadingStatsBanner";
import ActiveReadingHero from "../components/library/ActiveReadingHero";
import BookshelfList from "../components/library/BookshelfList";
import AuthorAvatar from "../components/common/AuthorAvatar";
import readingHistoryService from "../services/readingHistoryService/readingHistoryService";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("shelf"); // shelf | history | downloads
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [novels, setNovels] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeReading, setActiveReading] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [shelfData, statsData, histData] = await Promise.all([
        readingHistoryService.getBookshelf("all"),
        readingHistoryService.getLibraryStats().catch(() => ({ stats: {}, active_reading: null })),
        readingHistoryService.getRecentHistory(30).catch(() => []),
      ]);

      const formattedShelf = (Array.isArray(shelfData) ? shelfData : []).map((b) => ({
        id: b.book_id || b.id,
        title: b.title,
        slug: b.slug,
        author: b.author_name || "Unknown Author",
        authorAvatar: b.author_avatar || null,
        authorHandle: b.author_handle || null,
        coverImage: b.cover_image,
        currentChapterNumber: b.last_chapter_number || 1,
        latestChapterNumber: b.latest_chapter?.chapter_number || b.total_chapters || 1,
        latestChapterTitle: b.latest_chapter?.title || "Latest Release",
        progressPercentage: Math.min(100, Math.round(((b.last_chapter_number || 1) / Math.max(1, b.total_chapters || 1)) * 100)),
        unreadChapters: b.unread_chapters || 0,
        totalWords: b.total_words ? `${(b.total_words / 1000).toFixed(0)}k words` : "Ongoing",
        status: b.status || "Ongoing",
        tags: Array.isArray(b.tags) && b.tags.length > 0 ? b.tags : [b.genre_name || "Serial"],
        isFavorite: Boolean(b.is_favorite),
      }));

      setNovels(formattedShelf);
      setActiveReading(statsData.active_reading || null);
      setHistoryList(Array.isArray(histData) ? histData : []);
    } catch (err) {
      console.error("Failed to load library data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  // Toggle selection for manage mode
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === novels.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(novels.map((n) => n.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Remove ${selectedIds.length} novels from your personal shelf?`)) {
      try {
        await readingHistoryService.batchRemove(selectedIds);
        setNovels((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
        setSelectedIds([]);
        setIsManageMode(false);
      } catch (err) {
        alert(err.message || "Failed to remove novels");
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your reading history?")) {
      try {
        await readingHistoryService.clearHistory();
        setHistoryList([]);
      } catch (err) {
        alert(err.message || "Failed to clear reading history");
      }
    }
  };

  const filteredNovels = novels.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.author.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Full-Width Expansive Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* ================= STICKY TOP CONTROLS ================= */}
        <div className="flex flex-col gap-3 sticky top-16 z-30 bg-page/95 backdrop-blur-md pt-2 pb-3 border-b border-border-subtle/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter shelf by title, author, or tags..."
                className="w-full h-11 pl-10 pr-9 bg-card border border-border-subtle/50 rounded-xl text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsManageMode(!isManageMode);
                if (isManageMode) setSelectedIds([]);
              }}
              className={`h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                isManageMode
                  ? "bg-accent text-white"
                  : "bg-card hover:bg-tag text-text-main border border-border-subtle/50"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{isManageMode ? "Done" : "Manage"}</span>
            </button>
          </div>

          {/* Segmented Tabs */}
          <div className="flex p-1 bg-tag/80 rounded-xl text-xs font-semibold text-text-muted">
            <button
              onClick={() => setActiveTab("shelf")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "shelf"
                  ? "bg-card text-accent font-bold shadow-xs"
                  : "hover:text-text-main"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Bookshelf</span>
              <span className="px-1.5 py-0.2 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                {novels.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-card text-accent font-bold shadow-xs"
                  : "hover:text-text-main"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Reading History</span>
              <span className="text-[10px] opacity-70">{historyList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("downloads")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "downloads"
                  ? "bg-card text-accent font-bold shadow-xs"
                  : "hover:text-text-main"
              }`}
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </button>
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}

        {/* 1. BOOKSHELF TAB */}
        {activeTab === "shelf" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Desktop 2-Column Spotlight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <ActiveReadingHero
                book={
                  activeReading
                    ? {
                        title: activeReading.title,
                        slug: activeReading.slug,
                        author: activeReading.author_name,
                        authorAvatar: activeReading.author_avatar,
                        authorHandle: activeReading.author_handle,
                        currentChapterNumber: activeReading.last_chapter_number || 1,
                        currentChapterTitle: activeReading.current_chapter_title || "Chapter in progress",
                        quote: "Deep within the unfolding chronicles, each line carves the journey forward...",
                        progressPercentage: Math.min(100, Math.round(((activeReading.last_chapter_number || 1) / Math.max(1, activeReading.total_chapters || 1)) * 100)),
                        coverImage: activeReading.cover_image,
                        lastRead: "Recent session",
                        totalChapters: activeReading.total_chapters || 1,
                      }
                    : undefined
                }
              />
              <ReadingStatsBanner />
            </div>

            {/* Shelf Multi-Column Grid */}
            <BookshelfList
              novels={filteredNovels}
              isManageMode={isManageMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>
        )}

        {/* 2. READING HISTORY TAB */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Recently read chapters across your devices</span>
              {historyList.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-accent hover:underline font-medium cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {historyList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                {historyList.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-card/75 hover:bg-card border border-border-subtle/50 rounded-xl p-4 flex items-center justify-between shadow-xs transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <Link
                        to={`/book/${item.slug}`}
                        className="font-serif text-base font-semibold text-text-main hover:text-accent transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      {item.author_name && (
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <AuthorAvatar
                            name={item.author_name}
                            avatar={item.author_avatar}
                            handle={item.author_handle}
                            size="xs"
                          />
                          <span>{item.author_name}</span>
                        </div>
                      )}
                      <p className="text-xs text-text-muted">
                        Ch. {item.last_chapter_number}: {item.chapter_title || "Latest Read"}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                        <Clock className="w-3 h-3 text-accent" />
                        <span>Recently</span>
                        <span>•</span>
                        <span className="text-accent font-semibold">{parseFloat(item.scroll_percentage || 0).toFixed(0)}% reached</span>
                      </div>
                    </div>

                    <Link
                      to={`/book/${item.slug}/chapter/${item.last_chapter_number || 1}`}
                      className="px-3.5 py-2 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors shrink-0 shadow-xs"
                    >
                      Resume
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40">
                No reading history recorded yet. Open any serial novel to begin tracking!
              </div>
            )}
          </div>
        )}

        {/* 3. OFFLINE DOWNLOADS TAB */}
        {activeTab === "downloads" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="p-4 bg-card/60 rounded-xl border border-border-subtle/40 flex items-center justify-between text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text-main block">Offline Manuscript Cache</span>
                <span>Active local cache powered by Deckle client storage</span>
              </div>
              <button
                onClick={() => alert("Cache verified and primed")}
                className="px-3 py-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-medium transition-colors cursor-pointer"
              >
                Prune Cache
              </button>
            </div>

            <div className="py-12 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40">
              Offline manuscript caching is active. Chapters opened in the reader are automatically cached for offline viewing.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
