import React, { useState } from "react";
import RankingsFilters from "../components/rankings/RankingsFilters";
import EditorialSpotlightCard from "../components/rankings/EditorialSpotlightCard";
import RankingsList from "../components/rankings/RankingsList";

const RANKINGS_DATA = [
  {
    id: 1,
    title: "Battle Through the Heavens",
    slug: "battle-through-the-heavens",
    author: "Tiancan Tudou",
    status: "Completed",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    totalWords: "7.1M words",
    views: "1.9M",
    tags: ["DouQi", "Alchemist", "Cultivation"],
    excerpt: "In a realm of pure Dou Qi, a fallen genius awakens an ancient ring spirit. Thirty years east of the river, thirty years west—never bully the young and poor!",
    latestChapterNumber: 1663,
    latestChapterTitle: "Flame Di Reborn",
  },
  {
    id: 2,
    title: "How Did I Become Invincible?",
    slug: "how-did-i-become-invincible",
    author: "Xinfeng",
    status: "Ongoing",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    totalWords: "2.9M words",
    views: "890k",
    tags: ["Invincible", "Comedy", "Martial"],
    excerpt: "Lin Fan traveled to a martial cultivation world with zero talent, only to discover his cheat system was inverted: every strike received turned into pure cultivation!",
    latestChapterNumber: 320,
    latestChapterTitle: "Beast God descent",
  },
  {
    id: 3,
    title: "Lord of the Mysteries",
    slug: "lord-of-the-mysteries",
    author: "Cuttlefish That Loves Diving",
    status: "Completed",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    totalWords: "3.2M words",
    views: "2.4M",
    tags: ["Mysticism", "Steampunk", "Tarot"],
    excerpt: "With the rising of the red moon, Zhou Mingrui woke up in an alternate Victorian world as Klein Moretti, facing potions, divinations, and ancient cosmos horrors.",
    latestChapterNumber: 1432,
    latestChapterTitle: "The Fool",
  },
  {
    id: 4,
    title: "A Record of a Mortal's Journey",
    slug: "a-record-of-a-mortals-journey",
    author: "Wang Yu",
    status: "Ongoing",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    totalWords: "7.4M words",
    views: "1.2M",
    tags: ["SlowBurn", "Mortal", "Dao"],
    excerpt: "Han Li, an ordinary boy from a poor village, enters a martial arts sect by coincidence, possessing nothing but a mysterious small green bottle that accelerates herb growth.",
    latestChapterNumber: 2450,
    latestChapterTitle: "Spirit Sea",
  },
  {
    id: 5,
    title: "Reverend Insanity",
    slug: "reverend-insanity",
    author: "Gu Zhen Ren",
    status: "Ongoing",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400",
    totalWords: "5.1M words",
    views: "1.6M",
    tags: ["Demonic", "GuMaster", "Rebirth"],
    excerpt: "Humans are clever, Gu are the essence of heaven and earth. Fang Yuan travels 500 years back to his youth with the Spring Autumn Cicada, calculating every advantage with cold indifference.",
    latestChapterNumber: 2334,
    latestChapterTitle: "Fate Gu Shattered",
  },
];

export default function RankingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [bookmarkedIds, setBookmarkedIds] = useState([1]);
  const [toastMessage, setToastMessage] = useState("");

  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const isBookmarked = prev.includes(id);
      const next = isBookmarked ? prev.filter((i) => i !== id) : [...prev, id];
      showToast(isBookmarked ? "Removed from shelf" : "Added to shelf");
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const filteredNovels = RANKINGS_DATA.filter((novel) => {
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

      {/* Main Full-Width Expansive Container (Matching Home Page) */}
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
        <EditorialSpotlightCard
          onAddToShelf={() => showToast("Heavenly Tribulation added to shelf")}
        />

        {/* Rankings Leaderboard */}
        <RankingsList
          novels={filteredNovels}
          isCompactMode={isCompactMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onToggleBookmark={handleToggleBookmark}
          bookmarkedIds={bookmarkedIds}
        />
      </div>
    </div>
  );
}
