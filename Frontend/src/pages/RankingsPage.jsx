import React, { useState, useEffect } from "react";
import RankingsFilters from "../components/rankings/RankingsFilters";
import EditorialSpotlightCard from "../components/rankings/EditorialSpotlightCard";
import RankingsList from "../components/rankings/RankingsList";
import bookService from "../services/bookService/bookService";
import { useLibrary } from "../context/LibraryContext";

export default function RankingsPage() {
  const { isBookmarked, toggleLibrary, bookmarkedIds } = useLibrary();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    bookService
      .getRankings({ limit: 50 })
      .then((rankingsData) => {
        if (!isMounted) return;
        const normalized = (Array.isArray(rankingsData) ? rankingsData : []).map((b, idx) => ({
          id: b.id,
          rank: b.rank || idx + 1,
          title: b.title,
          slug: b.slug,
          author: b.author_name || "Unknown Author",
          authorHandle: b.author_handle || "",
          authorAvatar: b.author_avatar || null,
          status: b.status || "Ongoing",
          coverImage: b.cover_image,
          totalWords: b.total_words ? `${(b.total_words / 1000).toFixed(0)}k words` : "150k words",
          views: b.views_count ? `${b.views_count}` : "1.2k",
          rating: b.rating || 5.0,
          tags: Array.isArray(b.tags) && b.tags.length > 0 ? b.tags : [b.genre_name || "Serial"],
          excerpt: b.description || "A masterfully serialized narrative with escalating stakes and cultivation lore.",
          latestChapterNumber: b.latest_chapter?.chapter_number || 1,
          latestChapterTitle: b.latest_chapter?.title || "Latest Release",
          movement: b.movement || (idx === 0 ? "double_up" : idx < 3 ? "up" : "same"),
        }));

        setNovels(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load rankings:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleBookmark = (id) => {
    const novel = novels.find((n) => n.id === id);
    if (novel) {
      toggleLibrary(novel);
    }
  };

  const filteredNovels = novels.filter((novel) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        novel.title.toLowerCase().includes(q) ||
        novel.author.toLowerCase().includes(q) ||
        novel.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedStatus !== "All" && selectedStatus !== "Ranked Today") {
      if (novel.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    }
    if (selectedGenre !== "All Genres") {
      const gTerm = selectedGenre.split("/")[0].trim().toLowerCase();
      const hasGenre = novel.tags.some((t) => t.toLowerCase().includes(gTerm));
      if (!hasGenre) return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Main Full-Width Expansive Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* Search & Fast Filters */}
        <RankingsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          selectedStatus={selectedStatus}
          onStatusSelect={setSelectedStatus}
          isCompactMode={isCompactMode}
          onToggleCompact={() => setIsCompactMode(!isCompactMode)}
        />

        {/* Editorial Spotlight Banner */}
        {novels.length > 0 && (
          <EditorialSpotlightCard
            spotlightBook={novels[0]}
            onAddToShelf={() => handleToggleBookmark(novels[0].id)}
          />
        )}

        {/* Rankings Leaderboard */}
        <RankingsList
          novels={filteredNovels}
          loading={loading}
          isCompactMode={isCompactMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedIds={Array.from(bookmarkedIds)}
        />
      </div>
    </div>
  );
}
