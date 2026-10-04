import React, { useState, useEffect, useMemo } from "react";
import HeroSpotlight from "../components/home/HeroSpotlight";
import FilterBar from "../components/home/FilterBar";
import BookCard from "../components/books/BookCard";
import CatalogPagination from "../components/home/CatalogPagination";
import RankingsSidebar from "../components/home/RankingsSidebar";
import LiveSerialPulse from "../components/home/LiveSerialPulse";
import TrendingMotifs from "../components/home/TrendingMotifs";
import ReadingGoalWidget from "../components/home/ReadingGoalWidget";
import { BookCardSkeleton, HeroSpotlightSkeleton } from "../components/common/Skeletons";
import bookService from "../services/bookService/bookService";
import { LayoutGrid, List, AlertCircle, RefreshCw, PenTool } from "lucide-react";
import { Link } from "react-router-dom";

// Backwards-compatible empty export for any legacy references
export const STITCH_CATALOG = [];

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeGenre, setActiveGenre] = useState("all");
  const [activeStatus, setActiveStatus] = useState("Any");
  const [activeSort, setActiveSort] = useState("Most Popular (Monthly Activity)");
  const [activeScope, setActiveScope] = useState("All Lengths");
  const [activeFrequency, setActiveFrequency] = useState("All Release Rhythms");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading books catalog:", err);
      setError(err.message || "Failed to load serial works from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredCatalog = useMemo(() => {
    if (!books || books.length === 0) return [];

    return books.filter((book) => {
      // Genre filter matching tags, genre_slug, or genre_name
      if (activeGenre && activeGenre !== "all") {
        const targetGenre = activeGenre.toLowerCase().replace(/[\s&]+/g, "-");
        const genreSlug = (book.genre_slug || "").toLowerCase();
        const genreName = (book.genre_name || "").toLowerCase().replace(/[\s&]+/g, "-");

        let matchesGenre = genreSlug.includes(targetGenre) || genreName.includes(targetGenre);

        if (!matchesGenre && Array.isArray(book.tags)) {
          matchesGenre = book.tags.some((tag) => {
            const slug = tag.toLowerCase().replace(/[\s&]+/g, "-");
            return slug === targetGenre || slug.includes(targetGenre) || targetGenre.includes(slug);
          });
        }

        if (!matchesGenre) return false;
      }

      // Status filter
      if (activeStatus && activeStatus !== "Any") {
        if ((book.status || "").toLowerCase() !== activeStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [books, activeGenre, activeStatus]);

  const handleResetFilters = () => {
    setActiveGenre("all");
    setActiveStatus("Any");
    setActiveSort("Trending Stories");
    setActiveScope("All Lengths");
    setActiveFrequency("All Release Rhythms");
  };

  const featuredBook = books.length > 0 ? books[0] : null;

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* 1. Editorial Spotlight / Featured Serial Hero */}
      {loading ? (
        <HeroSpotlightSkeleton />
      ) : featuredBook ? (
        <HeroSpotlight book={featuredBook} loading={false} />
      ) : null}

      {/* 2. Discovery Canvas & Multi-facet Filter System */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        <FilterBar
          activeGenre={activeGenre}
          onSelectGenre={setActiveGenre}
          activeStatus={activeStatus}
          onSelectStatus={setActiveStatus}
          activeSort={activeSort}
          onSelectSort={setActiveSort}
          activeScope={activeScope}
          onSelectScope={setActiveScope}
          activeFrequency={activeFrequency}
          onSelectFrequency={setActiveFrequency}
          onResetFilters={handleResetFilters}
          totalNovels={filteredCatalog.length}
          displayRange={`1 - ${filteredCatalog.length}`}
        />

        {/* 3. Main Content Area: Asymmetric 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: Catalog Grid (8 Columns) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Catalog Subheader */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-text-main">
                  Curated Serial Works
                </h2>
                <span className="text-xs bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle font-medium">
                  {loading
                    ? "Loading..."
                    : `${filteredCatalog.length} ${filteredCatalog.length === 1 ? "Work" : "Works"}`}
                </span>
              </div>

              {/* View Switcher (Grid / List) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-tag text-text-main shadow-2xs"
                      : "text-text-muted hover:text-text-main hover:bg-tag"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-tag text-text-main shadow-2xs"
                      : "text-text-muted hover:text-text-main hover:bg-tag"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error banner if network fails */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-red-500">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchBooks}
                  className="flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading ? (
              <div
                className={`grid gap-5 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCatalog.length > 0 ? (
              <div
                className={`grid gap-5 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {filteredCatalog.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-card rounded-2xl border border-border-subtle space-y-4">
                <div className="w-12 h-12 rounded-full bg-tag flex items-center justify-center mx-auto text-text-muted">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-text-main">
                    No Serials Found
                  </h3>
                  <p className="text-text-muted text-xs max-w-md mx-auto">
                    {books.length === 0
                      ? "No serial stories are currently published in the catalog. Be the first author to publish in Author Studio!"
                      : "No serial stories match your active genre and status filters."}
                  </p>
                </div>
                {books.length === 0 ? (
                  <Link
                    to="/studio"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Publish a Serial</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg bg-accent text-accent-text text-xs font-semibold cursor-pointer hover:bg-accent-hover transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Catalog Pagination Bar */}
            {!loading && filteredCatalog.length > 0 && (
              <CatalogPagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(filteredCatalog.length / 10))}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* ================= RIGHT: Sidebar Widgets (4 Columns) ================= */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Widget 1: Real-Time Power Rankings (Top 10) */}
            <RankingsSidebar books={books} loading={loading} />

            {/* Widget 2: Live Serial Pulse */}
            <LiveSerialPulse books={books} loading={loading} />

            {/* Widget 3: Trending Motifs */}
            <TrendingMotifs />

            {/* Widget 4: Reader Engagement / Weekly Reading Goal */}
            <ReadingGoalWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}
