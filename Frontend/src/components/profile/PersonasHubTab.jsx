import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Plus,
  Check,
  ExternalLink,
  PenTool,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  Image as ImageIcon,
  Camera,
  Upload,
  Layout,
  Info,
  Palette,
  Sliders,
  Monitor,
  Smartphone,
  Save,
  CheckCircle,
} from "lucide-react";
import { setActivePersona, addPersona, removePersona, updateActivePersona } from "../../store/authSlice";
import personaService from "../../services/personaService/personaService";
import ImageFramingModal from "../common/ImageFramingModal";

export default function PersonasHubTab({ onToast = () => {} }) {
  const dispatch = useDispatch();
  const rawUserData = useSelector((state) => state.auth?.userData || state.auth?.user);
  const currentUser = rawUserData?.user || rawUserData;
  const activePersona = useSelector((state) => state.auth?.activePersona);
  const personas = useSelector((state) => state.auth?.personas) || [];

  // YouTube Studio style sub-navigation: 'branding' | 'basic_info' | 'personas_list'
  const [activeSubTab, setActiveSubTab] = useState("branding");

  // Image Framing Modal State
  const [framingModalState, setFramingModalState] = useState({
    isOpen: false,
    imageSrc: null,
    type: "banner", // 'banner' | 'avatar' | 'cover'
    targetField: null, // 'avatar' | 'banner' | 'create_avatar' | 'create_banner'
  });

  const fileInputRef = useRef(null);

  // Active persona customization draft state
  const [brandingData, setBrandingData] = useState({
    avatar_url:
      activePersona?.avatar_url ||
      currentUser?.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    banner_url:
      activePersona?.banner_url ||
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600",
    display_name: activePersona?.display_name || currentUser?.username || "Author",
    handle: activePersona?.handle || currentUser?.username || "author",
    bio: activePersona?.bio || "Author crafting speculative serialized fiction on Deckle.",
  });

  const [savingBranding, setSavingBranding] = useState(false);

  // Sync draft whenever activePersona changes
  React.useEffect(() => {
    if (activePersona) {
      setBrandingData({
        avatar_url:
          activePersona.avatar_url ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        banner_url:
          activePersona.banner_url ||
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600",
        display_name: activePersona.display_name || "Author",
        handle: activePersona.handle || "author",
        bio: activePersona.bio || "",
      });
    }
  }, [activePersona]);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [createFormData, setCreateFormData] = useState({
    display_name: "",
    handle: "",
    bio: "",
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    banner_url:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600",
  });

  // Persona list fallback
  const personaList =
    personas.length > 0
      ? personas
      : activePersona
      ? [activePersona]
      : [
          {
            id: 1,
            display_name:
              currentUser?.full_name || currentUser?.username || "Primary Reader",
            handle: currentUser?.username || "reader",
            bio: "Dedicated serial fiction enthusiast and storyteller.",
            avatar_url: currentUser?.avatar_url,
            banner_url:
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600",
            is_default: true,
          },
        ];

  const handleSwitchPersona = (p) => {
    dispatch(setActivePersona(p));
    onToast(`Switched active pen name to @${p.handle}`);
  };

  const handleDeletePersona = async (p) => {
    if (p.is_default) {
      onToast("Cannot delete your primary default persona.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete pen name @${p.handle}?`)) {
      return;
    }

    try {
      await personaService.deletePersona(p.id);
      dispatch(removePersona(p.id));
      onToast(`Pen name @${p.handle} deleted successfully`);
    } catch (err) {
      console.error(err);
      onToast(err.message || "Failed to delete pen name");
    }
  };

  // Open framing modal when picking an image file
  const handlePickImageForFraming = (type, targetField) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFramingModalState({
            isOpen: true,
            imageSrc: event.target.result,
            type,
            targetField,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Confirm framing crop result
  const handleFramingConfirm = (croppedUrl) => {
    const field = framingModalState.targetField;
    if (field === "avatar") {
      setBrandingData((prev) => ({ ...prev, avatar_url: croppedUrl }));
      onToast("Profile picture cropped and updated!");
    } else if (field === "banner") {
      setBrandingData((prev) => ({ ...prev, banner_url: croppedUrl }));
      onToast("Channel banner cropped and updated!");
    } else if (field === "create_avatar") {
      setCreateFormData((prev) => ({ ...prev, avatar_url: croppedUrl }));
    } else if (field === "create_banner") {
      setCreateFormData((prev) => ({ ...prev, banner_url: croppedUrl }));
    }
  };

  // Save changes to active persona
  const handleSaveChannelCustomization = async () => {
    setSavingBranding(true);
    try {
      if (activePersona?.id) {
        dispatch(
          updateActivePersona({
            avatar_url: brandingData.avatar_url,
            banner_url: brandingData.banner_url,
            display_name: brandingData.display_name,
            bio: brandingData.bio,
          })
        );
      }
      onToast("Channel customization published successfully!");
    } catch (err) {
      console.error(err);
      onToast(err.message || "Failed to update channel");
    } finally {
      setSavingBranding(false);
    }
  };

  // Submit new persona
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!createFormData.display_name.trim() || !createFormData.handle.trim()) {
      setFormError("Display name and handle are required.");
      return;
    }

    const cleanHandle = createFormData.handle
      .trim()
      .replace(/^@/, "")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toLowerCase();

    setSubmitting(true);
    try {
      const payload = {
        display_name: createFormData.display_name.trim(),
        handle: cleanHandle,
        bio: createFormData.bio.trim(),
        avatar_url: createFormData.avatar_url,
        banner_url: createFormData.banner_url,
      };

      const newPersona = await personaService.createPersona(payload);
      const personaObj = newPersona?.data || newPersona;

      dispatch(addPersona(personaObj));
      dispatch(setActivePersona(personaObj));
      onToast(`New pen name @${cleanHandle} created and activated!`);
      setIsCreateModalOpen(false);
      setCreateFormData({
        display_name: "",
        handle: "",
        bio: "",
        avatar_url:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        banner_url:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600",
      });
    } catch (err) {
      console.error(err);
      setFormError(
        err.message || "Failed to create pen name. The handle might be taken."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ============================================================== */}
      {/* 1. CHANNEL CUSTOMIZATION STUDIO HEADER (YOUTUBE STYLE)         */}
      {/* ============================================================== */}
      <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-main">
              Channel Customization
            </h2>
            <span className="text-xs bg-tag px-2.5 py-0.5 rounded-full border border-border-subtle font-mono text-accent font-semibold">
              @{brandingData.handle}
            </span>
          </div>
          <p className="text-xs text-text-muted max-w-xl">
            Customize your author branding, multi-device channel art, and manage pen names under your master account.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            to={`/author/@${brandingData.handle}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent" />
            <span>View Author Page</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveChannelCustomization}
            disabled={savingBranding}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingBranding ? "Publishing..." : "Publish Changes"}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. YOUTUBE STUDIO TABS (BRANDING, BASIC INFO, ALL PEN NAMES)   */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-border-subtle/40 pb-2">
        {[
          { id: "branding", label: "Branding", icon: Palette },
          { id: "basic_info", label: "Basic Info", icon: Info },
          { id: "personas_list", label: `All Pen Names (${personaList.length})`, icon: Users },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-tag text-accent border border-border-subtle shadow-2xs font-bold"
                  : "text-text-muted hover:text-text-main hover:bg-tag/50"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 3. TAB CONTENT                                                 */}
      {/* ============================================================== */}

      {/* TAB A: BRANDING (YOUTUBE STUDIO BRANDING SCREEN) */}
      {activeSubTab === "branding" && (
        <div className="space-y-6">
          {/* Section 1: Picture (Avatar) */}
          <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-text-main">
                Picture
              </h3>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                Your profile picture will appear where your pen name is presented on Deckle, like on your author channel, novel detail pages, and reader reviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
              {/* Circular Avatar Preview */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-tag ring-4 ring-border-subtle/50 shrink-0 shadow-md">
                <img
                  src={brandingData.avatar_url}
                  alt={brandingData.display_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Requirements & Action Buttons */}
              <div className="space-y-3 flex-1">
                <div className="text-xs text-text-muted space-y-1">
                  <p>
                    • Recommended: at least <strong>400 × 400 pixels</strong> (PNG, JPG, or WEBP).
                  </p>
                  <p>• Make sure your picture conforms to platform community guidelines.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePickImageForFraming("avatar", "avatar")}
                    className="px-4 py-2 bg-accent text-accent-text text-xs font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload &amp; Frame Picture</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFramingModalState({
                        isOpen: true,
                        imageSrc: brandingData.avatar_url,
                        type: "avatar",
                        targetField: "avatar",
                      })
                    }
                    className="px-3.5 py-2 bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Adjust Crop
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Banner Image (YouTube Multi-Device Banner) */}
          <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-text-main">
                Banner Image
              </h3>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                This image will appear across the top of your public author page. Deckle automatically calculates the viewable area for mobile, desktop, and wide displays.
              </p>
            </div>

            {/* Current Banner Preview with Overlay Badge */}
            <div className="relative w-full h-44 sm:h-56 rounded-xl overflow-hidden bg-tag border border-border-subtle shadow-inner">
              <img
                src={brandingData.banner_url}
                alt="Channel banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Viewable Zone Badge */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-accent" />
                <span>Central zone safe for all devices</span>
              </div>
            </div>

            {/* Banner Specs & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="text-xs text-text-muted space-y-1">
                <p>
                  • For best results on all devices, use an image that's at least <strong>2048 × 1152 pixels</strong> and 6MB or less.
                </p>
                <p>• Deckle's interactive cropper will let you align the safe zone before saving.</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePickImageForFraming("banner", "banner")}
                  className="px-4 py-2 bg-accent text-accent-text text-xs font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Banner</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFramingModalState({
                      isOpen: true,
                      imageSrc: brandingData.banner_url,
                      type: "banner",
                      targetField: "banner",
                    })
                  }
                  className="px-3.5 py-2 bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Frame &amp; Crop Safe Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: BASIC INFO (YOUTUBE STUDIO BASIC INFO) */}
      {activeSubTab === "basic_info" && (
        <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-4 max-w-2xl">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-text-main mb-1">
                Pen Name
              </label>
              <p className="text-[11px] text-text-muted mb-2">
                Choose a pen name that represents your published works and storytelling style.
              </p>
              <input
                type="text"
                value={brandingData.display_name}
                onChange={(e) =>
                  setBrandingData({ ...brandingData, display_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="block text-xs font-bold text-text-main mb-1">
                Handle
              </label>
              <p className="text-[11px] text-text-muted mb-2">
                Choose your unique author handle by adding letters and numbers.
              </p>
              <div className="flex items-center bg-tag/60 border border-border-subtle/50 rounded-xl overflow-hidden focus-within:border-accent">
                <span className="pl-3.5 text-text-muted font-mono text-xs">@</span>
                <input
                  type="text"
                  value={brandingData.handle}
                  onChange={(e) =>
                    setBrandingData({
                      ...brandingData,
                      handle: e.target.value
                        .replace(/^@/, "")
                        .replace(/[^a-zA-Z0-9_]/g, "_")
                        .toLowerCase(),
                    })
                  }
                  className="w-full px-2 py-2.5 bg-transparent text-text-main font-mono text-xs focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1.5 font-mono">
                Author URL: deckle.com/author/@{brandingData.handle}
              </p>
            </div>

            {/* Description / Bio */}
            <div>
              <label className="block text-xs font-bold text-text-main mb-1">
                Description / Author Bio
              </label>
              <p className="text-[11px] text-text-muted mb-2">
                Tell readers about your stories, update rhythms, upcoming serials, or worldbuilding passion.
              </p>
              <textarea
                rows={4}
                value={brandingData.bio}
                onChange={(e) =>
                  setBrandingData({ ...brandingData, bio: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB C: ALL PEN NAMES & SWITCHER */}
      {activeSubTab === "personas_list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <p className="text-xs text-text-muted">
              Select an author persona to switch your active identity, or click Create to launch a new one.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Pen Name</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personaList.map((p) => {
              const isActive =
                activePersona?.id === p.id ||
                activePersona?.handle?.toLowerCase() === p.handle?.toLowerCase();

              return (
                <div
                  key={p.id}
                  className={`relative bg-card rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-4 ${
                    isActive
                      ? "border-accent ring-2 ring-accent/20 shadow-md"
                      : "border-border-subtle/60 hover:border-border-subtle shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/20 text-accent font-bold text-sm flex items-center justify-center shrink-0 border border-border-subtle shadow-2xs">
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt={p.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        p.display_name?.charAt(0)?.toUpperCase() || "P"
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-base font-semibold text-text-main truncate">
                          {p.display_name}
                        </h3>
                        {p.is_default && (
                          <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/20">
                            Default
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-text-muted truncate">
                        @{p.handle}
                      </p>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed pt-1">
                        {p.bio || "No biography written yet for this author persona."}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border-subtle/40 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/author/@${p.handle}`}
                        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-tag"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Author Page</span>
                      </Link>

                      <Link
                        to="/studio"
                        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-main font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-tag"
                      >
                        <PenTool className="w-3.5 h-3.5 text-accent" />
                        <span>Studio</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => handleSwitchPersona(p)}
                          className="px-3 py-1.5 bg-accent text-accent-text hover:bg-accent-hover rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-accent py-1 px-2">
                          Active
                        </span>
                      )}

                      {!p.is_default && (
                        <button
                          type="button"
                          onClick={() => handleDeletePersona(p)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Pen Name"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. YOUTUBE-STYLE CREATE PEN NAME WIZARD MODAL                  */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle/50 bg-tag/40">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-text-main">
                  Create Author Pen Name
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-tag text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Step 1: Pen Name & Handle */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Pen Name / Author Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arthur Vance, Evelyn Cross"
                    value={createFormData.display_name}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, display_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Unique Author Handle
                  </label>
                  <div className="flex items-center bg-tag/60 border border-border-subtle/50 rounded-xl overflow-hidden focus-within:border-accent">
                    <span className="pl-3.5 text-text-muted font-mono">@</span>
                    <input
                      type="text"
                      placeholder="arthur_vance"
                      value={createFormData.handle}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, handle: e.target.value })
                      }
                      className="w-full px-2 py-2.5 bg-transparent text-text-main font-mono text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 font-mono">
                    Public channel URL: deckle.com/author/@{createFormData.handle || "handle"}
                  </p>
                </div>
              </div>

              {/* Step 2: Branding (Avatar & Banner with interactive Framing) */}
              <div className="space-y-4 pt-2 border-t border-border-subtle/40">
                <span className="font-bold text-text-main text-xs uppercase tracking-wider block">
                  Branding Art
                </span>

                {/* Avatar Pick */}
                <div className="flex items-center gap-4">
                  <img
                    src={createFormData.avatar_url}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-accent shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handlePickImageForFraming("avatar", "create_avatar")}
                      className="px-3.5 py-1.5 bg-card hover:bg-tag border border-border-subtle rounded-xl text-text-main font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-accent" />
                      <span>Upload &amp; Frame Avatar</span>
                    </button>
                    <p className="text-[10px] text-text-muted">
                      Will be cropped as a circle.
                    </p>
                  </div>
                </div>

                {/* Banner Pick */}
                <div className="space-y-2">
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-tag border border-border-subtle relative">
                    <img
                      src={createFormData.banner_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePickImageForFraming("banner", "create_banner")}
                    className="px-3.5 py-1.5 bg-card hover:bg-tag border border-border-subtle rounded-xl text-text-main font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-accent" />
                    <span>Upload &amp; Frame Banner (Safe Zone)</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Bio */}
              <div className="pt-2 border-t border-border-subtle/40">
                <label className="block font-semibold text-text-main mb-1">
                  Author Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Introduce yourself to prospective readers..."
                  value={createFormData.bio}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Pen Name"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. REUSABLE IMAGE FRAMING MODAL (YOUTUBE MULTI-DEVICE CROPPER) */}
      {/* ============================================================== */}
      <ImageFramingModal
        isOpen={framingModalState.isOpen}
        onClose={() =>
          setFramingModalState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleFramingConfirm}
        imageSrc={framingModalState.imageSrc}
        type={framingModalState.type}
      />
    </div>
  );
}
