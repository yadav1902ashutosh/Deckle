import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CheckSquare,
  BookMarked,
  History,
  DownloadCloud,
  X,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import ReadingStatsBanner from "../components/library/ReadingStatsBanner";
import ActiveReadingHero from "../components/library/ActiveReadingHero";
import BookshelfList from "../components/library/BookshelfList";

// Initial mock data reflecting Deckle's serialized library
const INITIAL_SHELF_NOVELS = [
  {
    id: 1,
    title: "Battle Through the Heavens",
    slug: "battle-through-the-heavens",
    author: "Heavenly Silkworm Potato",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    currentChapterNumber: 42,
    latestChapterNumber: 1663,
    latestChapterTitle: "Flame Di Reborn, Savior of the Continent (End)",
    progressPercentage: 68,
    unreadChapters: 12,
    totalWords: "4.8M words",
    status: "Completed",
    tags: ["Cultivation", "Xianxia", "Action"],
    isFavorite: true,
  },
  {
    id: 2,
    title: "How Did I Become Invincible?",
    slug: "how-did-i-become-invincible",
    author: "Xinfeng",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    currentChapterNumber: 318,
    latestChapterNumber: 320,
    latestChapterTitle: "Beast God, what are you happy about?",
    progressPercentage: 42,
    unreadChapters: 2,
    totalWords: "2.9M words",
    status: "Ongoing",
    tags: ["Invincible Flow", "Comedy", "Cultivation"],
    isFavorite: true,
  },
  {
    id: 3,
    title: "Lord of the Mysteries",
    slug: "lord-of-the-mysteries",
    author: "Cuttlefish That Loves Diving",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    currentChapterNumber: 1294,
    latestChapterNumber: 1432,
    latestChapterTitle: "The Fool and His Journey",
    progressPercentage: 88,
    unreadChapters: 0,
    totalWords: "3.2M words",
    status: "Completed",
    tags: ["Mystery", "Steampunk", "Western Fantasy"],
    isFavorite: true,
  },
  {
    id: 4,
    title: "A Record of a Mortal's Journey",
    slug: "a-record-of-a-mortals-journey",
    author: "Wang Yu",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    currentChapterNumber: 510,
    latestChapterNumber: 2450,
    latestChapterTitle: "The Spirit Tribulation Sea",
    progressPercentage: 21,
    unreadChapters: 34,
    totalWords: "7.4M words",
    status: "Ongoing",
    tags: ["Xianxia", "Mortal", "Slow Burn"],
    isFavorite: false,
  },
  {
    id: 5,
    title: "Reverend Insanity",
    slug: "reverend-insanity",
    author: "Gu Zhen Ren",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400",
    currentChapterNumber: 820,
    latestChapterNumber: 2334,
    latestChapterTitle: "Fate Gu Shattered",
    progressPercentage: 35,
    unreadChapters: 5,
    totalWords: "5.1M words",
    status: "Ongoing",
    tags: ["Dark Fantasy", "Scheming", "Cultivation"],
    isFavorite: true,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("shelf"); // shelf | history | downloads
  const [searchQuery, setSearchQuery] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [novels, setNovels] = useState(INITIAL_SHELF_NOVELS);

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

  const handleDeleteSelected = () => {
    if (window.confirm(`Remove ${selectedIds.length} novels from your personal shelf?`)) {
      setNovels((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setIsManageMode(false);
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
      {/* Full-Width Expansive Container (Matching Home Page) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* ================= STICKY TOP CONTROLS ================= */}
        <div className="flex flex-col gap-3 sticky top-16 z-30 bg-page/95 backdrop-blur-md pt-2 pb-3 border-b border-border-subtle/30">
          {/* Search bar & Manage button */}
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
              <span className="text-[10px] opacity-70">18</span>
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
              <span className="text-[10px] opacity-70">3</span>
            </button>
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}

        {/* 1. BOOKSHELF TAB */}
        {activeTab === "shelf" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Desktop 2-Column Spotlight: Current Scroll (Left) & Reading Rhythm (Right) with Pixel-Perfect Equal Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <ActiveReadingHero />
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
              <button
                onClick={() => alert("History cleared")}
                className="text-accent hover:underline font-medium"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
              {[
                {
                  title: "Battle Through the Heavens",
                  slug: "battle-through-the-heavens",
                  chapter: 42,
                  chapterTitle: "The Alchemist Grandmaster",
                  time: "15 minutes ago",
                  progress: "68%",
                },
                {
                  title: "How Did I Become Invincible?",
                  slug: "how-did-i-become-invincible",
                  chapter: 318,
                  chapterTitle: "Thunder God Descent",
                  time: "2 hours ago",
                  progress: "42%",
                },
                {
                  title: "Lord of the Mysteries",
                  slug: "lord-of-the-mysteries",
                  chapter: 1294,
                  chapterTitle: "The Door of Transcendence",
                  time: "Yesterday",
                  progress: "88%",
                },
              ].map((item, idx) => (
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
                    <p className="text-xs text-text-muted">
                      Ch. {item.chapter}: {item.chapterTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                      <Clock className="w-3 h-3 text-accent" />
                      <span>{item.time}</span>
                      <span>•</span>
                      <span className="text-accent font-semibold">{item.progress} reached</span>
                    </div>
                  </div>

                  <Link
                    to={`/book/${item.slug}/chapter/${item.chapter}`}
                    className="px-3.5 py-2 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors shrink-0 shadow-xs"
                  >
                    Resume
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. OFFLINE DOWNLOADS TAB */}
        {activeTab === "downloads" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="p-4 bg-card/60 rounded-xl border border-border-subtle/40 flex items-center justify-between text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text-main block">Offline Manuscript Cache</span>
                <span>Storage used: 14.8 MB of 500 MB</span>
              </div>
              <button
                onClick={() => alert("Cache pruned")}
                className="px-3 py-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-medium transition-colors"
              >
                Prune Cache
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
              {[
                {
                  title: "Battle Through the Heavens",
                  slug: "battle-through-the-heavens",
                  chapters: "Ch. 1 - 100",
                  size: "6.2 MB",
                },
                {
                  title: "How Did I Become Invincible?",
                  slug: "how-did-i-become-invincible",
                  chapters: "Ch. 300 - 350",
                  size: "4.1 MB",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card/75 hover:bg-card border border-border-subtle/50 rounded-xl p-4 flex items-center justify-between shadow-xs transition-colors"
                >
                  <div>
                    <h4 className="font-serif text-base font-semibold text-text-main">{item.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {item.chapters} • {item.size} • Ready for plane or subway reading
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-tag text-accent font-semibold text-xs">
                    Stored Offline
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
