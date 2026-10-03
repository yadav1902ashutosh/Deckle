import React, { useState, useEffect } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import ReadingMetricsRow from "../components/profile/ReadingMetricsRow";
import ThemePresetMatrix from "../components/profile/ThemePresetMatrix";
import TypographyLab from "../components/profile/TypographyLab";
import ReadingErgonomics from "../components/profile/ReadingErgonomics";
import CurrentlyReadingWidget from "../components/profile/CurrentlyReadingWidget";
import { getActiveTheme, applyTheme } from "../utils/themeConfig";
import {
  BarChart3,
  Sliders,
  BookMarked,
  Shield,
  Cloud,
  CheckCircle,
  HardDrive,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("preferences"); // stats | preferences | shelf | security | storage
  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  const [fontFamily, setFontFamily] = useState("serif");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [indentEnabled, setIndentEnabled] = useState(true);

  // Ergonomics toggles
  const [autoSave, setAutoSave] = useState(true);
  const [hardwareKeys, setHardwareKeys] = useState(true);
  const [tapCenter, setTapCenter] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  useEffect(() => {
    const current = getActiveTheme();
    setActiveTheme(current);

    const handleThemeChange = (e) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("deckle_theme_change", handleThemeChange);
    return () => window.removeEventListener("deckle_theme_change", handleThemeChange);
  }, []);

  const handleThemeSelect = (themeId) => {
    setActiveTheme(themeId);
    showToast(`Theme calibrated to ${themeId}`);
  };

  return (
    <div className="w-full min-h-screen bg-page text-text-main transition-colors pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card border border-border-subtle/50 text-text-main shadow-lg rounded-full text-xs font-semibold animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Main Full-Width Expansive Container (Matching Home Page) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 flex flex-col gap-6">
        
        {/* Profile Header Dossier */}
        <ProfileHeader
          onEditProfile={() => showToast("Edit profile dialog opened")}
          onManageAccount={() => showToast("Account management opened")}
          onExportArchive={() => showToast("Exporting library archive (JSON/EPUB)...")}
        />

        {/* Reading Metrics Row */}
        <ReadingMetricsRow />

        {/* Segmented Hub Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border-subtle/30">
          {[
            { id: "preferences", name: "Reading Preferences", icon: Sliders },
            { id: "stats", name: "Profile & Statistics", icon: BarChart3 },
            { id: "shelf", name: "Bookshelf & History", icon: BookMarked },
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
                    ? "bg-card text-accent border border-border-subtle/50 shadow-2xs"
                    : "text-text-muted hover:text-text-main hover:bg-tag/50"
                }`}
              >
                <IconComp className="w-4 h-4 text-accent" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Deep Customization & Typography Lab (7 Cols) */}
          <div className="xl:col-span-7 flex flex-col gap-6 min-w-0">
            {/* Ambient Reading Canvas Presets */}
            <ThemePresetMatrix
              activeTheme={activeTheme}
              onThemeSelect={handleThemeSelect}
            />

            {/* Typography Engine */}
            <TypographyLab
              fontFamily={fontFamily}
              onFontFamilyChange={setFontFamily}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              lineHeight={lineHeight}
              onLineHeightChange={setLineHeight}
              indentEnabled={indentEnabled}
              onIndentToggle={setIndentEnabled}
            />

            {/* Ergonomics & Behavioral Toggles */}
            <ReadingErgonomics
              autoSave={autoSave}
              onAutoSaveToggle={setAutoSave}
              hardwareKeys={hardwareKeys}
              onHardwareKeysToggle={setHardwareKeys}
              tapCenterToggle={tapCenter}
              onTapCenterToggle={setTapCenter}
              immersiveFullscreen={fullscreen}
              onFullscreenToggle={setFullscreen}
            />
          </div>

          {/* Right Column: Currently Reading Shelf & Storage Manager (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-6 min-w-0">
            {/* Currently Reading Active Shelf */}
            <CurrentlyReadingWidget />

            {/* Cloud Sync & Storage Widget */}
            <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-accent" />
                  <h3 className="font-serif text-base font-semibold text-text-main">
                    Sync &amp; Storage Footprint
                  </h3>
                </div>
                <span className="text-xs font-semibold text-accent flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Synced
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Local Cache Used</span>
                  <span className="font-semibold text-text-main">18.4 MB / 500 MB</span>
                </div>
                <div className="w-full bg-tag h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: "8%" }} />
                </div>
              </div>

              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                All downloaded chapters and paragraph bookmarks are encrypted and available offline in plane or subway environments.
              </p>

              <button
                onClick={() => showToast("Offline cache optimized")}
                className="w-full py-2 bg-tag hover:bg-card border border-border-subtle/50 text-text-main text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Clear Temporary Cache
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
