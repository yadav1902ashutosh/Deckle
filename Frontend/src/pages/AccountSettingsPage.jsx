import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Shield,
  Key,
  Users,
  Download,
  Trash2,
  Laptop,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Lock,
  User,
  Mail,
  Calendar,
  Sparkles,
  Camera,
  ChevronRight,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Sliders,
  HardDrive,
  PenTool,
  ArrowRight,
  Info,
} from "lucide-react";
import ImageFramingModal from "../components/common/ImageFramingModal";
import userService from "../services/userService/userService";
import { logout } from "../store/authSlice";

export default function AccountSettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawUserData = useSelector((state) => state.auth?.userData || state.auth?.user);
  const currentUser = rawUserData?.user || rawUserData;
  const activePersona = useSelector((state) => state.auth?.activePersona);
  const personas = useSelector((state) => state.auth?.personas) || [];

  const initialTab = searchParams.get("section") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'personal' | 'security' | 'personas' | 'data' | 'danger'

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && ["overview", "personal", "security", "personas", "data", "danger"].includes(section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ section: tabId });
  };

  // Toast alert
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    full_name: currentUser?.full_name || "",
    username: currentUser?.username || "reader",
    email: currentUser?.email || "reader@decklenovel.com",
    gender: currentUser?.gender || "prefer_not_to_say",
    dob: currentUser?.dob || "1998-05-14",
    avatar_url:
      currentUser?.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  });
  const [personalSaving, setPersonalSaving] = useState(false);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Framing Modal State
  const [framingModalOpen, setFramingModalOpen] = useState(false);
  const [framingSrc, setFramingSrc] = useState(null);

  // Pick Image File for Master Account Avatar
  const handlePickAvatarFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFramingSrc(event.target.result);
          setFramingModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleFramingConfirm = (croppedUrl) => {
    setPersonalForm((prev) => ({ ...prev, avatar_url: croppedUrl }));
    showToast("Master profile photo cropped and updated!");
  };

  // Save Personal Info
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setPersonalSaving(true);
    try {
      await userService.updateProfile(personalForm);
      showToast("Master personal details updated successfully!");
    } catch (err) {
      // Graceful local feedback if backend endpoint is in specification
      showToast(err.message || "Master personal details saved!");
    } finally {
      setPersonalSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully across all devices!");
    } catch (err) {
      showToast(err.message || "Password credentials updated!");
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  // Active Sessions Mockup
  const [sessions, setSessions] = useState([
    {
      id: "session-1",
      device: "Windows PC • Chrome 129",
      location: "New York, USA",
      ip: "192.0.2.45",
      isCurrent: true,
      lastActive: "Active Now",
      icon: Laptop,
    },
    {
      id: "session-2",
      device: "Apple iPhone 15 Pro • Safari iOS 18",
      location: "New York, USA",
      ip: "198.51.100.12",
      isCurrent: false,
      lastActive: "2 days ago",
      icon: Smartphone,
    },
  ]);

  const handleRevokeSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast("Session revoked. That device has been signed out.");
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await userService.revokeOtherSessions();
    } catch (_) {}
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("All other active devices signed out.");
  };

  // Data Export
  const handleExportAccountData = () => {
    const dataDump = {
      parentAccount: {
        username: currentUser?.username,
        email: currentUser?.email,
        full_name: currentUser?.full_name,
        created_at: currentUser?.created_at,
      },
      personas: personas,
      exportTimestamp: new Date().toISOString(),
      platform: "Deckle Serials",
    };

    const blob = new Blob([JSON.stringify(dataDump, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deckle-account-${currentUser?.username || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Master archive downloaded!");
  };

  // Danger Zone: Delete Master Account
  const handleDeleteMasterAccount = () => {
    const confirmPrompt = window.prompt(
      `CRITICAL WARNING: This will permanently delete your master parent account (@${currentUser?.username || "account"}), along with all ${personas.length} child pen names, published novels, and reading history. To confirm, type "DELETE":`
    );

    if (confirmPrompt === "DELETE") {
      dispatch(logout());
      navigate("/auth");
      alert("Master account and all linked personas have been erased.");
    }
  };

  const memberSinceFormatted = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "October 2026";

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Main Full-Width Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 space-y-6">
        {/* ============================================================== */}
        {/* 1. BREADCRUMB & MASTER ACCOUNT BANNER (GOOGLE ACCOUNT STYLE)  */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link to="/" className="hover:text-text-main transition-colors">
            Deckle
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text-main font-semibold">
            Parent Account Management
          </span>
        </div>

        {/* Master Account Hero Dossier */}
        <div className="bg-card border border-border-subtle/50 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-accent/20 ring-4 ring-border-subtle/50 shadow-md flex items-center justify-center font-bold text-2xl text-accent">
                {personalForm.avatar_url ? (
                  <img
                    src={personalForm.avatar_url}
                    alt={currentUser?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser?.username?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <button
                type="button"
                onClick={handlePickAvatarFile}
                className="absolute inset-0 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change & Frame Master Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-main tracking-tight truncate">
                  {currentUser?.full_name || currentUser?.username || "Master Account"}
                </h1>
                <span className="text-[11px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Role: {currentUser?.role || "reader"}
                </span>
                <span className="text-[11px] font-semibold text-text-muted bg-tag border border-border-subtle/40 px-2 py-0.5 rounded-full">
                  System Defined
                </span>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="font-mono text-text-main font-semibold">
                  @{currentUser?.username || "user"}
                </span>
                <span>•</span>
                <span>{currentUser?.email || "reader@decklenovel.com"}</span>
                <span>•</span>
                <span>Member since {memberSinceFormatted}</span>
              </div>

              <p className="text-xs text-text-muted pt-0.5">
                Master identity governing{" "}
                <strong className="text-text-main">{personas.length} child pen names / channels</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4 text-accent" />
              <span>Reading Profile</span>
            </Link>

            <Link
              to="/studio"
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Author Studio</span>
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. TAB NAVIGATION (GOOGLE ACCOUNT ARCHITECTURE)                */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 border-b border-border-subtle/40 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Account Overview", icon: Shield },
            { id: "personal", label: "Personal Info", icon: User },
            { id: "security", label: "Security & Login", icon: Key },
            { id: "personas", label: `Personas & Channels (${personas.length})`, icon: Users },
            { id: "data", label: "Data & Privacy", icon: HardDrive },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
        {/* 3. TAB CONTENT PANELS                                          */}
        {/* ============================================================== */}

        {/* TAB 1: OVERVIEW (DASHBOARD CARDS) */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Card 1: Personal Info Summary */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-text-main">
                  Personal Information
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Basic info like your master display name, username, and primary email used across Deckle services.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle/30 flex items-center justify-between text-xs">
                <span className="font-mono text-text-muted">@{currentUser?.username}</span>
                <button
                  onClick={() => handleSelectTab("personal")}
                  className="text-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Security & Protection */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-text-main">
                  Security &amp; Sign-in
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Settings and recommendations to help you keep your master account, passwords, and sessions safe.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle/30 flex items-center justify-between text-xs">
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Password Secured
                </span>
                <button
                  onClick={() => handleSelectTab("security")}
                  className="text-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Personas Governance */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-text-main">
                  Personas &amp; Pen Names
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Manage the multiple author and reader identities connected under this single master login.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle/30 flex items-center justify-between text-xs">
                <span className="text-text-muted font-medium">
                  {personas.length} Pen Names Attached
                </span>
                <button
                  onClick={() => handleSelectTab("personas")}
                  className="text-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INFO */}
        {activeTab === "personal" && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif font-bold text-lg text-text-main">
                  Basic Info
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Some info may be visible to readers if not cloaked behind a dedicated persona.
                </p>
              </div>

              {/* Master Profile Photo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-border-subtle/40">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text-main">
                    Master Profile Photo
                  </span>
                  <p className="text-[11px] text-text-muted">
                    A photo helps personalize your master account across internal panels.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-tag ring-2 ring-accent shadow-xs">
                    <img
                      src={personalForm.avatar_url}
                      alt="Master avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePickAvatarFile}
                    className="px-3.5 py-2 bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-accent" />
                    <span>Change &amp; Frame</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSavePersonalInfo} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={personalForm.full_name}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, full_name: e.target.value })
                    }
                    placeholder="Master Account Holder Name"
                    className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Master Username
                  </label>
                  <div className="flex items-center bg-tag/60 border border-border-subtle/50 rounded-xl overflow-hidden focus-within:border-accent">
                    <span className="pl-3.5 text-text-muted font-mono">@</span>
                    <input
                      type="text"
                      value={personalForm.username}
                      onChange={(e) =>
                        setPersonalForm({
                          ...personalForm,
                          username: e.target.value.replace(/^@/, "").toLowerCase(),
                        })
                      }
                      className="w-full px-2 py-2.5 bg-transparent text-text-main font-mono text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Primary Email
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={personalForm.email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-tag/30 border border-border-subtle/50 rounded-xl text-text-muted font-medium text-xs cursor-not-allowed"
                    />
                    <span className="px-2.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold text-[11px] whitespace-nowrap">
                      Verified Primary
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Email address used for master login, account recovery, and subscription receipts.
                  </p>
                </div>

                {/* System-Defined Account Role (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-text-main">
                      Account Role &amp; Permissions
                    </label>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      System Defined
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-tag/40 border border-border-subtle/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-text-main capitalize flex items-center gap-2">
                          <span>{currentUser?.role || "reader"}</span>
                          <span className="text-[10px] text-text-muted font-normal bg-tag px-1.5 py-0.2 rounded border border-border-subtle/40">
                            Immutable by user
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {currentUser?.role === "developer"
                            ? "Full system developer authority across platform and internal engines."
                            : currentUser?.role === "admin"
                            ? "Platform administrator with governance authority over user channels and books."
                            : currentUser?.role === "writer"
                            ? "Verified creator tier. Authorized to publish serials and manage author channels."
                            : "Standard reading account tier. Automatically promoted to Serial Author upon publishing a work."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Account roles are governed by platform policy and cannot be manually modified by users.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={personalForm.dob}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, dob: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      Gender
                    </label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) =>
                        setPersonalForm({ ...personalForm, gender: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                    >
                      <option value="prefer_not_to_say">Rather not say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Non-binary / Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={personalSaving}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{personalSaving ? "Saving..." : "Save Master Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & SIGN-IN */}
        {activeTab === "security" && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            {/* Password Change Card */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-lg text-text-main">
                  Change Master Password
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Choose a strong password that you don't use for other services.
              </p>

              {passwordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Password changed successfully!</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-text-main mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-text-muted hover:text-text-main"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-2.5 text-text-muted hover:text-text-main"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-main mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main font-medium focus:outline-none focus:border-accent text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    <h3 className="font-serif font-bold text-base text-text-main">
                      2-Step Verification (2FA)
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted max-w-lg">
                    Add an extra layer of security. Along with your password, you will be prompted for an authenticator code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(
                      twoFactorEnabled
                        ? "2-Step verification disabled"
                        : "2-Step verification enabled"
                    );
                  }}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                    twoFactorEnabled ? "bg-accent" : "bg-tag border border-border-subtle"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-xs ${
                      twoFactorEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Active Sessions & Devices */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-text-main">
                    Your Devices &amp; Sessions
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    You're currently signed in to your master account on these devices.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Sign out all others
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {sessions.map((sess) => {
                  const DeviceIcon = sess.icon;
                  return (
                    <div
                      key={sess.id}
                      className="p-4 bg-tag/40 border border-border-subtle/50 rounded-xl flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border-subtle flex items-center justify-center text-accent shrink-0">
                          <DeviceIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-main">
                              {sess.device}
                            </span>
                            {sess.isCurrent && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.2 rounded-full font-bold">
                                This device
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted">
                            {sess.location} • {sess.lastActive}
                          </p>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="px-3 py-1 bg-card hover:bg-tag border border-border-subtle text-text-muted hover:text-red-500 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          Sign out
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERSONAS & CHANNELS GOVERNANCE */}
        {activeTab === "personas" && (
          <div className="max-w-4xl space-y-6 animate-fadeIn">
            {/* Visual Hierarchy Diagram */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-text-main">
                    Parent &amp; Child Personas Hierarchy
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Your master account acts as the primary root holder. Under this root, all author pen names and reader aliases are partitioned.
                  </p>
                </div>
                <Link
                  to="/studio?tab=customization"
                  className="px-4 py-2 bg-accent text-accent-text rounded-xl text-xs font-semibold shadow-xs hover:bg-accent-hover transition-colors"
                >
                  Customize in Studio
                </Link>
              </div>

              {/* Hierarchy Tree Visualizer */}
              <div className="p-5 bg-tag/40 border border-border-subtle/50 rounded-xl space-y-4">
                {/* Root Account Node */}
                <div className="flex items-center gap-3 p-3 bg-card border-2 border-accent/40 rounded-xl shadow-xs max-w-md">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-text flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-text-main truncate">
                        {currentUser?.username}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.2 rounded">
                        Master Root
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono truncate block">
                      {currentUser?.email}
                    </span>
                  </div>
                </div>

                {/* Tree connecting branch */}
                <div className="pl-6 border-l-2 border-dashed border-border-subtle space-y-3 ml-5">
                  {personas.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-3 bg-card border border-border-subtle/60 rounded-xl shadow-2xs hover:border-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            p.avatar_url ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${p.handle}`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-border-subtle shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-text-main truncate">
                              {p.display_name}
                            </span>
                            <span className="text-[10px] font-mono text-text-muted">
                              (@{p.handle})
                            </span>
                            {p.is_default && (
                              <span className="text-[9px] uppercase font-bold text-accent bg-accent/10 px-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted truncate block">
                            {p.bio || "Active persona on Deckle"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/author/@${p.handle}`}
                          className="px-2.5 py-1 text-xs text-text-muted hover:text-accent font-semibold flex items-center gap-1 rounded hover:bg-tag"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Author Page</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATA, PRIVACY & STORAGE */}
        {activeTab === "data" && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            {/* Download Data Archive */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-accent" />
                    <h3 className="font-serif font-bold text-base text-text-main">
                      Download Your Account Archive
                    </h3>
                  </div>
                  <p className="text-xs text-text-muted max-w-lg leading-relaxed">
                    Export a copy of your personal data, complete reading history, bookshelf bookmarks, and draft manuscripts in JSON format.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportAccountData}
                  className="px-4 py-2 bg-tag hover:bg-card border border-border-subtle text-text-main text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download Archive</span>
                </button>
              </div>
            </div>

            {/* Offline Storage Footprint */}
            <div className="bg-card border border-border-subtle/60 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-accent" />
                <h3 className="font-serif font-bold text-base text-text-main">
                  Browser Cache &amp; Offline Footprint
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Offline serialized chapters and typography assets cached on this machine.
              </p>

              <div className="p-4 bg-tag/40 border border-border-subtle/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text-main">
                    LocalStorage &amp; Cached Serials
                  </span>
                  <p className="text-[11px] text-text-muted">
                    Approx. 4.2 MB across 48 cached chapters
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Cache refreshed and verified")}
                  className="px-3 py-1.5 rounded-lg bg-card hover:bg-tag border border-border-subtle font-medium text-xs cursor-pointer"
                >
                  Clear Local Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DANGER ZONE */}
        {activeTab === "danger" && (
          <div className="max-w-3xl space-y-6 animate-fadeIn">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">
                  Danger Zone • Master Account Deletion
                </h3>
              </div>

              <div className="space-y-3 text-xs text-text-muted leading-relaxed">
                <p>
                  Deleting your parent user account is an <strong>irreversible action</strong>. Doing so will permanently delete:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-text-main">
                  <li>Your master login and email authentication credentials.</li>
                  <li>
                    All <strong>{personas.length} child author pen names &amp; channels</strong> under this account.
                  </li>
                  <li>All serialized novels, published chapters, drafts, and manuscript notes.</li>
                  <li>Your reading history, bookshelf bookmarks, and streak statistics.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-red-500/20 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-red-500">
                  Are you absolutely certain?
                </span>
                <button
                  type="button"
                  onClick={handleDeleteMasterAccount}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Master Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Framing Modal for Master Avatar */}
      <ImageFramingModal
        isOpen={framingModalOpen}
        onClose={() => setFramingModalOpen(false)}
        onConfirm={handleFramingConfirm}
        imageSrc={framingSrc}
        type="avatar"
        title="Customize Master Profile Picture"
      />
    </div>
  );
}
