import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PenTool,
  BookOpen,
  Calendar,
  BarChart2,
  Plus,
  Save,
  Clock,
  Sparkles,
  CheckCircle,
  FileText,
  Eye,
} from "lucide-react";

export default function AuthorStudioPage() {
  const [activeTab, setActiveTab] = useState("desk"); // desk | editor | analytics
  const [draftTitle, setDraftTitle] = useState("Chapter 43: The Pill Tribulation Cloud");
  const [draftContent, setDraftContent] = useState(
    "Deep inside the alchemist chamber, the medicinal pill hummed with violent azure energy. Xiao Yan wiped the perspiration from his brow, his soul perception extended outward like invisible silk threads..."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("All changes saved");

  const wordCount = draftContent.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedStatus("Saved to cloud 10:45 PM");
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Full-Width Expansive Container (Matching Home Page) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 flex flex-col gap-6">
        
        {/* Author Desk Header */}
        <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase">
              <PenTool className="w-4 h-4" />
              <span>Creator Sanctuary • Manuscript Desk</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-main">
              Master Scribe Workshop
            </h1>

            <p className="text-xs sm:text-sm text-text-muted">
              Serialize your works, schedule upcoming chapter releases, and analyze reader engagement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("editor")}
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Chapter Draft</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Serials", val: "2 Novels", sub: "1 Completed, 1 Ongoing" },
            { label: "Total Manuscript Words", val: "840,200", sub: "+12,400 this week" },
            { label: "Power Stones Received", val: "14,820", sub: "#4 Weekly Ranking" },
            { label: "Reader Retention", val: "84.2%", sub: "Top 5% on Deckle" },
          ].map((m, i) => (
            <div
              key={i}
              className="bg-card/75 border border-border-subtle/50 rounded-xl p-4 flex flex-col gap-1 shadow-2xs"
            >
              <span className="text-xs text-text-muted font-medium">{m.label}</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-accent">{m.val}</span>
              <span className="text-[11px] text-text-muted">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border-subtle/30 pb-1">
          {[
            { id: "desk", label: "Published Serials & Drafts", icon: BookOpen },
            { id: "editor", label: "Manuscript Canvas", icon: FileText },
            { id: "analytics", label: "Serial Metrics", icon: BarChart2 },
          ].map((t) => {
            const IconC = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-accent border border-border-subtle/50 shadow-2xs"
                    : "text-text-muted hover:text-text-main hover:bg-tag/50"
                }`}
              >
                <IconC className="w-4 h-4 text-accent" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Serials & Drafts */}
        {activeTab === "desk" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {[
              {
                title: "Battle Through the Heavens",
                chaptersCount: 1663,
                wordsCount: "4.8M words",
                status: "Completed",
                views: "1.9M views",
                lastUpdate: "Yesterday",
              },
              {
                title: "Path of the Celestial Forge",
                chaptersCount: 42,
                wordsCount: "128k words",
                status: "Ongoing",
                views: "48.2k views",
                lastUpdate: "3 hours ago",
              },
            ].map((novel, idx) => (
              <div
                key={idx}
                className="bg-card/75 border border-border-subtle/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-text-main">{novel.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-tag text-text-muted text-[11px] font-semibold">
                      {novel.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    {novel.chaptersCount} Chapters • {novel.wordsCount} • {novel.views} • Updated {novel.lastUpdate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className="px-3 py-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-xs font-medium text-text-main transition-colors cursor-pointer"
                  >
                    Draft Chapter
                  </button>
                  <Link
                    to={`/book/battle-through-the-heavens`}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
                  >
                    Public View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Manuscript Editor Canvas */}
        {activeTab === "editor" && (
          <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
            {/* Editor Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" /> {savedStatus}
                </span>
                <span className="text-xs text-text-muted">Words: <strong className="text-text-main">{wordCount}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-xl bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-accent" />
                  <span>{isSaving ? "Saving..." : "Save Draft"}</span>
                </button>

                <button
                  onClick={() => alert("Chapter scheduled for publication!")}
                  className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Publish Release</span>
                </button>
              </div>
            </div>

            {/* Chapter Title Input */}
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Chapter Title..."
              className="w-full text-xl sm:text-2xl font-serif font-bold text-text-main bg-transparent focus:outline-none border-b border-border-subtle/30 pb-2"
            />

            {/* Manuscript Textarea */}
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={12}
              placeholder="Begin typing your chapter..."
              className="w-full bg-tag/40 border border-border-subtle/30 rounded-xl p-4 font-serif text-base text-text-main leading-relaxed focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === "analytics" && (
          <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
            <h3 className="font-serif text-lg font-semibold text-text-main">
              Reader Progression &amp; Retention Funnel
            </h3>
            <p className="text-xs text-text-muted">
              Chapter-by-chapter reader drop-off analysis and peak reading hours.
            </p>
            <div className="h-48 w-full bg-tag/50 rounded-xl flex items-center justify-center text-xs text-text-muted border border-border-subtle/40">
              Interactive 30-Day Retention Curve Chart
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
