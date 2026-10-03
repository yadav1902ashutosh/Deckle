import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Flame,
  Award,
  Users,
  Sparkles,
  TrendingUp,
  Share2,
  Heart,
  Send,
} from "lucide-react";

const FORUM_THREADS = [
  {
    id: 1,
    book: "Battle Through the Heavens",
    bookSlug: "battle-through-the-heavens",
    title: "Who was Xiao Yan's greatest mentor: Yao Lao or his own stubborn dao heart?",
    author: "GrandmasterVance",
    authorTier: "Tier 8 Elder",
    replies: 142,
    upvotes: 498,
    time: "2 hours ago",
    tags: ["Character Analysis", "Dao Debate"],
    snippet: "Looking back at the entire 1663 chapters, Yao Lao gave him the Heavenly Flame technique, but Xiao Yan's refusal to surrender at the Misty Cloud Sect was what actually shaped him...",
  },
  {
    id: 2,
    book: "Lord of the Mysteries",
    bookSlug: "lord-of-the-mysteries",
    title: "The Fool's Tarot Club: Ranking the Tarot Card holders by pure danger quotient",
    author: "MoonlightScholar",
    authorTier: "Tier 6 Scholar",
    replies: 89,
    upvotes: 312,
    time: "4 hours ago",
    tags: ["Tarot Club", "Power Scaling"],
    snippet: "Miss Justice grows into an terrifying spectator, but The World's unhinged sequence 3 marionette mechanics are unmatched in psychological dread...",
  },
  {
    id: 3,
    book: "How Did I Become Invincible?",
    slug: "how-did-i-become-invincible",
    title: "Top 5 funniest inverted cheat encounters in Volume 4",
    author: "DaoistPotato",
    authorTier: "Tier 5 Reader",
    replies: 56,
    upvotes: 184,
    time: "Yesterday",
    tags: ["Comedy", "Volume 4"],
    snippet: "When the sect master used the Nine Heavens Heavenly Thunder formation thinking he was executing Lin Fan, but only ended up giving him a free rank jump...",
  },
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [upvotes, setUpvotes] = useState({});

  const handleUpvote = (id) => {
    setUpvotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Full-Width Expansive Container (Matching Home Page) */}
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
              onClick={() => alert("New Discourse Thread dialog opened")}
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start Discourse</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["All Discussions", "Theory Crafting", "Power Rankings", "Dao Debates", "Fan Translations"].map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat.toLowerCase())}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                i === 0
                  ? "bg-accent text-white shadow-xs"
                  : "bg-tag hover:bg-card text-text-muted hover:text-text-main"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 12-Column Layout (Matching Home Page) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: Thread Feed (8 Columns) ================= */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            {FORUM_THREADS.map((thread) => {
              const currentVotes = thread.upvotes + (upvotes[thread.id] || 0);
              return (
                <article
                  key={thread.id}
                  className="bg-card/75 hover:bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-accent">{thread.book}</span>
                      <span>•</span>
                      <span>By {thread.author}</span>
                      <span className="px-1.5 py-0.2 rounded bg-tag text-[10px] font-medium text-text-muted">
                        {thread.authorTier}
                      </span>
                    </div>
                    <span>{thread.time}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-text-main group-hover:text-accent transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">
                      {thread.snippet}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30 text-xs">
                    <div className="flex items-center gap-1.5">
                      {thread.tags.map((t, tidx) => (
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
                        <span>{currentVotes}</span>
                      </button>

                      <div className="flex items-center gap-1 text-text-muted">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{thread.replies}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
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
                {[
                  { name: "GrandmasterVance", tier: "Tier 8 Elder", karma: "14,820", rank: 1 },
                  { name: "MoonlightScholar", tier: "Tier 6 Scholar", karma: "9,420", rank: 2 },
                  { name: "DaoistPotato", tier: "Tier 5 Reader", karma: "6,810", rank: 3 },
                  { name: "CelestialInk", tier: "Tier 5 Reader", karma: "4,210", rank: 4 },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-tag/50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-[10px]">
                        {s.rank}
                      </span>
                      <span className="font-medium text-text-main">{s.name}</span>
                    </div>
                    <span className="font-mono text-accent font-semibold">{s.karma} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discourse Rules */}
            <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 shadow-xs flex flex-col gap-2 text-xs text-text-muted">
              <div className="flex items-center gap-1.5 font-semibold text-text-main">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Sanctum Etiquette</span>
              </div>
              <p className="leading-relaxed">
                Tag spoilers with spoiler tags, respect opposing cultivation theories, and cite chapter numbers whenever comparing power feats.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
