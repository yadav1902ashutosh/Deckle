import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ProfileHeader from "../components/profile/ProfileHeader";
import ReadingMetricsRow from "../components/profile/ReadingMetricsRow";
import ThemePresetMatrix from "../components/profile/ThemePresetMatrix";
import TypographyLab from "../components/profile/TypographyLab";
import ReadingErgonomics from "../components/profile/ReadingErgonomics";
import CurrentlyReadingWidget from "../components/profile/CurrentlyReadingWidget";
import StorageFootprintWidget from "../components/profile/StorageFootprintWidget";
import ReadingVelocityChart from "../components/profile/ReadingVelocityChart";
import EditProfileModal from "../components/profile/EditProfileModal";
import { getActiveTheme, applyTheme } from "../utils/themeConfig";
import personaService from "../services/personaService/personaService";
import userService from "../services/userService/userService";
import { updateActivePersona } from "../store/authSlice";
import {
  BarChart3,
  Sliders,
  BookMarked,
  Shield,
  Cloud,
  CheckCircle,
  Key,
  Smartphone,
  Laptop,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Lock,
  Users,
} from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const authStatus = useSelector((state) => state.auth?.status);
  const currentUser = useSelector((state) => state.auth?.user || state.auth?.userData);
  const activePersona = useSelector((state) => state.auth?.activePersona);

  const initialTab = searchParams.get("tab") || "preferences";
  const [activeTab, setActiveTab] = useState(initialTab); // preferences | stats | shelf | security | storage

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["preferences", "stats", "shelf", "security", "storage"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  const [fontFamily, setFontFamily] = useState("serif");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [indentEnabled, setIndentEnabled] = useState(true);

  // Local overrides when user edits profile via modal
  const [localProfile, setLocalProfile] = useState(null);

  // Dynamic user dossier computed from root parent currentUser
  const user = useMemo(() => {
    if (localProfile) return localProfile;

    const memberDate = currentUser?.created_at
      ? new Date(currentUser.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "October 2026";

    return {
      name:
        currentUser?.full_name ||
        currentUser?.username ||
        "Reader",
      handle: currentUser?.username || "reader",
      email: currentUser?.email || "reader@decklenovel.com",
      role:
        currentUser?.role === "developer"
          ? "System Developer"
          : currentUser?.role === "admin"
          ? "Platform Admin"
          : currentUser?.role === "writer"
          ? "Serial Author"
          : "Avid Reader",
      tier:
        currentUser?.role === "writer"
          ? "Author"
          : currentUser?.role === "developer" || currentUser?.role === "admin"
          ? "Staff"
          : "Reader",
      memberSince: memberDate,
      bio: "Avid explorer of serial web literature.",
      avatar:
        currentUser?.avatar_url ||
        currentUser?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    };
  }, [currentUser, localProfile]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Ergonomics toggles synced to backend user_settings
  const [autoSave, setAutoSave] = useState(true);
  const [hardwareKeys, setHardwareKeys] = useState(true);
  const [tapCenter, setTapCenter] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Security toggles synced to backend
  const [twoFactor, setTwoFactor] = useState(currentUser?.two_factor_enabled || false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Genre affinity synced from backend
  const [genreAffinity, setGenreAffinity] = useState([]);
  const [affinityLoading, setAffinityLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  // Hydrate settings and security from backend
  useEffect(() => {
    let isMounted = true;
    async function loadUserSettings() {
      try {
        const settings = await userService.getSettings();
        if (isMounted && settings) {
          if (settings.bionic_reading !== undefined) setAutoSave(Boolean(settings.bionic_reading));
          if (settings.sound_effects !== undefined) setHardwareKeys(Boolean(settings.sound_effects));
        }
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    }
    loadUserSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch genre affinity when in stats tab
  useEffect(() => {
    let isMounted = true;
    async function loadAffinity() {
      setAffinityLoading(true);
      try {
        const data = await userService.getGenreAffinity();
        if (isMounted) setGenreAffinity(data || []);
      } catch (err) {
        console.error("Failed to load genre affinity:", err);
      } finally {
        if (isMounted) setAffinityLoading(false);
      }
    }
    loadAffinity();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch sessions when in security tab
  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      setSessionsLoading(true);
      try {
        const data = await userService.getSessions();
        if (isMounted) setSessions(data || []);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        if (isMounted) setSessionsLoading(false);
      }
    }
    if (activeTab === "security") {
      loadSessions();
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleToggle2FA = async (enabled) => {
    try {
      await userService.toggle2FA(enabled);
      setTwoFactor(enabled);
      showToast(enabled ? "2FA enabled" : "2FA disabled");
    } catch (err) {
      showToast(err.message || "Failed to update 2FA");
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await userService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast("Terminated remote session");
    } catch (err) {
      showToast(err.message || "Failed to revoke session");
    }
  };

  const handleToggleErgonomics = async (field, value) => {
    try {
      await userService.updateSettings({ [field]: value });
      showToast("Ergonomics preference saved");
    } catch (err) {
      console.error("Failed to update ergonomics:", err);
    }
  };

  // Sync theme with global theme config
  useEffect(() => {
    const current = getActiveTheme();
    setActiveTheme(current);

    const handleThemeChange = (e) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("deckle_theme_change", handleThemeChange);
    return () => window.removeEventListener("deckle_theme_change", handleThemeChange);
  }, []);

  // Hydrate reading preferences from active persona in DB
  useEffect(() => {
    if (activePersona?.reading_preferences) {
      const prefs = activePersona.reading_preferences;
      if (prefs.theme) {
        setActiveTheme(prefs.theme);
        applyTheme(prefs.theme);
      }
      if (prefs.fontFamily) setFontFamily(prefs.fontFamily);
      if (prefs.fontSize) setFontSize(Number(prefs.fontSize));
      if (prefs.lineHeight) setLineHeight(Number(prefs.lineHeight));
      if (typeof prefs.indentEnabled === "boolean") {
        setIndentEnabled(prefs.indentEnabled);
      }
    }
  }, [activePersona?.id]);

  // Sync preferences to backend
  const syncPreferencesToBackend = async (partialPrefs) => {
    if (!activePersona?.id) return;
    try {
      const currentPrefs = {
        theme: activeTheme,
        fontFamily,
        fontSize,
        lineHeight,
        indentEnabled,
        ...partialPrefs,
      };
      const updated = await personaService.updatePreferences(
        activePersona.id,
        currentPrefs
      );
      if (updated) {
        dispatch(updateActivePersona(updated));
      }
    } catch (err) {
      console.error("Failed to sync reading preferences to backend:", err);
    }
  };

  const handleThemeSelect = (themeId) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    showToast(`Theme calibrated to ${themeId}`);
    syncPreferencesToBackend({ theme: themeId });
  };

  const handleFontFamilyChange = (newFont) => {
    setFontFamily(newFont);
    syncPreferencesToBackend({ fontFamily: newFont });
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    syncPreferencesToBackend({ fontSize: newSize });
  };

  const handleLineHeightChange = (newLineHeight) => {
    setLineHeight(newLineHeight);
    syncPreferencesToBackend({ lineHeight: newLineHeight });
  };

  const handleIndentToggle = (newIndent) => {
    setIndentEnabled(newIndent);
    syncPreferencesToBackend({ indentEnabled: newIndent });
  };

  const handleSaveProfile = (updatedUser) => {
    setLocalProfile((prev) => ({ ...(prev || user), ...updatedUser }));
    showToast("Profile details updated successfully");

    if (activePersona?.id) {
      dispatch(
        updateActivePersona({
          id: activePersona.id,
          display_name: updatedUser.name,
          handle: updatedUser.handle,
          bio: updatedUser.bio,
          avatar_url: updatedUser.avatar,
        })
      );
    }
  };

  // Formatted stats
  const totalWords = activePersona?.total_words_read || 0;
  const formattedWords =
    totalWords >= 1000000
      ? `${(totalWords / 1000000).toFixed(1)}M`
      : totalWords >= 1000
      ? `${(totalWords / 1000).toFixed(1)}k`
      : totalWords.toLocaleString();
  const engagementHours = totalWords > 0 ? (totalWords / 14000).toFixed(1) : "0.0";
  const streakDays = activePersona?.streak_days || 0;

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialUser={user}
        onSave={handleSaveProfile}
      />

      {/* Main Full-Width Expansive Container (Matching Home Page) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* Profile Header Dossier */}
        <ProfileHeader
          user={user}
          onEditProfile={() => setIsEditModalOpen(true)}
          onExportArchive={() => showToast("Exporting library archive (JSON/EPUB)...")}
        />

        {/* Reading Metrics Row */}
        <ReadingMetricsRow
          streakDays={streakDays}
          wordsConsumed={formattedWords}
          engagementHours={engagementHours}
        />

        {/* Segmented Hub Navigation Bar (Strictly Personal Reading Setup) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border-subtle/30">
          {[
            { id: "preferences", name: "Reading Preferences", icon: Sliders },
            { id: "stats", name: "Reading Activity & Stats", icon: BarChart3 },
            { id: "shelf", name: "Bookshelf & Shelf", icon: BookMarked },
            { id: "security", name: "Account Security", icon: Shield },
            { id: "storage", name: "Offline Storage", icon: Cloud },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-accent border border-border-subtle/50 shadow-2xs font-bold"
                    : "text-text-muted hover:text-text-main hover:bg-tag/50"
                }`}
              >
                <IconComp className="w-4 h-4 text-accent" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Reading Preferences (Primary Default Asymmetric View) */}
        {activeTab === "preferences" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fadeIn">
            {/* Left Column: Deep Customization & Typography Lab (7 Cols) */}
            <div className="xl:col-span-7 flex flex-col gap-6 min-w-0">
              <ThemePresetMatrix
                activeTheme={activeTheme}
                onThemeSelect={handleThemeSelect}
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
                indentEnabled={indentEnabled}
              />

              <TypographyLab
                fontFamily={fontFamily}
                onFontFamilyChange={handleFontFamilyChange}
                fontSize={fontSize}
                onFontSizeChange={handleFontSizeChange}
                lineHeight={lineHeight}
                onLineHeightChange={handleLineHeightChange}
                indentEnabled={indentEnabled}
                onIndentToggle={handleIndentToggle}
              />

              <ReadingErgonomics
                autoSave={autoSave}
                onAutoSaveToggle={(val) => {
                  setAutoSave(val);
                  handleToggleErgonomics("bionic_reading", val);
                }}
                hardwareKeys={hardwareKeys}
                onHardwareKeysToggle={(val) => {
                  setHardwareKeys(val);
                  handleToggleErgonomics("sound_effects", val);
                }}
                tapCenterToggle={tapCenter}
                onTapCenterToggle={(val) => setTapCenter(val)}
                immersiveFullscreen={fullscreen}
                onFullscreenToggle={(val) => setFullscreen(val)}
              />
            </div>

            {/* Right Column: Currently Reading Shelf, Velocity, & Storage (5 Cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6 min-w-0">
              <CurrentlyReadingWidget />
              <ReadingVelocityChart />
              <StorageFootprintWidget
                onClearCache={() => showToast("Offline cache cleared")}
                onCacheNext={() => showToast("Next 50 chapters cached offline")}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Profile & Deep Statistics */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ReadingVelocityChart />

              {/* Genre Affinity Breakdown */}
              <section className="bg-card border border-border-subtle/50 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <h3 className="font-serif text-lg font-semibold text-text-main">
                    Literary Genre Affinity
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  {affinityLoading ? (
                    <div className="p-4 text-center text-text-muted text-xs">
                      Analyzing literary affinity...
                    </div>
                  ) : genreAffinity.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-xs bg-tag/40 rounded-xl">
                      No reading history recorded yet. Explore serial works in the catalog to build your affinity profile!
                    </div>
                  ) : (
                    genreAffinity.map((g) => (
                      <div key={g.genre} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-text-main">{g.genre}</span>
                          <span className="text-text-muted">
                            {g.book_count} {g.book_count === 1 ? "Serial" : "Serials"} ({g.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-tag h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, g.percentage || 0)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Marathon Goal Card */}
              <section className="bg-card border border-border-subtle/50 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent" />
                    <h3 className="font-serif text-lg font-semibold text-text-main">
                      Weekly Marathon
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-accent">80% Achieved</span>
                </div>
                <p className="text-xs text-text-muted">
                  Goal: 300 minutes of continuous literary immersion per week.
                </p>
                <div className="w-full bg-tag h-3 rounded-full overflow-hidden">
                  <div className="bg-accent h-full rounded-full w-4/5" />
                </div>
                <div className="flex justify-between text-xs text-text-muted font-medium">
                  <span>240 / 300 mins</span>
                  <span>60 mins remaining</span>
                </div>
              </section>

              <CurrentlyReadingWidget />
            </div>
          </div>
        )}

        {/* Tab 3: Bookshelf & History */}
        {activeTab === "shelf" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <CurrentlyReadingWidget />
            <StorageFootprintWidget
              onClearCache={() => showToast("Offline cache cleared")}
              onCacheNext={() => showToast("Next 50 chapters cached offline")}
            />
          </div>
        )}

        {/* Tab 4: Account Security */}
        {activeTab === "security" && (
          <div className="max-w-3xl flex flex-col gap-6 animate-fadeIn">
            <section className="bg-card border border-border-subtle/50 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold text-text-main">
                  Authentication &amp; Credentials
                </h3>
              </div>

              {/* Password change form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Password updated successfully");
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-text-main mb-1">Current Key</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-text-main mb-1">New Passphrase</label>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-main mb-1">Confirm New Passphrase</label>
                    <input
                      type="password"
                      placeholder="Repeat passphrase"
                      className="w-full px-3.5 py-2.5 bg-tag/60 border border-border-subtle/50 rounded-xl text-text-main focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  Update Passphrase
                </button>
              </form>

              {/* 2FA Toggle */}
              <div className="pt-4 border-t border-border-subtle/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text-main">Two-Factor Authentication (2FA)</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Require TOTP authentication code upon signing into your scholar sanctum.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => handleToggle2FA(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-border-subtle/70 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Active Sessions */}
              <div className="pt-4 border-t border-border-subtle/40 space-y-3">
                <div className="text-xs font-semibold text-text-main">Active Reading Terminals</div>
                <div className="space-y-2">
                  {sessionsLoading ? (
                    <div className="p-4 text-center text-xs text-text-muted">Loading terminals...</div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-text-muted bg-tag/30 rounded-xl">
                      No additional active terminals recorded.
                    </div>
                  ) : (
                    sessions.map((sess) => {
                      const isMobile = (sess.device_name || "").toLowerCase().includes("mobile") ||
                        (sess.device_name || "").toLowerCase().includes("iphone");
                      const DevIcon = isMobile ? Smartphone : Laptop;
                      return (
                        <div
                          key={sess.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-tag/50 border border-border-subtle/30 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <DevIcon className="w-4 h-4 text-accent" />
                            <div>
                              <div className="font-semibold text-text-main">
                                {sess.device_name || "Reading Terminal"}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {sess.ip_address || "127.0.0.1"} • {sess.is_current ? "Active Terminal Now" : "Remote"}
                              </div>
                            </div>
                          </div>
                          {sess.is_current ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRevokeSession(sess.id)}
                              className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 5: Offline Storage Full View */}
        {activeTab === "storage" && (
          <div className="max-w-3xl flex flex-col gap-6 animate-fadeIn">
            <StorageFootprintWidget
              onClearCache={() => showToast("Offline cache cleared")}
              onCacheNext={() => showToast("Next 50 chapters cached offline")}
            />
          </div>
        )}

      </div>
    </div>
  );
}
