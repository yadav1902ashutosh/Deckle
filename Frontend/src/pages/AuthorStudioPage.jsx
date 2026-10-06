import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setActivePersona } from "../store/authSlice";
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
  Edit3,
  Trash2,
  FolderPlus,
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import ImageFramingModal from "../components/common/ImageFramingModal";
import PersonasHubTab from "../components/profile/PersonasHubTab";
import StoryEditor from "../components/studio/StoryEditor";
import AuthorAvatar from "../components/common/AuthorAvatar";
import bookService from "../services/bookService/bookService";
import studioService from "../services/studioService/studioService";

export default function AuthorStudioPage() {
  const dispatch = useDispatch();
  const activePersona = useSelector((state) => state.auth?.activePersona);
  const personas = useSelector((state) => state.auth?.personas);
  const [personaPickerOpen, setPersonaPickerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "desk";
  const [activeTab, setActiveTab] = useState(initialTab); // desk | editor | customization | analytics
  const [toastMsg, setToastMsg] = useState("");

  const [serials, setSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(true);

  // Chapters & Volumes Management State
  const [selectedBookId, setSelectedBookId] = useState(
    searchParams.get("bookId") ? Number(searchParams.get("bookId")) : ""
  );
  const [bookChapters, setBookChapters] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chapterFilter, setChapterFilter] = useState("all"); // 'all' | 'draft' | 'scheduled' | 'published'

  // Editor states
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [draftChapterNum, setDraftChapterNum] = useState(1);
  const [chapterType, setChapterType] = useState("regular"); // 'regular' | 'side_story' | 'extra' | 'interlude' | 'special' | 'prologue' | 'epilogue'
  const [chapterLabel, setChapterLabel] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [selectedVolumeId, setSelectedVolumeId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState("Ready");

  // Volume Modal State
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [volumeTitle, setVolumeTitle] = useState("");
  const [volumeDescription, setVolumeDescription] = useState("");
  const [creatingVolume, setCreatingVolume] = useState(false);

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

  const alertToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2800);
  };

  const fetchSerials = async (preferredBookId = null) => {
    try {
      setLoadingSerials(true);
      const data = await studioService.getMySerials();
      const list = Array.isArray(data) ? data : [];
      setSerials(list);

      // Auto-resolve selected novel
      const candidateId = preferredBookId || selectedBookId || searchParams.get("bookId");
      const matched = list.find((b) => String(b.id) === String(candidateId));

      if (matched) {
        setSelectedBookId(matched.id);
      } else if (list.length > 0) {
        setSelectedBookId(list[0].id);
      } else {
        setSelectedBookId("");
      }
    } catch (err) {
      console.warn("Failed to fetch author serials:", err);
    } finally {
      setLoadingSerials(false);
    }
  };

  useEffect(() => {
    fetchSerials();
  }, [activePersona?.id]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["desk", "editor", "customization", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const bookIdParam = searchParams.get("bookId");
    if (bookIdParam) {
      setSelectedBookId(Number(bookIdParam));
    }
  }, [searchParams]);

  // Fetch chapters & volumes whenever selected book changes
  const fetchChaptersAndVolumes = async (bookId) => {
    if (!bookId) return;
    try {
      setLoadingChapters(true);
      const [chaptersData, volumesData] = await Promise.all([
        studioService.getBookChapters(bookId),
        studioService.getVolumes(bookId),
      ]);
      setBookChapters(Array.isArray(chaptersData) ? chaptersData : []);
      setVolumes(Array.isArray(volumesData) ? volumesData : []);
    } catch (err) {
      console.warn("Failed to fetch book chapters or volumes:", err);
    } finally {
      setLoadingChapters(false);
    }
  };

  useEffect(() => {
    if (selectedBookId) {
      fetchChaptersAndVolumes(selectedBookId);
    }
  }, [selectedBookId]);

  // Auto-calculate next consecutive chapter number when starting fresh draft (canon chapters only)
  const maxExistingChapterNum = bookChapters
    .filter((ch) => !ch.chapter_type || ch.chapter_type === "regular")
    .reduce((max, ch) => Math.max(max, Number(ch.chapter_number) || 0), 0);
  const nextConsecutiveChapter = maxExistingChapterNum + 1;

  // Maximum existing volume number
  const maxExistingVolumeNum = volumes.reduce(
    (max, v) => Math.max(max, Number(v.volume_number) || 0),
    0
  );
  const nextConsecutiveVolume = maxExistingVolumeNum + 1;

  // Update default chapter number if not editing
  useEffect(() => {
    if (!editingChapterId) {
      if (chapterType === "regular") {
        setDraftChapterNum(nextConsecutiveChapter);
      }
    }
  }, [bookChapters, editingChapterId, chapterType, nextConsecutiveChapter]);

  const [liveWordCount, setLiveWordCount] = useState(0);
  const cleanDraftText = draftContent.replace(/<[^>]*>/g, " ").trim();
  const wordCount = liveWordCount || (cleanDraftText ? cleanDraftText.split(/\s+/).filter(Boolean).length : 0);

  // Reset editor to new draft
  const handleResetToNewDraft = (specificBookId = null) => {
    const targetBookId = specificBookId || selectedBookId || serials[0]?.id || "";
    if (targetBookId && String(targetBookId) !== String(selectedBookId)) {
      setSelectedBookId(Number(targetBookId));
    }
    setEditingChapterId(null);
    setChapterType("regular");
    setChapterLabel("");
    setDraftChapterNum(nextConsecutiveChapter);
    setDraftTitle("");
    setDraftContent("");
    setSelectedVolumeId(volumes[0]?.id || "");
    setScheduledAt("");
    setSavedStatus("New Chapter Ready");
  };

  // Populate editor with existing chapter
  const handleEditChapter = (chapter) => {
    setEditingChapterId(chapter.id);
    setSelectedBookId(chapter.book_id || selectedBookId);
    setDraftChapterNum(chapter.chapter_number);
    setChapterType(chapter.chapter_type || "regular");
    setChapterLabel(chapter.chapter_label || "");
    setDraftTitle(chapter.title || "");
    setDraftContent(chapter.content || "");
    setSelectedVolumeId(chapter.volume_id || "");

    if (chapter.status === "scheduled" && chapter.scheduled_at) {
      const dt = new Date(chapter.scheduled_at);
      const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledAt(localIso);
    } else {
      setScheduledAt("");
    }

    const typeDesc =
      chapter.chapter_type && chapter.chapter_type !== "regular"
        ? `${chapter.chapter_type.replace("_", " ")} #${chapter.chapter_number}`
        : `Chapter ${chapter.chapter_number}`;
    setSavedStatus(`Editing ${typeDesc}`);
    setActiveTab("editor");
    setSearchParams({ tab: "editor" });
  };

  // Delete chapter with confirmation
  const handleDeleteChapter = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete chapter "${title || id}"?`)) {
      return;
    }
    try {
      await studioService.deleteChapter(id);
      alertToast("Chapter deleted successfully");
      if (editingChapterId === id) {
        handleResetToNewDraft();
      }
      fetchChaptersAndVolumes(selectedBookId);
      fetchSerials();
    } catch (err) {
      alertToast(err.message || "Failed to delete chapter");
    }
  };

  // Save / Publish / Schedule handler
  const handleSaveChapter = async (targetStatus) => {
    if (!selectedBookId) {
      alertToast("Please select a target novel work!");
      return;
    }
    if (!draftTitle.trim()) {
      alertToast("Chapter title is required.");
      return;
    }
    if (!draftContent.trim()) {
      alertToast("Chapter content cannot be empty.");
      return;
    }

    if (targetStatus === "scheduled") {
      if (!scheduledAt) {
        alertToast("Please choose a scheduled release date and time.");
        return;
      }
      const schedTime = new Date(scheduledAt).getTime();
      if (schedTime <= Date.now()) {
        alertToast("Scheduled time must be in the future.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const parsedNum = parseFloat(draftChapterNum);
      const payload = {
        book_id: Number(selectedBookId),
        volume_id: selectedVolumeId ? Number(selectedVolumeId) : null,
        chapter_number: isNaN(parsedNum) ? Number(draftChapterNum) : parsedNum,
        chapter_type: chapterType,
        chapter_label: chapterLabel.trim() || null,
        title: draftTitle.trim(),
        content: draftContent.trim(),
        status: targetStatus,
        scheduled_at: targetStatus === "scheduled" ? new Date(scheduledAt).toISOString() : null,
      };

      if (editingChapterId) {
        await studioService.updateChapter(editingChapterId, payload);
        alertToast(
          targetStatus === "published"
            ? "Chapter published live!"
            : targetStatus === "scheduled"
            ? "Chapter schedule updated!"
            : "Draft updated successfully!"
        );
        setSavedStatus(`Updated Chapter ${draftChapterNum}`);
      } else {
        await studioService.createChapter(payload);
        alertToast(
          targetStatus === "published"
            ? "Chapter published live!"
            : targetStatus === "scheduled"
            ? `Chapter scheduled for ${new Date(scheduledAt).toLocaleString()}`
            : "Draft saved to studio!"
        );
        setSavedStatus(targetStatus === "published" ? "Published" : "Draft saved");
        handleResetToNewDraft();
      }

      fetchChaptersAndVolumes(selectedBookId);
      fetchSerials();
    } catch (err) {
      alertToast(err.message || "Failed to save chapter");
    } finally {
      setIsSaving(false);
    }
  };

  // Create Volume Submit
  const handleCreateVolume = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      alertToast("Please select a novel first.");
      return;
    }
    if (!volumeTitle.trim()) {
      alertToast("Volume title is required.");
      return;
    }

    try {
      setCreatingVolume(true);
      await studioService.createVolume({
        book_id: Number(selectedBookId),
        volume_number: nextConsecutiveVolume,
        title: volumeTitle.trim(),
        description: volumeDescription.trim() || null,
      });

      alertToast(`Volume ${nextConsecutiveVolume}: "${volumeTitle}" created!`);
      setIsVolumeModalOpen(false);
      setVolumeTitle("");
      setVolumeDescription("");
      fetchChaptersAndVolumes(selectedBookId);
    } catch (err) {
      alertToast(err.message || "Failed to create volume");
    } finally {
      setCreatingVolume(false);
    }
  };

  // Filtered chapters list for display
  const filteredChapters = bookChapters.filter((ch) => {
    if (chapterFilter === "all") return true;
    return ch.status === chapterFilter;
  });

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
      setNewBookError("Active pen name required. Switch persona or create one in Author Studio.");
      return;
    }

    if (!newBookData.title.trim() || !newBookData.slug.trim()) {
      setNewBookError("Title and slug are required.");
      return;
    }

    setNewBookLoading(true);
    try {
      const created = await bookService.createBook({
        title: newBookData.title.trim(),
        slug: newBookData.slug.trim(),
        description: newBookData.description.trim(),
        cover_image: newBookData.cover_image,
        persona_id: activePersona.id,
        status: "ongoing",
        tags: [newBookData.genre],
      });
      setIsNewBookModalOpen(false);
      alertToast(`Novel "${newBookData.title}" initialized with 0 chapters!`);
      if (created?.id) {
        setSelectedBookId(created.id);
        await fetchSerials(created.id);
      } else {
        await fetchSerials();
      }
    } catch (err) {
      console.error(err);
      setNewBookError(err.message || "Failed to publish novel.");
    } finally {
      setNewBookLoading(false);
    }
  };

  // Rollup metrics
  const totalWordsSum = serials.reduce((acc, s) => acc + (parseInt(s.total_words, 10) || 0), 0);
  const totalStonesSum = serials.reduce((acc, s) => acc + (parseInt(s.power_stones_count, 10) || 0), 0);

  const selectedNovelObj = serials.find((s) => s.id === Number(selectedBookId)) || serials[0];

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Full-Width Expansive Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 flex flex-col gap-6">
        {/* Author Desk Header */}
        <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase relative flex-wrap">
              <span className="flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span>Creator Sanctuary</span>
              </span>
              <span>•</span>
              {/* YouTube Studio Style Pen Name Quick Switcher */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setPersonaPickerOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent font-semibold text-xs transition-colors cursor-pointer"
                  title="Switch Pen Name"
                >
                  {activePersona ? (
                    <AuthorAvatar
                      name={activePersona.pen_name || activePersona.handle}
                      avatar={activePersona.avatar_url}
                      handle={activePersona.handle}
                      size="xs"
                    />
                  ) : (
                    <Users className="w-3.5 h-3.5" />
                  )}
                  <span className="font-mono lowercase">
                    @{activePersona?.handle || "author"}
                  </span>
                  {personas && personas.length > 1 && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        personaPickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {personaPickerOpen && personas && personas.length > 1 && (
                  <div className="absolute left-0 mt-1.5 w-60 bg-card border border-border-subtle rounded-xl shadow-xl py-1.5 z-40 animate-fadeIn text-xs">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle/50 mb-1 flex items-center justify-between">
                      <span>Switch Pen Name</span>
                      <span className="text-[9px] text-accent font-mono">
                        {personas.length} identities
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {personas.map((p) => {
                        const isSelected =
                          activePersona?.id === p.id ||
                          activePersona?.handle === p.handle;
                        return (
                          <button
                            key={p.id || p.handle}
                            type="button"
                            onClick={() => {
                              dispatch(setActivePersona(p));
                              setPersonaPickerOpen(false);
                              alertToast(
                                `Active pen name switched to @${p.handle}`
                              );
                            }}
                            className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-tag transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-accent/10 text-accent font-medium"
                                : "text-text-main"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <AuthorAvatar
                                name={p.display_name || p.pen_name || p.handle}
                                avatar={p.avatar_url}
                                handle={p.handle}
                                size="xs"
                              />
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-xs">
                                  {p.display_name || p.pen_name || p.handle}
                                </div>
                                <div className="text-[10px] text-text-muted font-mono truncate">
                                  @{p.handle}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-main">
              Master Scribe Workshop
            </h1>

            <p className="text-xs sm:text-sm text-text-muted">
              Serialize your works, manage chapter drafts and scheduled releases, and structure consecutive story arcs.
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
              onClick={() => {
                const targetId = selectedBookId || serials[0]?.id;
                handleResetToNewDraft(targetId);
                setActiveTab("editor");
                setSearchParams({ tab: "editor", ...(targetId ? { bookId: targetId } : {}) });
              }}
              className="px-4 py-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Chapter</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Active Serials",
              val: `${serials.length} Novels`,
              sub: `${serials.filter((s) => s.status === "ongoing").length} Ongoing`,
            },
            {
              label: "Total Manuscript Words",
              val: totalWordsSum ? `${(totalWordsSum / 1000).toFixed(0)}k` : "0 Words",
              sub: "All serials combined",
            },
            {
              label: "Power Stones Received",
              val: totalStonesSum.toLocaleString(),
              sub: "Community voting",
            },
            {
              label: "Active Pen Name",
              val: activePersona ? `@${activePersona.handle}` : "No Persona",
              sub: activePersona?.display_name || "Select in studio",
            },
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

        {/* ================= TAB 1: SERIALS & DRAFTS REPOSITORY ================= */}
        {activeTab === "desk" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* 1. Serials Overview Cards */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-text-main flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <span>My Serial Works</span>
                </h3>
                <span className="text-xs text-text-muted">
                  Click a serial below to view all chapters, drafts &amp; scheduled releases.
                </span>
              </div>

              {loadingSerials ? (
                <div className="py-12 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40">
                  Loading author serials...
                </div>
              ) : serials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {serials.map((novel) => {
                    const isSelected = Number(selectedBookId) === novel.id;
                    return (
                      <div
                        key={novel.id}
                        onClick={() => setSelectedBookId(novel.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                          isSelected
                            ? "bg-card border-accent shadow-sm ring-1 ring-accent/30"
                            : "bg-card/75 hover:bg-card border-border-subtle/50"
                        }`}
                      >
                        <img
                          src={novel.cover_image}
                          alt={novel.title}
                          className="w-12 h-16 rounded-lg object-cover border border-border-subtle/40 shrink-0"
                        />
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-serif text-sm font-bold text-text-main truncate">
                              {novel.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-tag text-text-muted text-[10px] font-semibold shrink-0 capitalize">
                              {novel.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted truncate">
                            {novel.published_chapters_count || 0} Published • {novel.draft_chapters_count || 0} Drafts
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-accent font-semibold">
                              {novel.total_words ? `${(novel.total_words / 1000).toFixed(0)}k words` : "0 words"}
                            </span>
                            <Link
                              to={`/book/${novel.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-text-muted hover:text-accent font-medium transition-colors"
                            >
                              Public View →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-14 text-center text-xs text-text-muted bg-card rounded-2xl border border-border-subtle/40 space-y-3">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
                  <p>You have not launched any serialized works under this pen name yet.</p>
                  <button
                    onClick={() => setIsNewBookModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-accent text-accent-text font-semibold cursor-pointer"
                  >
                    Publish First Serial
                  </button>
                </div>
              )}
            </div>

            {/* 2. Chapters & Drafts Manager for Selected Serial */}
            {selectedBookId && (
              <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-accent" />
                      <h3 className="font-serif text-xl font-bold text-text-main">
                        Chapters &amp; Drafts: {selectedNovelObj?.title || "Serial"}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted">
                      Manage published chapters, review unpublished drafts, and schedule release timestamps.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsVolumeModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 text-accent" />
                      <span>Create Arc / Volume ({volumes.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        handleResetToNewDraft(selectedBookId);
                        setActiveTab("editor");
                        setSearchParams({ tab: "editor", ...(selectedBookId ? { bookId: selectedBookId } : {}) });
                      }}
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Draft Chapter #{nextConsecutiveChapter}</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { id: "all", label: `All Chapters (${bookChapters.length})` },
                      {
                        id: "draft",
                        label: `Drafts (${bookChapters.filter((c) => c.status === "draft").length})`,
                      },
                      {
                        id: "scheduled",
                        label: `Scheduled (${bookChapters.filter((c) => c.status === "scheduled").length})`,
                      },
                      {
                        id: "published",
                        label: `Published (${bookChapters.filter((c) => c.status === "published").length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setChapterFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          chapterFilter === tab.id
                            ? "bg-accent text-accent-text border-accent shadow-2xs"
                            : "bg-tag hover:bg-page text-text-muted border-border-subtle"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-text-muted">
                    Next consecutive chapter: <strong className="text-accent">#{nextConsecutiveChapter}</strong>
                  </span>
                </div>

                {/* Chapters List Table */}
                {loadingChapters ? (
                  <div className="py-12 text-center text-xs text-text-muted">
                    Loading chapters and drafts...
                  </div>
                ) : filteredChapters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle/50 text-text-muted">
                          <th className="py-2.5 px-3 font-semibold">Ch. #</th>
                          <th className="py-2.5 px-3 font-semibold">Title</th>
                          <th className="py-2.5 px-3 font-semibold">Volume / Arc</th>
                          <th className="py-2.5 px-3 font-semibold">Words</th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                          <th className="py-2.5 px-3 font-semibold">Timeline</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/30">
                        {filteredChapters.map((ch) => {
                          const isDraft = ch.status === "draft";
                          const isScheduled = ch.status === "scheduled";
                          const isPublished = ch.status === "published";

                          return (
                            <tr key={ch.id} className="hover:bg-tag/30 transition-colors">
                              <td className="py-3 px-3 font-bold text-accent whitespace-nowrap">
                                #{ch.chapter_number}
                                {ch.chapter_type && ch.chapter_type !== "regular" && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                                    {ch.chapter_type.replace("_", " ")}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-medium text-text-main max-w-[200px] truncate">
                                {ch.chapter_label ? (
                                  <div>
                                    <span className="text-[10px] font-semibold text-text-muted block truncate">
                                      {ch.chapter_label}
                                    </span>
                                    <span className="truncate">{ch.title}</span>
                                  </div>
                                ) : (
                                  ch.title
                                )}
                              </td>
                              <td className="py-3 px-3 text-text-muted">
                                {ch.volume_number
                                  ? `Vol. ${ch.volume_number}: ${ch.volume_title || "Arc"}`
                                  : "Standalone"}
                              </td>
                              <td className="py-3 px-3 text-text-muted">
                                {ch.words_count ? ch.words_count.toLocaleString() : "0"}
                              </td>
                              <td className="py-3 px-3">
                                {isDraft && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-semibold text-[11px] border border-amber-500/30">
                                    Draft
                                  </span>
                                )}
                                {isScheduled && (
                                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 font-semibold text-[11px] border border-sky-500/30 flex items-center gap-1 w-fit">
                                    <Clock className="w-3 h-3" />
                                    <span>Scheduled</span>
                                  </span>
                                )}
                                {isPublished && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold text-[11px] border border-emerald-500/30">
                                    Published
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-text-muted">
                                {isScheduled && ch.scheduled_at
                                  ? `Releases ${new Date(ch.scheduled_at).toLocaleString([], {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })}`
                                  : isPublished && ch.published_at
                                  ? new Date(ch.published_at).toLocaleDateString()
                                  : "Unpublished"}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditChapter(ch)}
                                    className="p-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-text-main hover:text-accent transition-colors cursor-pointer"
                                    title="Edit Chapter"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChapter(ch.id, ch.title)}
                                    className="p-1.5 rounded-lg bg-tag hover:bg-red-500/10 border border-border-subtle/50 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                                    title="Delete Chapter"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  {isPublished && selectedNovelObj?.slug && (
                                    <Link
                                      to={`/book/${selectedNovelObj.slug}/chapter/${ch.chapter_number}`}
                                      className="p-1.5 rounded-lg bg-tag hover:bg-card border border-border-subtle/50 text-text-muted hover:text-text-main transition-colors"
                                      title="Read Published"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted space-y-1">
                    <p className="font-semibold text-text-main text-sm">No chapters found</p>
                    <p>
                      {chapterFilter === "all"
                        ? "Start drafting your first chapter using the composer."
                        : `No chapters matching the "${chapterFilter}" filter.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MANUSCRIPT EDITOR CANVAS ================= */}
        {activeTab === "editor" && (
          <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
            {/* Editor Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" /> {savedStatus}
                </span>
                <span className="text-xs text-text-muted">
                  Words: <strong className="text-text-main">{wordCount}</strong>
                </span>
                {editingChapterId && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-semibold border border-amber-500/30">
                    Editing Mode
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {editingChapterId && (
                  <button
                    onClick={handleResetToNewDraft}
                    className="px-3 py-1.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-muted hover:text-text-main text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                )}

                <button
                  onClick={() => handleSaveChapter("draft")}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-xl bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-accent" />
                  <span>{isSaving ? "Saving..." : editingChapterId ? "Update Draft" : "Save Draft"}</span>
                </button>

                <button
                  onClick={() => handleSaveChapter("scheduled")}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Schedule Release</span>
                </button>

                <button
                  onClick={() => handleSaveChapter("published")}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{editingChapterId ? "Save & Publish" : "Publish Now"}</span>
                </button>
              </div>
            </div>

            {/* Warning if no serial works exist yet */}
            {serials.length === 0 && !loadingSerials && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    You haven't launched any serial novels yet. Launch a novel before composing chapter manuscripts.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewBookModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-text font-semibold hover:bg-accent-hover transition-colors shrink-0 cursor-pointer text-xs shadow-2xs"
                >
                  + Launch New Serial
                </button>
              </div>
            )}

            {/* Chapter Classification Selector: Main Story vs Side Story / Extra / Interlude / Special / Prologue / Epilogue */}
            <div className="p-4 rounded-xl bg-tag/40 border border-border-subtle/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-xs font-bold text-text-main block">Chapter Classification</span>
                  <span className="text-[11px] text-text-muted">
                    Choose canonical story progression or non-consecutive side arcs (Side Story, Extra, Interlude, etc.).
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit ${
                  chapterType === "regular"
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                }`}>
                  {chapterType === "regular" ? "Strictly Consecutive" : "Non-consecutive • Decimals Allowed"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "regular", label: "📖 Main Story", desc: "Canon consecutive progression" },
                  { id: "side_story", label: "🌟 Side Story", desc: "Spin-off or character focus" },
                  { id: "extra", label: "🎁 Extra / Bonus", desc: "Bonus chapter or side event" },
                  { id: "interlude", label: "⏳ Interlude", desc: "Mid-arc pause or viewpoint switch" },
                  { id: "special", label: "📜 Special / Lore", desc: "Worldbuilding lore or special" },
                  { id: "prologue", label: "🌅 Prologue", desc: "Introductory backstory" },
                  { id: "epilogue", label: "🌄 Epilogue", desc: "Concluding aftermath" },
                ].map((type) => {
                  const isSelected = chapterType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setChapterType(type.id);
                        if (type.id === "regular") {
                          setDraftChapterNum(nextConsecutiveChapter);
                        } else if (!editingChapterId && (draftChapterNum === nextConsecutiveChapter || draftChapterNum === 1)) {
                          setDraftChapterNum(type.id === "prologue" ? 0.5 : Number((maxExistingChapterNum + 0.5).toFixed(2)));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-accent text-accent-text border-accent shadow-xs scale-[1.02]"
                          : "bg-card hover:bg-page text-text-muted hover:text-text-main border-border-subtle/60"
                      }`}
                      title={type.desc}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Novel, Volume, Chapter Sequence and Label Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Novel Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-muted">
                    Target Serial Work
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewBookModalOpen(true)}
                    className="text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                  >
                    + New Serial
                  </button>
                </div>
                <select
                  value={selectedBookId ? String(selectedBookId) : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedBookId(val ? Number(val) : "");
                  }}
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                >
                  {serials.length === 0 ? (
                    <option value="" disabled>
                      {loadingSerials ? "Loading your novels..." : "No novels found — Click '+ New Serial' above"}
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        Select a Target Serial...
                      </option>
                      {serials.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.title} ({s.status || "ongoing"})
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {selectedNovelObj && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AuthorAvatar
                      name={selectedNovelObj.author_name || selectedNovelObj.author_handle}
                      avatar={selectedNovelObj.author_avatar}
                      handle={selectedNovelObj.author_handle}
                      size="xs"
                    />
                    <span className="text-[10px] text-text-muted block truncate">
                      Pen Name: @{selectedNovelObj.author_handle || selectedNovelObj.author_name} • {selectedNovelObj.published_chapters_count || 0} published chs
                    </span>
                  </div>
                )}
              </div>

              {/* Story Volume (Arc) Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-muted">Story Arc / Volume</label>
                  <button
                    type="button"
                    onClick={() => setIsVolumeModalOpen(true)}
                    className="text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                  >
                    + New Arc
                  </button>
                </div>
                <select
                  value={selectedVolumeId}
                  onChange={(e) => setSelectedVolumeId(e.target.value)}
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                >
                  <option value="">No Volume / Standalone</option>
                  {volumes.map((v) => (
                    <option key={v.id} value={v.id}>
                      Vol. {v.volume_number}: {v.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Number Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-muted">
                    {chapterType === "regular" ? "Chapter Number (Consecutive)" : "Chapter # (Decimals / Custom)"}
                  </label>
                  <span className="text-[11px] text-text-muted">
                    {chapterType === "regular" ? `Next: #${nextConsecutiveChapter}` : "e.g. 1.5, 2.5, 0.5"}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min={chapterType === "regular" ? "1" : "0"}
                  value={draftChapterNum}
                  onChange={(e) => setDraftChapterNum(e.target.value)}
                  placeholder={chapterType === "regular" ? String(nextConsecutiveChapter) : "e.g. 1.5"}
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              {/* Chapter Display Label (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-text-muted">
                    Display Label (Optional)
                  </label>
                  <span className="text-[11px] text-text-muted">Custom Prefix</span>
                </div>
                <input
                  type="text"
                  value={chapterLabel}
                  onChange={(e) => setChapterLabel(e.target.value)}
                  placeholder={
                    chapterType === "side_story"
                      ? "e.g. Side Story 1"
                      : chapterType === "interlude"
                      ? "e.g. Interlude: Frost Peaks"
                      : chapterType === "extra"
                      ? "e.g. Extra 1: Summer Shore"
                      : chapterType === "prologue"
                      ? "e.g. Prologue"
                      : chapterType === "epilogue"
                      ? "e.g. Epilogue"
                      : "e.g. Ch. 1 (Custom prefix)"
                  }
                  className="w-full h-10 px-3 bg-tag border border-border-subtle/50 rounded-xl text-xs text-text-main focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Scheduled Date/Time Option */}
            <div className="p-3.5 rounded-xl bg-tag/40 border border-border-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <div>
                  <span className="text-xs font-bold text-text-main block">
                    Scheduled Publication (Optional)
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Pick a future date &amp; time. Deckle will automatically unlock this chapter to readers.
                  </span>
                </div>
              </div>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="h-9 px-3 bg-card border border-border-subtle rounded-lg text-xs text-text-main focus:outline-none focus:border-accent"
              />
            </div>

            {/* Chapter Title Input */}
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Chapter Title (e.g. Whispers of the Azure Lotus)..."
              className="w-full text-xl sm:text-2xl font-serif font-bold text-text-main bg-transparent focus:outline-none border-b border-border-subtle/30 pb-2"
            />

            {/* Tiptap Manuscript Story Editor */}
            <StoryEditor
              content={draftContent}
              onChange={(newHtml) => setDraftContent(newHtml)}
              onWordCountChange={(count) => setLiveWordCount(count)}
              placeholder="Begin composing your chapter manuscript... Use H2 for scene breaks, blockquotes for letters/scrolls, and divider for scene shifts."
              novelTitle={selectedNovelObj?.title}
              chapterNumber={draftChapterNum}
              chapterTitle={draftTitle}
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
              Live serial reading telemetry and weekly reader retention metrics across your published works.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-tag/50 border border-border-subtle/40">
                <span className="text-xs text-text-muted block">Total Reader Impressions</span>
                <span className="font-serif text-2xl font-bold text-accent">
                  {serials.reduce((acc, s) => acc + (s.views_count || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-tag/50 border border-border-subtle/40">
                <span className="text-xs text-text-muted block">Total Stones Voted</span>
                <span className="font-serif text-2xl font-bold text-accent">
                  {totalStonesSum.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-tag/50 border border-border-subtle/40">
                <span className="text-xs text-text-muted block">Completion Rate</span>
                <span className="font-serif text-2xl font-bold text-accent">84.2%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE STORY ARC / VOLUME ================= */}
      {isVolumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-subtle/50 bg-tag/40">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-text-main">
                  Create Story Arc / Volume
                </h3>
              </div>
              <button
                onClick={() => setIsVolumeModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVolume} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-tag/60 border border-border-subtle rounded-xl space-y-1">
                <span className="font-bold text-accent block">
                  Consecutive Sequencing: Volume {nextConsecutiveVolume}
                </span>
                <p className="text-[11px] text-text-muted">
                  Story arcs follow consecutive volume numbers to preserve chronological canon. Current maximum is Volume {maxExistingVolumeNum}.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Volume / Arc Title
                </label>
                <input
                  type="text"
                  required
                  value={volumeTitle}
                  onChange={(e) => setVolumeTitle(e.target.value)}
                  placeholder="e.g. The Desolate Mountain Awakening"
                  className="w-full h-10 px-3.5 bg-tag border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Arc Synopsis (Optional)
                </label>
                <textarea
                  rows={3}
                  value={volumeDescription}
                  onChange={(e) => setVolumeDescription(e.target.value)}
                  placeholder="Summary of this narrative milestone or story arc..."
                  className="w-full p-3 bg-tag border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle/50">
                <button
                  type="button"
                  onClick={() => setIsVolumeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tag text-text-muted hover:text-text-main font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingVolume}
                  className="px-5 py-2 rounded-xl bg-accent text-accent-text font-semibold hover:bg-accent-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {creatingVolume ? "Creating..." : `Create Volume ${nextConsecutiveVolume}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAUNCH NEW SERIAL ================= */}
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

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Serial Novel Title
                </label>
                <input
                  type="text"
                  required
                  value={newBookData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Battle Through the Heavens"
                  className="w-full h-10 px-3.5 bg-tag border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Unique Slug (URL Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={newBookData.slug}
                  onChange={(e) =>
                    setNewBookData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                    }))
                  }
                  placeholder="e.g. battle-through-the-heavens"
                  className="w-full h-10 px-3.5 bg-tag border border-border-subtle rounded-xl text-text-main font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Genre Taxonomy
                </label>
                <select
                  value={newBookData.genre}
                  onChange={(e) =>
                    setNewBookData((prev) => ({ ...prev, genre: e.target.value }))
                  }
                  className="w-full h-10 px-3 bg-tag border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-accent"
                >
                  <option value="Epic Fantasy">Epic Fantasy</option>
                  <option value="Progression">Progression</option>
                  <option value="LitRPG">LitRPG</option>
                  <option value="Cultivation">Cultivation / Xianxia</option>
                  <option value="Urban Fantasy">Urban Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Dark Fantasy">Dark Fantasy</option>
                  <option value="Mystery">Mystery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Synopsis / Editorial Blurb
                </label>
                <textarea
                  rows={3}
                  value={newBookData.description}
                  onChange={(e) =>
                    setNewBookData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Craft an enticing pitch to hook readers across chapter 1..."
                  className="w-full p-3 bg-tag border border-border-subtle rounded-xl text-text-main focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle/50">
                <button
                  type="button"
                  onClick={() => setIsNewBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-tag text-text-muted hover:text-text-main font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newBookLoading}
                  className="px-5 py-2 rounded-xl bg-accent text-accent-text font-semibold hover:bg-accent-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {newBookLoading ? "Publishing..." : "Launch Serial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cover Framing Modal */}
      <ImageFramingModal
        isOpen={isCoverFramingOpen}
        onClose={() => setIsCoverFramingOpen(false)}
        imageSrc={framingSrc}
        aspectRatio={2 / 3}
        type="cover"
        onConfirm={handleCoverFramingConfirm}
      />
    </div>
  );
}
