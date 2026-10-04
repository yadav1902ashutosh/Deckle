import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, List, Touchpad, Bookmark, Check, BookOpen } from "lucide-react";
import ReaderHeader from "../components/reader/ReaderHeader";
import ReaderFooter from "../components/reader/ReaderFooter";
import ReaderSideNav from "../components/reader/ReaderSideNav";
import ReaderTOCDrawer from "../components/reader/ReaderTOCDrawer";
import ReaderSettingsModal from "../components/reader/ReaderSettingsModal";
import ReaderToast from "../components/reader/ReaderToast";
import bookService from "../services/bookService/bookService";
import chapterService from "../services/chapterService/chapterService";
import readingHistoryService from "../services/readingHistoryService/readingHistoryService";
import { DECKLE_THEMES, getActiveTheme, applyTheme } from "../utils/themeConfig";

export default function ReaderPage() {
  const { slug = "", chapterNum = "1" } = useParams();
  const navigate = useNavigate();

  const currentCh = parseInt(chapterNum, 10) || 1;

  // Preferences State
  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  const [fontFamily, setFontFamily] = useState("serif"); // 'serif' | 'sans'
  const [fontSize, setFontSize] = useState(19);
  const [isLiteraryIndent, setIsLiteraryIndent] = useState(true);
  const [textAlign, setTextAlign] = useState("justify"); // 'justify' | 'left'

  // Interactive UI State
  const [controlsVisible, setControlsVisible] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState({ message: "", icon: "info", visible: false });

  const toastTimerRef = useRef(null);

  // Live novel and chapter data from API
  const [bookData, setBookData] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [tocChapters, setTocChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consolidated novel details, TOC & chapter loader
  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    setLoading(true);
    setError(null);

    async function loadReaderData() {
      try {
        // 1. Fetch novel details if not already loaded or if slug changed
        let currentBook = bookData;
        const isSameBook =
          currentBook &&
          (currentBook.slug?.toLowerCase() === slug.toLowerCase() ||
            String(currentBook.id) === String(slug));

        if (!isSameBook) {
          currentBook = await bookService.getBookBySlug(slug);
          if (!isMounted) return;
          setBookData(currentBook);

          // Fetch Table of Contents
          try {
            const toc = await chapterService.getNovelTOC(currentBook.id);
            if (isMounted) {
              setTocChapters(Array.isArray(toc) ? toc : []);
            }
          } catch (tocErr) {
            console.warn("Failed to fetch TOC:", tocErr);
          }
        }

        if (!currentBook?.id) {
          throw new Error("Novel could not be located");
        }

        // 2. Fetch chapter content by number
        const chapter = await chapterService.readChapter(currentBook.id, currentCh);
        if (!isMounted) return;
        setChapterData(chapter);

        // Auto-sync reading progress with backend
        readingHistoryService
          .syncProgress({
            book_id: currentBook.id,
            chapter_id: chapter?.id,
            chapter_number: currentCh,
            scroll_percentage: 0.0,
            words_count: chapter?.words_count || 0,
          })
          .catch(() => {});
      } catch (err) {
        console.error("Reader load error:", err);
        if (isMounted) {
          setError(err.message || "Failed to load chapter");
          setChapterData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReaderData();

    return () => {
      isMounted = false;
    };
  }, [slug, currentCh]);

  const showToast = (message, icon = "info") => {
    setToast({ message, icon, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2400);
  };

  // Synchronize Theme
  useEffect(() => {
    const current = getActiveTheme();
    setActiveTheme(current);
    applyTheme(current);

    const onThemeChange = (e) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("deckle_theme_change", onThemeChange);
    return () => window.removeEventListener("deckle_theme_change", onThemeChange);
  }, []);

  const handleSelectTheme = (themeName) => {
    setActiveTheme(themeName);
    applyTheme(themeName);
    const themeObj = DECKLE_THEMES.find((t) => t.id === themeName);
    showToast(`Theme: ${themeObj?.name || themeName}`, "palette");
  };

  const handleToggleDayNight = () => {
    const isDark = activeTheme === "nocturne" || activeTheme === "midnight";
    const nextTheme = isDark ? "parchment" : "nocturne";
    handleSelectTheme(nextTheme);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNavigatePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNavigateNext();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setControlsVisible((v) => !v);
      } else if (e.key === "Escape") {
        setTocOpen(false);
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCh, chapterData]);

  const handleNavigatePrev = () => {
    if (chapterData?.navigation?.prev) {
      navigate(`/book/${slug}/chapter/${chapterData.navigation.prev.chapter_number}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCh > 1) {
      navigate(`/book/${slug}/chapter/${currentCh - 1}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigateNext = () => {
    if (chapterData?.navigation?.next) {
      navigate(`/book/${slug}/chapter/${chapterData.navigation.next.chapter_number}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCh < (tocChapters.length || 100)) {
      navigate(`/book/${slug}/chapter/${currentCh + 1}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("Reached final available chapter!", "auto_stories");
    }
  };

  const handleProgressChange = (chNum) => {
    navigate(`/book/${slug}/chapter/${chNum}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleBookmark = async () => {
    if (!bookData?.id) return;
    const next = !isBookmarked;
    setIsBookmarked(next);
    showToast(next ? "Book saved to reading shelf" : "Removed from shelf", "bookmark");

    try {
      await readingHistoryService.updateBookshelf({
        book_id: bookData.id,
        is_bookmarked: next,
      });
    } catch {
      setIsBookmarked(!next);
    }
  };

  const currentThemeObj = DECKLE_THEMES.find((t) => t.id === activeTheme);
  const isDarkMode = currentThemeObj?.isDark ?? false;

  const totalChaptersCount = Math.max(tocChapters.length, 1);
  const paragraphs =
    chapterData?.paragraphs && chapterData.paragraphs.length > 0
      ? chapterData.paragraphs
      : chapterData?.content
      ? [chapterData.content]
      : [];

  return (
    <div
      data-theme={activeTheme}
      className="relative min-h-screen select-none md:select-auto bg-page text-text-main transition-colors duration-300"
    >
      {/* 1. Top Floating Reader Header */}
      <ReaderHeader
        visible={controlsVisible}
        bookSlug={slug}
        bookTitle={bookData?.title || slug}
        chapterNum={currentCh}
        chapterVolume={chapterData?.volume_title || "Volume 1"}
        progressText={`${Math.round((currentCh / totalChaptersCount) * 100)}% Progress`}
        estReadingTime={`~${chapterData?.estimated_reading_minutes || 15} min`}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        onToggleTOC={() => {
          setSettingsOpen(false);
          setTocOpen((v) => !v);
        }}
        onToggleSettings={() => {
          setTocOpen(false);
          setSettingsOpen((v) => !v);
        }}
        isBookmarked={isBookmarked}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 2. Floating Side Arrows */}
      <ReaderSideNav
        controlsVisible={controlsVisible}
        canNavigatePrev={Boolean(chapterData?.navigation?.prev || currentCh > 1)}
        canNavigateNext={Boolean(chapterData?.navigation?.next || currentCh < totalChaptersCount)}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
      />

      {/* 3. Toast Notifications */}
      <ReaderToast toast={toast} />

      {/* 4. Main Literary Reading Body */}
      <div
        onClick={(e) => {
          if (
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest("input")
          ) {
            return;
          }
          setControlsVisible((v) => !v);
        }}
        className="cursor-pointer min-h-screen pt-16 sm:pt-20 pb-32 px-4 sm:px-6"
      >
        <div className="w-full max-w-3xl mx-auto cursor-default pointer-events-auto">
          {loading ? (
            <div className="py-24 text-center space-y-6">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-text-main">
                  Loading Chapter {currentCh}...
                </h2>
                <p className="text-text-muted text-xs font-sans">
                  {bookData?.title ? bookData.title : "Retrieving novel manuscript"}
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-3 pt-6 opacity-30 animate-pulse">
                <div className="h-3.5 bg-border-subtle rounded w-3/4 mx-auto" />
                <div className="h-3.5 bg-border-subtle rounded w-5/6 mx-auto" />
                <div className="h-3.5 bg-border-subtle rounded w-2/3 mx-auto" />
              </div>
            </div>
          ) : !chapterData ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-tag text-text-muted mx-auto flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-text-main">
                {tocChapters.length === 0 ? "No Chapters Released Yet" : "Chapter Not Found"}
              </h2>
              <p className="text-text-muted text-sm max-w-md mx-auto">
                {error ||
                  (tocChapters.length === 0
                    ? "This serial novel has not released any published chapters yet."
                    : `Chapter ${currentCh} could not be located in this novel's table of contents.`)}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to={`/book/${slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Novel Details</span>
                </Link>
                {tocChapters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTocOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border-subtle text-text-main text-xs font-semibold hover:bg-tag transition-colors shadow-xs"
                  >
                    <List className="w-4 h-4" />
                    <span>View Chapters ({tocChapters.length})</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Subtle Navigation Tip Bar */}
              <div className="text-center pt-3 pb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans text-text-muted bg-tag/60 border border-border-subtle/50 hover:bg-tag transition-colors">
                  <Touchpad className="w-3.5 h-3.5" />
                  <span>
                    Click anywhere or press Space to toggle toolbar • Use ← / → arrow keys to switch chapters
                  </span>
                </span>
              </div>

              {/* Chapter Heading Banner */}
              <header className="text-center pb-8 pt-4">
                <p className="text-[11px] font-bold text-accent uppercase tracking-widest mb-2 font-sans">
                  {chapterData?.volume_title || "Serial Chronicles"}
                </p>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug">
                  Chapter {currentCh}: {chapterData?.title || "Reading Manuscript"}
                </h1>
                <div className="mt-3 flex items-center justify-center flex-wrap gap-2.5 text-xs text-text-muted font-sans">
                  <span>{bookData?.author_name || "Author"}</span>
                  <span>•</span>
                  <span>{chapterData?.words_count ? `${chapterData.words_count} Words` : "Serial Edition"}</span>
                  <span>•</span>
                  <span>{chapterData?.estimated_reading_minutes ? `~${chapterData.estimated_reading_minutes} min read` : "Standard reading"}</span>
                  <span>•</span>
                  <span className="text-accent font-semibold">{bookData?.status || "Ongoing"}</span>
                </div>
              </header>

              {/* Subtle Section Divider Ornament */}
              <div className="flex items-center justify-center gap-3 my-8 text-border-subtle">
                <span className="h-px w-16 bg-border-subtle/60" />
                <span className="font-serif text-xl text-accent font-bold">§</span>
                <span className="h-px w-16 bg-border-subtle/60" />
              </div>

              {/* Lore Context Tags if present */}
              {chapterData?.lore_context && chapterData.lore_context.length > 0 && (
                <div className="my-6 p-4 rounded-xl bg-tag/70 border-l-4 border-accent text-sm leading-relaxed border border-border-subtle shadow-xs">
                  <span className="font-bold text-text-main block mb-1 font-sans text-xs uppercase tracking-wider">
                    Chapter Lore &amp; Annotations
                  </span>
                  <div className="space-y-1">
                    {chapterData.lore_context.map((lore, idx) => (
                      <p key={idx} className="text-xs text-text-muted">
                        <strong className="text-accent">{lore.term}:</strong> {lore.definition}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Literary Manuscript Body */}
              <article
                className="space-y-6 transition-all duration-150"
                style={{
                  fontFamily:
                    fontFamily === "serif"
                      ? "'Newsreader', serif"
                      : "'Plus Jakarta Sans', sans-serif",
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize * 2.05}px`,
                  textAlign: textAlign,
                }}
              >
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, idx) => (
                    <p key={idx} className={isLiteraryIndent ? "article-p" : ""}>
                      {p}
                    </p>
                  ))
                ) : (
                  <div className="py-12 text-center text-text-muted italic text-sm">
                    This chapter has no text content published yet.
                  </div>
                )}
              </article>

              {/* 5. End of Chapter Navigation Block */}
              <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleNavigatePrev}
                  disabled={!chapterData?.navigation?.prev && currentCh <= 1}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-card hover:bg-tag text-text-main font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-border-subtle shadow-xs cursor-pointer disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ch. {chapterData?.navigation?.prev?.chapter_number || currentCh - 1}: Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTocOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-card hover:bg-tag text-text-main font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-border-subtle shadow-xs cursor-pointer"
                >
                  <List className="w-4 h-4" />
                  <span>Table of Contents</span>
                </button>

                <button
                  type="button"
                  onClick={handleNavigateNext}
                  disabled={!chapterData?.navigation?.next && currentCh >= totalChaptersCount}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-accent-text font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-40"
                >
                  <span>Ch. {chapterData?.navigation?.next?.chapter_number || currentCh + 1}: Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 6. Bottom Floating Reader Toolbar */}
      <ReaderFooter
        visible={controlsVisible}
        currentChapter={currentCh}
        totalChapters={totalChaptersCount}
        fontSize={fontSize}
        isDarkMode={isDarkMode}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onProgressChange={handleProgressChange}
        onAdjustFontSize={(delta) => setFontSize((s) => Math.max(14, Math.min(28, s + delta)))}
        onToggleTOC={() => {
          setSettingsOpen(false);
          setTocOpen((v) => !v);
        }}
        onToggleSettings={() => {
          setTocOpen(false);
          setSettingsOpen((v) => !v);
        }}
        onToggleDayNight={handleToggleDayNight}
      />

      {/* 7. Slide-Over Table of Contents Drawer */}
      <ReaderTOCDrawer
        isOpen={tocOpen}
        onClose={() => setTocOpen(false)}
        bookTitle={bookData?.title || slug}
        currentChapterNum={currentCh}
        chapters={tocChapters.map((c) => ({
          number: c.chapter_number,
          title: c.title,
          words: c.words_count ? `${(c.words_count / 1000).toFixed(1)}k` : "Standard",
        }))}
        onSelectChapter={(num) => handleProgressChange(num)}
      />

      {/* 8. Slide-Up Reader Preferences Modal */}
      <ReaderSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        fontFamily={fontFamily}
        onSelectFont={(f) => {
          setFontFamily(f);
          showToast(`Typeface: ${f === "serif" ? "Newsreader" : "Sans-Serif"}`, "text_fields");
        }}
        fontSize={fontSize}
        onSetFontSize={(s) => setFontSize(s)}
        isLiteraryIndent={isLiteraryIndent}
        onToggleIndent={() => setIsLiteraryIndent((v) => !v)}
        textAlign={textAlign}
        onToggleAlign={() => setTextAlign((a) => (a === "justify" ? "left" : "justify"))}
      />
    </div>
  );
}
