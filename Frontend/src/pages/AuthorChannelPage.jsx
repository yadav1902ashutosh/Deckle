import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  User,
  Users,
  BookOpen,
  Star,
  Calendar,
  Share2,
  PenTool,
  Bell,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Play,
  Globe,
  AlertCircle,
  Home,
} from "lucide-react";
import BookCard from "../components/books/BookCard";
import AuthorAvatar from "../components/common/AuthorAvatar";
import { AuthorChannelSkeleton } from "../components/common/Skeletons";
import personaService from "../services/personaService/personaService";

export default function AuthorChannelPage() {
  const { handle } = useParams();
  const cleanHandle = (handle || "").replace(/^@/, "").toLowerCase().trim();

  const activePersona = useSelector((state) => state.auth?.activePersona);
  const personas = useSelector((state) => state.auth?.personas) || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelData, setChannelData] = useState(null); // { persona, books }

  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'works' | 'community' | 'about'
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  // Fetch author channel profile directly from backend
  useEffect(() => {
    let isMounted = true;

    async function fetchAuthorProfile() {
      if (!cleanHandle) {
        setError("Invalid author handle");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await personaService.getPublicPersonaProfile(cleanHandle);
        if (isMounted) {
          setChannelData(data);
          // Set initial follower count (or random engagement seed)
          setFollowersCount(data?.persona?.followers_count || 120);
        }
      } catch (err) {
        console.error("Error fetching author channel:", err);
        if (isMounted) {
          setError(err.message || "Author channel not found.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAuthorProfile();

    return () => {
      isMounted = false;
    };
  }, [cleanHandle]);

  // Fetch live announcements for community tab
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    let isMounted = true;
    if (cleanHandle) {
      import("../services/studioService/studioService").then(({ default: studioService }) => {
        studioService
          .getAnnouncements(cleanHandle)
          .then((data) => {
            if (isMounted) setAnnouncements(Array.isArray(data) ? data : []);
          })
          .catch(() => {});
      });
    }
    return () => {
      isMounted = false;
    };
  }, [cleanHandle]);

  // Check if logged-in user owns this author channel
  const isOwner = useMemo(() => {
    if (!cleanHandle) return false;
    if (activePersona?.handle?.toLowerCase() === cleanHandle) return true;
    return personas.some((p) => p.handle?.toLowerCase() === cleanHandle);
  }, [cleanHandle, activePersona, personas]);

  const handleToggleFollow = async () => {
    if (!channelData?.persona?.id) return;
    const { default: studioService } = await import("../services/studioService/studioService");

    try {
      const res = await studioService.toggleSubscription(channelData.persona.id);
      setIsFollowing(res.isSubscribed);
      setFollowersCount(res.subscriber_count);
      showToast(
        res.isSubscribed
          ? `Subscribed to @${cleanHandle}! You will receive release notifications.`
          : `Unsubscribed from @${cleanHandle}`
      );
    } catch (err) {
      showToast(err.message || "Failed to update channel subscription");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Author channel link copied to clipboard!");
  };

  if (loading) {
    return <AuthorChannelSkeleton />;
  }

  if (error || !channelData?.persona) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-tag flex items-center justify-center text-text-muted">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text-main">
          Author Channel Not Found
        </h2>
        <p className="text-text-muted text-sm max-w-md">
          {error || `No pen name or author exists with handle @${cleanHandle}.`}
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-tag border border-border-subtle text-text-main text-xs font-semibold hover:bg-card transition-colors"
          >
            My Pen Names
          </Link>
        </div>
      </div>
    );
  }

  const { persona, books = [] } = channelData;
  const authorName = persona.display_name || "Author";
  const authorBio = persona.bio || "Author of serialized speculative fiction on Deckle.";
  const authorAvatar =
    persona.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(persona.handle)}`;
  const authorBanner =
    persona.banner_url ||
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600";
  const joinedDate = persona.created_at
    ? new Date(persona.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "October 2026";

  const featuredBook = books.length > 0 ? books[0] : null;

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. CINEMATIC CHANNEL ART / BANNER (YOUTUBE STYLE)              */}
      {/* ============================================================== */}
      <div className="w-full h-44 sm:h-64 lg:h-72 relative overflow-hidden bg-card border-b border-border-subtle/40">
        <img
          src={authorBanner}
          alt={`${authorName} channel banner`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-page/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 2. CHANNEL PROFILE DOSSIER (HEADER SAFELY BELOW BANNER)        */}
      {/* ============================================================== */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 pt-4 sm:pt-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border-subtle/40">
          {/* Avatar & Author Info */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
            {/* Avatar elevates into the banner while text stays cleanly below */}
            <div className="relative shrink-0 -mt-16 sm:-mt-20 lg:-mt-24">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-card border-4 border-page shadow-2xl ring-2 ring-border-subtle/60">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(persona.handle)}`;
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1 sm:pt-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
                  {authorName}
                </h1>
                <span className="text-[11px] uppercase font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                  Verified Author
                </span>
              </div>

              {/* Handle & Channel Stats - 100% cleanly below banner */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="font-mono font-semibold text-text-main">
                  @{persona.handle}
                </span>
                <span>•</span>
                <span>{followersCount.toLocaleString()} Subscribers</span>
                <span>•</span>
                <span>
                  {books.length} Serial {books.length === 1 ? "Work" : "Works"}
                </span>
              </div>

              {/* Bio summary */}
              <p className="text-xs sm:text-sm text-text-muted max-w-2xl line-clamp-2 leading-relaxed pt-1">
                {authorBio}
              </p>
            </div>
          </div>

          {/* Action Buttons (Subscribe, Studio, Share) */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {isOwner ? (
              <>
                <Link
                  to="/studio"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-xs transition-colors"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Author Studio</span>
                </Link>
                <Link
                  to="/studio?tab=customization"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>Customize Channel</span>
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  isFollowing
                    ? "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
                    : "bg-accent hover:bg-accent-hover text-accent-text"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Bell className="w-3.5 h-3.5 fill-current" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-muted hover:text-text-main transition-colors cursor-pointer"
              title="Share Author Page"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CHANNEL TABS (HOME, WORKS, COMMUNITY, ABOUT)                */}
        {/* ============================================================== */}
        <div className="flex items-center gap-6 border-b border-border-subtle/40 pt-1">
          {[
            { id: "home", label: "Home" },
            { id: "works", label: `Works (${books.length})` },
            { id: "community", label: "Community" },
            { id: "about", label: "About" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer ${
                  isActive
                    ? "text-accent font-bold"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 4. TAB CONTENT PANELS                                          */}
        {/* ============================================================== */}
        <div className="py-8">
          {/* TAB 1: HOME (FEATURED SPOTLIGHT + SHELVES) */}
          {activeTab === "home" && (
            <div className="space-y-10 animate-fadeIn">
              {/* Featured Series Spotlight Banner */}
              {featuredBook ? (
                <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start gap-6 md:gap-8">
                  <div className="w-44 sm:w-52 h-64 sm:h-76 rounded-xl overflow-hidden shadow-lg border border-border-subtle shrink-0">
                    <img
                      src={featuredBook.cover_image}
                      alt={featuredBook.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600";
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                        Featured Series
                      </span>
                      <span className="text-xs text-text-muted capitalize">
                        • {featuredBook.status || "Ongoing"}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-main">
                      {featuredBook.title}
                    </h2>

                    <div className="flex items-center gap-4 text-xs text-text-muted py-1">
                      <span className="flex items-center gap-1 font-bold text-text-main">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        {featuredBook.rating || "4.9"}
                      </span>
                      <span>{featuredBook.views_count ? `${featuredBook.views_count} Views` : "Active Serial"}</span>
                      <span className="capitalize">{featuredBook.status}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                      {featuredBook.description || "No synopsis available."}
                    </p>

                    <div className="pt-3 flex items-center gap-3">
                      <Link
                        to={`/book/${featuredBook.slug}/chapter/1`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Reading</span>
                      </Link>

                      <Link
                        to={`/book/${featuredBook.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-card rounded-2xl border border-border-subtle space-y-3">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="text-xs text-text-muted">
                    This author hasn't designated a featured serial yet.
                  </p>
                </div>
              )}

              {/* All Published Serials Shelf */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-text-main">
                    All Published Serials
                  </h3>
                  {books.length > 0 && (
                    <button
                      onClick={() => setActiveTab("works")}
                      className="text-xs text-accent font-semibold hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  )}
                </div>

                {books.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-card rounded-2xl border border-border-subtle text-xs text-text-muted">
                    No books published under @{persona.handle} yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WORKS / RELEASES */}
          {activeTab === "works" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">
                  Showing {books.length} serialized {books.length === 1 ? "work" : "works"} published by @{persona.handle}
                </p>
              </div>

              {books.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-card rounded-2xl border border-border-subtle space-y-3">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
                  <h4 className="font-serif text-base font-semibold text-text-main">
                    No Published Works Yet
                  </h4>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    This author persona hasn't launched a serial yet. When novel chapters are published in Author Studio, they appear here.
                  </p>
                  {isOwner && (
                    <Link
                      to="/studio"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-text text-xs font-semibold rounded-xl shadow-xs mt-2"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Create Story in Studio</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY ANNOUNCEMENTS (YOUTUBE COMMUNITY TAB) */}
          {activeTab === "community" && (
            <div className="max-w-3xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-serif text-base font-bold text-text-main">
                  Author Updates &amp; Announcements
                </h3>
              </div>
              <div className="space-y-4">
                {(announcements.length > 0 ? announcements : [
                  {
                    id: "default",
                    title: "Welcome to my Official Channel",
                    content: "Welcome to my official Deckle channel! Follow for upcoming chapter drops, worldbuilding lore, and reader polls.",
                    created_at: new Date().toISOString(),
                  }
                ]).map((ann) => (
                  <div key={ann.id} className="bg-card border border-border-subtle/60 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-3">
                      <AuthorAvatar
                        name={authorName}
                        avatar={authorAvatar}
                        handle={persona.handle}
                        size="md"
                      />
                      <div>
                        <div className="font-semibold text-xs text-text-main">
                          {authorName}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {ann.title || "Official Channel Broadcast"}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-text-main leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="pt-2 border-t border-border-subtle/30 flex items-center gap-4 text-xs text-text-muted">
                      <button
                        type="button"
                        onClick={() => showToast("Liked announcement")}
                        className="flex items-center gap-1.5 hover:text-accent transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Like</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast("Opening discussions...")}
                        className="flex items-center gap-1.5 hover:text-text-main transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discussion</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
              {/* Detailed Bio (2 Cols) */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs space-y-3">
                  <h3 className="font-serif text-base font-bold text-text-main">
                    About {authorName}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                    {authorBio}
                  </p>
                </div>
              </div>

              {/* Stats & Metadata (1 Col) */}
              <div className="space-y-4">
                <div className="bg-card border border-border-subtle/60 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
                  <h4 className="font-serif font-bold text-text-main text-sm">
                    Channel Stats
                  </h4>
                  <div className="space-y-3 divide-y divide-border-subtle/30">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-text-muted flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        Joined Deckle
                      </span>
                      <span className="font-semibold text-text-main">
                        {joinedDate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-text-muted flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        Subscribers
                      </span>
                      <span className="font-semibold text-text-main">
                        {followersCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-text-muted flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-accent" />
                        Published Titles
                      </span>
                      <span className="font-semibold text-text-main">
                        {books.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-text-muted flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-accent" />
                        Channel URL
                      </span>
                      <span className="font-mono text-accent">
                        /author/@{persona.handle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
