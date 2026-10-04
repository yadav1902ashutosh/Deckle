import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, AlertCircle, Home } from "lucide-react";
import BookHero from "../components/book-details/BookHero";
import ChapterDirectory from "../components/book-details/ChapterDirectory";
import CommunityBento from "../components/book-details/CommunityBento";
import RelatedRecommendations from "../components/book-details/RelatedRecommendations";
import { BookDetailsSkeleton } from "../components/common/Skeletons";
import bookService from "../services/bookService/bookService";
import chapterService from "../services/chapterService/chapterService";

export default function BookDetailsPage() {
  const { slug } = useParams();

  const [bookData, setBookData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Fetch book details directly from API
  useEffect(() => {
    let isMounted = true;

    async function loadNovel() {
      if (!slug) {
        setError("Invalid novel slug");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const book = await bookService.getBookBySlug(slug);

        if (isMounted) {
          setBookData(book);

          // Fetch chapters TOC if book ID exists
          if (book?.id) {
            try {
              const toc = await chapterService.getNovelTOC(book.id);
              if (isMounted) {
                setChapters(Array.isArray(toc) ? toc : []);
              }
            } catch (tocErr) {
              console.warn("Could not load chapter TOC:", tocErr);
            }
          }
        }
      } catch (err) {
        console.error("Error loading novel details:", err);
        if (isMounted) {
          setError(err.message || "Novel not found.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNovel();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <BookDetailsSkeleton />;
  }

  if (error || !bookData) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-tag flex items-center justify-center text-text-muted">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text-main">
          Serial Novel Not Found
        </h2>
        <p className="text-text-muted text-sm max-w-md">
          {error || `We could not locate any serial work with slug "${slug}".`}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const primaryGenre =
    bookData.genre_name ||
    (Array.isArray(bookData.tags) && bookData.tags[0]) ||
    "Serial Fiction";

  return (
    <div className="relative w-full min-h-screen pb-16 bg-page transition-colors duration-200">
      {/* Ambient background depth lights */}
      <div className="absolute -top-24 right-1/4 w-[480px] h-[480px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -left-32 w-[380px] h-[380px] bg-tag/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Full-Width Content Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-12">
        {/* 1. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="pt-4 flex items-center gap-1.5 text-xs text-text-muted overflow-x-auto whitespace-nowrap scrollbar-none"
        >
          <Link
            to="/"
            className="hover:text-text-main transition-colors font-medium flex items-center gap-1"
          >
            <span>Catalog</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-border-subtle shrink-0" />
          <span className="font-medium text-text-muted">
            {primaryGenre}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-border-subtle shrink-0" />
          <span className="font-semibold text-text-main truncate max-w-[280px]">
            {bookData.title}
          </span>
        </nav>

        {/* 2. Novel Editorial Dossier Hero */}
        <BookHero
          book={{
            ...bookData,
            totalChapters: chapters.length,
            latestChapterNum: chapters[chapters.length - 1]?.chapter_number || 0,
            latestChapterTitle: chapters[chapters.length - 1]?.title || "",
          }}
        />

        {/* 3. Granular Table of Contents / Chapter Directory */}
        <ChapterDirectory
          bookId={bookData.id}
          bookSlug={bookData.slug}
          chapters={chapters}
          totalChapters={chapters.length}
        />

        {/* 4. Reader Community & Discussions */}
        <CommunityBento bookSlug={bookData.slug} book={bookData} />

        {/* 5. Algorithmic Recommendations */}
        <RelatedRecommendations
          currentCategory={primaryGenre}
          currentSlug={bookData.slug}
        />
      </div>
    </div>
  );
}
