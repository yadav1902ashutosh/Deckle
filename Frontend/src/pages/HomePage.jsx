import React, { useState, useEffect } from "react";
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

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNovels: 0,
    displayRange: "0 - 0",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeGenre, setActiveGenre] = useState("all");
  const [activeStatus, setActiveStatus] = useState("Any");
  const [activeSort, setActiveSort] = useState("Most Popular (Monthly Activity)");
  const [activeScope, setActiveScope] = useState("All Lengths");
  const [activeFrequency, setActiveFrequency] = useState("All Release Rhythms");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Map user-friendly sort label to API sort parameter
  const resolveSortParam = (label) => {
    switch (label) {
      case "Latest Updated Chapters":
        return "updated";
      case "Top Rated (4.8+)":
        return "rating";
      case "Scale (Word Count)":
        return "scale";
      case "Rising Stars":
        return "newest";
      default:
        return "popular";
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catalogRes, featuredRes] = await Promise.all([
        bookService.getBooks({
          genre: activeGenre,
          status: activeStatus,
          sort: resolveSortParam(activeSort),
          page: currentPage,
          limit: 12,
        }),
        bookService.getFeaturedBooks().catch(() => []),
      ]);

      if (catalogRes && catalogRes.books) {
        setBooks(catalogRes.books);
        setPagination(catalogRes.pagination || {
          currentPage,
          totalPages: 1,
          totalNovels: catalogRes.books.length,
          displayRange: `1 - ${catalogRes.books.length}`,
        });
      } else if (Array.isArray(catalogRes)) {
        setBooks(catalogRes);
        setPagination({
          currentPage,
          totalPages: Math.max(1, Math.ceil(catalogRes.length / 12)),
          totalNovels: catalogRes.length,
          displayRange: `1 - ${catalogRes.length}`,
        });
      }

      setFeaturedBooks(Array.isArray(featuredRes) ? featuredRes : []);
    } catch (err) {
      console.error("Error loading books catalog:", err);
      setError(err.message || "Failed to load serial works from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [activeGenre, activeStatus, activeSort, currentPage]);

  const handleResetFilters = () => {
    setActiveGenre("all");
    setActiveStatus("Any");
    setActiveSort("Most Popular (Monthly Activity)");
    setActiveScope("All Lengths");
    setActiveFrequency("All Release Rhythms");
    setCurrentPage(1);
  };

  const featuredList = featuredBooks.length > 0 ? featuredBooks : books.slice(0, 20);

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* 1. Editorial Spotlight / Featured Serial Hero */}
      {loading ? (
        <HeroSpotlightSkeleton />
      ) : featuredList.length > 0 ? (
        <HeroSpotlight books={featuredList} loading={false} />
      ) : null}

      {/* 2. Discovery Canvas & Multi-facet Filter System */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        <FilterBar
          activeGenre={activeGenre}
          onSelectGenre={(g) => {
            setActiveGenre(g);
            setCurrentPage(1);
          }}
          activeStatus={activeStatus}
          onSelectStatus={(s) => {
            setActiveStatus(s);
            setCurrentPage(1);
          }}
          activeSort={activeSort}
          onSelectSort={(s) => {
            setActiveSort(s);
            setCurrentPage(1);
          }}
          activeScope={activeScope}
          onSelectScope={setActiveScope}
          activeFrequency={activeFrequency}
          onSelectFrequency={setActiveFrequency}
          onResetFilters={handleResetFilters}
          totalNovels={pagination.totalNovels}
          displayRange={pagination.displayRange}
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
                    : `${pagination.totalNovels} ${pagination.totalNovels === 1 ? "Work" : "Works"}`}
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
            ) : books.length > 0 ? (
              <div
                className={`grid gap-5 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {books.map((book) => (
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
                    No serial stories match your active genre and status filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-text text-xs font-semibold cursor-pointer hover:bg-accent-hover transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Catalog Pagination Bar */}
            {!loading && pagination.totalPages > 1 && (
              <CatalogPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
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
            <TrendingMotifs onSelectTag={(t) => {
              setActiveGenre(t);
              setCurrentPage(1);
            }} />

            {/* Widget 4: Reader Engagement / Weekly Reading Goal */}
            <ReadingGoalWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}
