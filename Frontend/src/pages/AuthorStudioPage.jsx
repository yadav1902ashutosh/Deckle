import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
  Upload,
  X,
  Camera,
  Layers,
  Users,
} from "lucide-react";
import ImageFramingModal from "../components/common/ImageFramingModal";
import PersonasHubTab from "../components/profile/PersonasHubTab";
import bookService from "../services/bookService/bookService";

export default function AuthorStudioPage() {
  const activePersona = useSelector((state) => state.auth?.activePersona);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "desk";
  const [activeTab, setActiveTab] = useState(initialTab); // desk | editor | customization | analytics
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["desk", "editor", "customization", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const alertToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  const [draftTitle, setDraftTitle] = useState("Chapter 43: The Pill Tribulation Cloud");
  const [draftContent, setDraftContent] = useState(
    "Deep inside the alchemist chamber, the medicinal pill hummed with violent azure energy. Xiao Yan wiped the perspiration from his brow, his soul perception extended outward like invisible silk threads..."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("All changes saved");

  // New Novel Modal State
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [newBookLoading, setNewBookLoading] = useState(false);
  const [newBookError, setNewBookError] = useState("");
  const [newBookData, setNewBookData] = useState({
    title: "",
    slug: "",
    genre: "Epic Fantasy",
    description: "",
    cover_image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
  });

  // Cover Framing Modal State
  const [isCoverFramingOpen, setIsCoverFramingOpen] = useState(false);
  const [framingSrc, setFramingSrc] = useState(null);

  const wordCount = draftContent.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedStatus("Saved to cloud 10:45 PM");
    }, 600);
  };

  const handlePickCoverFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFramingSrc(event.target.result);
          setIsCoverFramingOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCoverFramingConfirm = (croppedUrl) => {
    setNewBookData((prev) => ({ ...prev, cover_image: croppedUrl }));
  };

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    const autoSlug = titleVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setNewBookData((prev) => ({
      ...prev,
      title: titleVal,
      slug: autoSlug,
    }));
  };

  const handlePublishNewNovel = async (e) => {
    e.preventDefault();
    setNewBookError("");

    if (!activePersona?.id) {
      setNewBookError("Active pen name required. Switch persona or create one in profile.");
      return;
    }

    if (!newBookData.title.trim() || !newBookData.slug.trim()) {
      setNewBookError("Title and slug are required.");
      return;
    }

    setNewBookLoading(true);
    try {
      await bookService.createBook({
        title: newBookData.title.trim(),
        slug: newBookData.slug.trim(),
        description: newBookData.description.trim(),
        cover_image: newBookData.cover_image,
        persona_id: activePersona.id,
        status: "ongoing",
        tags: [newBookData.genre],
      });
      setIsNewBookModalOpen(false);
      alert(`Novel "${newBookData.title}" published successfully!`);
    } catch (err) {
      console.error(err);
      setNewBookError(err.message || "Failed to publish novel.");
    } finally {
      setNewBookLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Full-Width Expansive Container (Matching Home Page) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 flex flex-col gap-6">
        {/* Author Desk Header */}
        <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase">
              <PenTool className="w-4 h-4" />
              <span>
                Creator Sanctuary • {activePersona ? `@${activePersona.handle}` : "Manuscript Desk"}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-main">
              Master Scribe Workshop
            </h1>

            <p className="text-xs sm:text-sm text-text-muted">
              Serialize your works, schedule upcoming chapter releases, and analyze reader engagement.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsNewBookModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Serial</span>
            </button>

            <button
              onClick={() => setActiveTab("editor")}
              className="px-4 py-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
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
        <div className="flex items-center gap-2 border-b border-border-subtle/30 pb-1 overflow-x-auto no-scrollbar">
          {[
            { id: "desk", label: "Published Serials & Drafts", icon: BookOpen },
            { id: "editor", label: "Manuscript Canvas", icon: FileText },
            { id: "customization", label: "Channel Customization & Pen Names", icon: Users },
            { id: "analytics", label: "Serial Metrics", icon: BarChart2 },
          ].map((t) => {
            const IconC = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSearchParams({ tab: t.id });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-accent border border-border-subtle/50 shadow-2xs font-bold"
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
                    className="px-3 py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
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
                  className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
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

        {/* Tab 3: Channel Customization & Pen Names Hub */}
        {activeTab === "customization" && (
          <PersonasHubTab onToast={(msg) => alertToast(msg)} />
        )}

        {/* Tab 4: Analytics */}
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

      {/* ============================================================== */}
      {/* LAUNCH NEW SERIAL MODAL (WITH NOVEL COVER FRAMING)              */}
      {/* ============================================================== */}
      {isNewBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-subtle/50 bg-tag/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-text-main">
                  Launch New Serial Work
                </h3>
              </div>
              <button
                onClick={() => setIsNewBookModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishNewNovel} className="p-6 overflow-y-auto space-y-4 text-xs">
              {newBookError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  {newBookError}
                </div>
              )}

              {/* Cover Art Upload with 2:3 Framing */}
              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Novel Cover Art (2:3 Aspect Ratio)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-border-subtle shadow-md bg-tag shrink-0">
                    <img
                      src={newBookData.cover_image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handlePickCoverFile}
                      className="px-3.5 py-2 bg-accent text-accent-text rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload &amp; Frame Cover</span>
                    </button>
                    <p className="text-[11px] text-text-muted">
                      Deckle's cropper lets you verify safe title boundaries for catalog cards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-text-main mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. The Way of the Sunken Citadel"
                  value={newBookData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold text-text-main mb-1">Novel URL Slug</label>
                <input
                  type="text"
                  placeholder="way-of-the-sunken-citadel"
                  value={newBookData.slug}
                  onChange={(e) => setNewBookData({ ...newBookData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-mono text-xs focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Subgenre */}
              <div>
                <label className="block font-semibold text-text-main mb-1">Primary Subgenre</label>
                <select
                  value={newBookData.genre}
                  onChange={(e) => setNewBookData({ ...newBookData, genre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                >
                  <option value="Epic Fantasy">Epic Fantasy</option>
                  <option value="Progression Fantasy">Progression Fantasy</option>
                  <option value="LitRPG">LitRPG &amp; GameLit</option>
                  <option value="Urban Fantasy">Urban Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Dark Fantasy">Dark Fantasy</option>
                  <option value="Romantasy">Romantasy</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-text-main mb-1">Synopsis</label>
                <textarea
                  rows={3}
                  placeholder="Hook readers with your novel premise..."
                  value={newBookData.description}
                  onChange={(e) => setNewBookData({ ...newBookData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-border-subtle/40 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newBookLoading}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {newBookLoading ? "Launching..." : "Publish to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Cover Framing Modal */}
      <ImageFramingModal
        isOpen={isCoverFramingOpen}
        onClose={() => setIsCoverFramingOpen(false)}
        onConfirm={handleCoverFramingConfirm}
        imageSrc={framingSrc}
        type="cover"
      />
    </div>
  );
}
