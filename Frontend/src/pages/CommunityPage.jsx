import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Award,
  Users,
  Sparkles,
  Heart,
  Plus,
  X,
} from "lucide-react";
import communityService from "../services/communityService/communityService";
import AuthorAvatar from "../components/common/AuthorAvatar";
import { useSelector } from "react-redux";

export default function CommunityPage() {
  const [threads, setThreads] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("theory");
  const [newTags, setNewTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { status: isLoggedIn } = useSelector((state) => state.auth);

  const fetchDiscourse = async (cat = "all") => {
    try {
      setLoading(true);
      const [threadsData, scholarsData] = await Promise.all([
        communityService.getThreads({ category: cat }),
        communityService.getTopScholars().catch(() => []),
      ]);
      setThreads(Array.isArray(threadsData) ? threadsData : []);
      setScholars(Array.isArray(scholarsData) ? scholarsData : []);
    } catch (err) {
      console.error("Failed to load community agora:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscourse(activeCategory);
  }, [activeCategory]);

  const handleUpvote = async (id) => {
    try {
      const res = await communityService.upvoteThread(id);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, upvotes: res.upvotes_count } : t
        )
      );
    } catch (err) {
      alert(err.message || "Please sign in to upvote discussions");
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setSubmitting(true);
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await communityService.createThread({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: tagsArray,
      });

      setIsDialogOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      fetchDiscourse(activeCategory);
    } catch (err) {
      alert(err.message || "Failed to publish discourse");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Full-Width Expansive Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 flex flex-col gap-6">
        
        {/* Header Hero Banner */}
        <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl z-10">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase">
              <Users className="w-4 h-4" />
              <span>Reader Sanctum • Community Agora</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-text-main tracking-tight">
              Scholars &amp; Daoist Discourse
            </h1>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Unpack complex cultivation systems, dissect plot foreshadowing, vote for weekly power rankings, and engage with serialized fiction enthusiasts worldwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  alert("Please sign in to participate in reader discussions.");
                  return;
                }
                setIsDialogOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Discourse</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "All Discussions" },
            { id: "theory", label: "Theory Crafting" },
            { id: "rankings", label: "Power Rankings" },
            { id: "dao", label: "Dao Debates" },
            { id: "translations", label: "Fan Translations" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-accent text-white shadow-xs"
                  : "bg-tag hover:bg-card text-text-muted hover:text-text-main"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: Thread Feed (8 Columns) ================= */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40">
                Loading community threads...
              </div>
            ) : threads.length > 0 ? (
              threads.map((thread) => (
                <article
                  key={thread.id}
                  className="bg-card/75 hover:bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      {thread.book && (
                        <>
                          <span className="font-semibold text-accent">{thread.book}</span>
                          <span>•</span>
                        </>
                      )}
                      <div className="flex items-center gap-1.5">
                        <AuthorAvatar
                          name={thread.author || "Reader"}
                          avatar={thread.authorAvatar || thread.author_avatar}
                          handle={thread.authorHandle}
                          size="xs"
                        />
                        <span>By {thread.author || "Reader"}</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-tag text-[10px] font-medium text-text-muted">
                        {thread.authorTier || "Tier 5 Scholar"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-text-main group-hover:text-accent transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">
                      {thread.snippet || thread.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30 text-xs">
                    <div className="flex items-center gap-1.5">
                      {Array.isArray(thread.tags) &&
                        thread.tags.map((t, tidx) => (
                          <span key={tidx} className="px-2 py-0.5 rounded-md bg-tag text-text-muted text-[11px]">
                            #{t}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpvote(thread.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tag hover:bg-card text-text-muted hover:text-accent font-semibold transition-colors cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-accent" />
                        <span>{thread.upvotes || 0}</span>
                      </button>

                      <div className="flex items-center gap-1 text-text-muted">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{thread.replies || 0}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-16 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40 space-y-3">
                <p>No active discussions found under this category.</p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold cursor-pointer"
                >
                  Start First Discourse
                </button>
              </div>
            )}
          </div>

          {/* ================= RIGHT: Community Sidebar (4 Columns) ================= */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Top Scholars Widget */}
            <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-base font-semibold text-text-main">
                    Top Scribes &amp; Scholars
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-accent">Weekly</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                {scholars.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-tag/50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px]">
                        {s.rank || idx + 1}
                      </span>
                      <span className="font-medium text-text-main">{s.name}</span>
                    </div>
                    <span className="font-mono text-accent font-semibold">{s.karma}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sanctum Etiquette */}
            <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 shadow-xs flex flex-col gap-2 text-xs text-text-muted">
              <div className="flex items-center gap-1.5 font-semibold text-text-main">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Sanctum Etiquette</span>
              </div>
              <p className="leading-relaxed">
                Tag spoilers with spoiler tags, respect opposing cultivation theories, and cite chapter numbers whenever comparing feats.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Start Discourse Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border-subtle/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/30">
              <h3 className="font-serif text-lg font-semibold text-text-main">
                Initiate Discourse
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-text-muted hover:text-text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Dissecting the Sequence 4 potion transformation..."
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                >
                  <option value="theory">Theory Crafting</option>
                  <option value="rankings">Power Rankings</option>
                  <option value="dao">Dao Debates</option>
                  <option value="translations">Fan Translations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Discourse Body
                </label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Elaborate your observations, cite chapters, and open discussion..."
                  className="w-full p-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Cultivation, Character Analysis, Volume 2"
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tag text-xs font-semibold text-text-muted hover:text-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Thread"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
