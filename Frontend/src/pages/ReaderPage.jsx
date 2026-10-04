import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, List, Touchpad, Bookmark, Check } from "lucide-react";
import ReaderHeader from "../components/reader/ReaderHeader";
import ReaderFooter from "../components/reader/ReaderFooter";
import ReaderSideNav from "../components/reader/ReaderSideNav";
import ReaderTOCDrawer from "../components/reader/ReaderTOCDrawer";
import ReaderSettingsModal from "../components/reader/ReaderSettingsModal";
import ReaderToast from "../components/reader/ReaderToast";
import bookService from "../services/bookService/bookService";
import { DECKLE_THEMES, getActiveTheme, applyTheme } from "../utils/themeConfig";

// Sample chapter directory for TOC
const MOCK_TOC_CHAPTERS = [
  { number: 1, title: "Prologue: The Awakening", words: "3.2k" },
  { number: 2, title: "Chapter 2: First Resonances", words: "3.4k" },
  { number: 3, title: "Chapter 3: The Broken Seal", words: "3.8k" },
  { number: 4, title: "Chapter 4: Across the Threshold", words: "4.1k" },
];

export default function ReaderPage() {
  const { slug = "", chapterNum = "1" } = useParams();
  const navigate = useNavigate();

  const currentCh = parseInt(chapterNum, 10) || 1;
  const totalChapters = 100;

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

  // Live novel data from API
  const [currentNovel, setCurrentNovel] = useState({
    slug: slug,
    title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    author_name: "Deckle Author",
  });

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      bookService
        .getBookBySlug(slug)
        .then((data) => {
          if (isMounted && data) {
            setCurrentNovel({
              slug: data.slug,
              title: data.title,
              author_name: data.author_name || "Deckle Author",
            });
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const showToast = (message, icon = "info") => {
    setToast({ message, icon, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2400);
  };

  // Synchronize Theme with root document and other components
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
  }, [currentCh]);

  const handleNavigatePrev = () => {
    if (currentCh > 1) {
      const prevCh = currentCh - 1;
      navigate(`/book/${slug}/chapter/${prevCh}`);
      showToast(`Navigating to Chapter ${prevCh}`, "arrow_back");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigateNext = () => {
    if (currentCh < totalChapters) {
      const nextCh = currentCh + 1;
      navigate(`/book/${slug}/chapter/${nextCh}`);
      showToast(`Navigating to Chapter ${nextCh}`, "arrow_forward");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("Reached final chapter! Series completed.", "auto_stories");
    }
  };

  const handleProgressChange = (chNum) => {
    navigate(`/book/${slug}/chapter/${chNum}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      showToast(next ? "Book saved to reading shelf" : "Removed from shelf", "bookmark");
      return next;
    });
  };

  const currentThemeObj = DECKLE_THEMES.find((t) => t.id === activeTheme);
  const isDarkMode = currentThemeObj?.isDark ?? false;

  return (
    <div
      data-theme={activeTheme}
      className="relative min-h-screen select-none md:select-auto bg-page text-text-main transition-colors duration-300"
    >
      {/* 1. Top Floating Reader Header */}
      <ReaderHeader
        visible={controlsVisible}
        bookSlug={slug}
        bookTitle={currentNovel.title}
        chapterNum={currentCh}
        chapterVolume="Final Volume"
        progressText="100% Series Climax"
        estReadingTime="~18 min"
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

      {/* 2. Floating Side Arrows (ixdzs .read-pre & .read-next) */}
      <ReaderSideNav
        controlsVisible={controlsVisible}
        canNavigatePrev={currentCh > 1}
        canNavigateNext={currentCh < totalChapters}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
      />

      {/* 3. Toast Notifications */}
      <ReaderToast toast={toast} />

      {/* 4. Main Literary Reading Body */}
      <div
        onClick={(e) => {
          // Toggle controls if clicking reading canvas (outside buttons, inputs, links)
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
              Final Volume • Epilogue
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug">
              Chapter {currentCh}: The Road to Emperor — Character Biographies (Part 2)
            </h1>
            <div className="mt-3 flex items-center justify-center flex-wrap gap-2.5 text-xs text-text-muted font-sans">
              <span>{currentNovel.author_name}</span>
              <span>•</span>
              <span>4,120 Words</span>
              <span>•</span>
              <span>18 min read</span>
              <span>•</span>
              <span className="text-accent font-semibold">Completed Book</span>
            </div>
          </header>

          {/* Subtle Section Divider Ornament */}
          <div className="flex items-center justify-center gap-3 my-8 text-border-subtle">
            <span className="h-px w-16 bg-border-subtle/60" />
            <span className="font-serif text-xl text-accent font-bold">§</span>
            <span className="h-px w-16 bg-border-subtle/60" />
          </div>

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
            {/* Section 06: Medusa */}
            <div className="py-1">
              <h2 className="font-serif text-xl sm:text-2xl italic font-bold text-accent mb-3">
                06. Medusa (Cai Lin) — The Oasis in the Scorched Sands
              </h2>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                Some people once told me that “an oasis will eventually emerge in the desert,” but I know that’s only because they have never stepped foot into the cruel heart of the Tagor Desert.
              </p>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                This is a sovereign domain of endless yellow dust. The boundless dunes roll outward until they touch the sky, making it impossible to fathom where the sands end and the heavens awaken. An old elder once remarked: a single grain of sand is an entire world; and yet within that world, a speck of dust can bring forth an extinction-level calamity. For our Snake-People tribe, existence itself was that eternal calamity.
              </p>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                The desolate desert, majestic and severe, wore the identical emotionless mask as the cruel queen masters who reared me in childhood. Since the dawn of my consciousness, I was taught that sentiment is weakness and compassion is venom. In the deepest memories of my youth, there was only the scorching fury of dawn and the marrow-chilling frost of the desert midnight. We slithered upon rocks, thirsty for blood, guarding against both human conquerors and our own treacherous instincts.
              </p>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                The <strong className="text-accent font-semibold">Azure Lotus Earth Core Flame</strong> was never just a mystical flame; it was the sole pivot upon which the destiny of my entire race spun. Only by plunging my serpentine flesh into the incinerating fury of that Primordial Heavenly Flame—only by enduring the agonizing transformation into the legendary Seven-Colored Sky-Devouring Python—could I forge the strength needed to lead my people out of this wretched wasteland.
              </p>
            </div>

            {/* Context Lore Card */}
            <div className="my-6 p-4 rounded-xl bg-tag/70 border-l-4 border-accent text-sm leading-relaxed border border-border-subtle shadow-xs">
              <span className="font-bold text-text-main block mb-1 font-sans text-xs uppercase tracking-wider">
                Manuscript Lore: The Azure Lotus & Seven-Colored Python
              </span>
              <p className="text-xs text-text-muted">
                Ranked 19th among Heavenly Flames. During the desert ritual transformation, Medusa survived total spiritual combustion to fuse with the ancient Nine-Colored Serpentine God, forever binding her soul matrix with Xiao Yan.
              </p>
            </div>

            <p className={isLiteraryIndent ? "article-p" : ""}>
              I will never forget the youth who broke into my shrine that day. Covered in ash, fragile as a dried reed in the wind, with an absurdly gigantic heavy ruler strapped across his back. His eyes carried an unyielding stubbornness that no Dou Huang would ever dare display before my throne.
            </p>

            {/* Dialogue Blockquote */}
            <blockquote className="my-6 pl-5 py-2 border-l-4 border-accent font-serif text-lg italic text-accent font-medium bg-accent/5 rounded-r-xl">
              “Xiao Yan, remember this well: you belong to me. Every breath in your chest, every step you take on the Emperor’s Road. I will never forget what you did to me in that searing subterranean cavern.”
            </blockquote>

            <p className={isLiteraryIndent ? "article-p" : ""}>
              He called me Queen; he called me Cai Lin. He fought across continents, battered and bloodied, building an empire just to offer our child a cradle beneath a gentle sky. The cruel desert had finally granted me its only true oasis—not of water and palms, but of a quiet, warm hearth.
            </p>

            {/* Asterism Divider */}
            <div className="flex justify-center items-center gap-2 py-6 text-accent/60 text-sm">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>

            {/* Section 07: Ya Fei */}
            <div className="py-1">
              <h2 className="font-serif text-xl sm:text-2xl italic font-bold text-accent mb-3">
                07. Ya Fei — The Silk Merchant of the Jia Ma Empire
              </h2>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                In the Jia Ma Empire, when it comes to the flow of coin and trade, our Mittel family was second to none. Yet money alone has never bought freedom in a realm ruled by Dou Qi monarchs. I was trained to smile, to cajole, to turn men’s greed into financial leverage while maintaining the icy poise of a porcelain sculpture.
              </p>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                Then walked in an awkward boy cloaked in black linen, demanding the auction of basic Foundation Elixirs. Everyone saw a destitute alchemist’s apprentice; I saw the fire that would inevitably set the entire continent ablaze. I made my gamble. Today, the Mittel Auction House spans the boundless Central Plains, but the proudest contract I ever negotiated was trusting the young master of the Xiao Clan when he had nothing to offer but his pride.
              </p>
            </div>

            {/* Asterism Divider */}
            <div className="flex justify-center items-center gap-2 py-6 text-accent/60 text-sm">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>

            {/* Section 08: Little Fairy Doctor */}
            <div className="py-1">
              <h2 className="font-serif text-xl sm:text-2xl italic font-bold text-accent mb-3">
                08. Little Fairy Doctor (Xiao Yi Xian) — The Poison Orchid
              </h2>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                Born with the Woeful Poison Body, I was destined to bring misfortune wherever I walked, and in misfortune I expected to drown. To love is to poison; to embrace is to corrode. That was the eternal decree carved into my spiritual meridian.
              </p>
              <p className={isLiteraryIndent ? "article-p" : ""}>
                Yet, in the quiet hills of the Magic Beast Mountain Range, someone roasted fish for me over an open hearth without asking what venom coursed through my veins. Meeting Xiao Yan in this life was like waking into an incandescent, tranquil dream. Even when the entire world fled from my poisonous aura, his palm remained outstretched, warm and unyielding. The Emperor’s road is endless and lonely, but looking out across the mountain pass today, the wind smells of sweet herbal tea.
              </p>
            </div>
          </article>

          {/* 5. End of Chapter Block (ixdzs classic turners) */}
          <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleNavigatePrev}
              disabled={currentCh <= 1}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-card hover:bg-tag text-text-main font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-border-subtle shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ch. {currentCh - 1}: Biographies (Pt 1)</span>
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-accent-text font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>The Great Ruler (Next Novel)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Bottom Floating Reader Toolbar (ixdzs .read-opt-footer) */}
      <ReaderFooter
        visible={controlsVisible}
        currentChapter={currentCh}
        totalChapters={totalChapters}
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
        bookTitle={currentNovel.title}
        currentChapterNum={currentCh}
        chapters={MOCK_TOC_CHAPTERS}
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
