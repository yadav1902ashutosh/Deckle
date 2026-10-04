import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setActivePersona } from "../../store/authSlice";
import authService from "../../services/authService/authService";
import {
  Sparkles,
  Search,
  Bell,
  User,
  Users,
  PenTool,
  BookOpen,
  BookMarked,
  Trophy,
  Compass,
  Palette,
  Settings,
  Shield,
  LogOut,
  LogIn,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Check,
  Plus,
  Menu,
  X,
  Layers,
  Flame,
  History,
  Heart,
  Bookmark,
  ScrollText,
  Crown,
  Gamepad2,
  Building2,
  Ghost,
  Rocket,
  Cpu,
  Skull,
} from "lucide-react";
import DeckleLogo from "../common/DeckleLogo";
import { DECKLE_THEMES, getActiveTheme, applyTheme } from "../../utils/themeConfig";

export const THEMES = DECKLE_THEMES;

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Redux Auth & Persona State
  const authState = useSelector((state) => state.auth?.status);
  const rawUserData = useSelector((state) => state.auth?.userData);
  const currentUser = rawUserData?.user || rawUserData;
  const activePersona = useSelector((state) => state.auth?.activePersona);
  const personas = useSelector((state) => state.auth?.personas);

  const avatarUrl =
    activePersona?.avatar_url || currentUser?.avatar_url || currentUser?.avatar;

  // Unified Persona list with default fallback
  const personaList = useMemo(() => {
    if (personas && personas.length > 0) return personas;
    if (activePersona) return [activePersona];
    if (currentUser) {
      return [
        {
          id: 1,
          display_name:
            currentUser.full_name || currentUser.username || "Reader",
          handle: currentUser.username || "reader",
          avatar_url: currentUser.avatar_url,
          is_default: true,
        },
      ];
    }
    return [];
  }, [personas, activePersona, currentUser]);

  // UI Interactive State
  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileSubmenu, setProfileSubmenu] = useState("main"); // 'main' | 'personas' | 'themes'
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sync theme with system
  useEffect(() => {
    const current = getActiveTheme();
    setActiveTheme(current);
    applyTheme(current);

    const handleThemeChangeEvt = (e) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("deckle_theme_change", handleThemeChangeEvt);
    return () =>
      window.removeEventListener("deckle_theme_change", handleThemeChangeEvt);
  }, []);

  // Global shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) {
          setMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 50);
        } else {
          searchInputRef.current?.focus();
        }
      }
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
        setProfileSubmenu("main");
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Lock body scroll when left drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    applyTheme(themeName);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setDrawerOpen(false);
    }
  }

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setDrawerOpen(false);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const navLinks = [
    { name: "Catalog", path: "/", icon: Compass },
    { name: "Library", path: "/library", icon: BookMarked },
    { name: "Rankings", path: "/rankings", icon: Trophy },
    { name: "Community", path: "/community", icon: Users },
  ];

  const curatedGenres = [
    { name: "Epic Fantasy", slug: "epic-fantasy", icon: Crown },
    { name: "Fantasy", slug: "fantasy", icon: Sparkles },
    { name: "Progression", slug: "progression", icon: Flame },
    { name: "LitRPG", slug: "litrpg", icon: Gamepad2 },
    { name: "Urban Fantasy", slug: "urban-fantasy", icon: Building2 },
    { name: "Paranormal", slug: "paranormal", icon: Ghost },
    { name: "Sci-Fi", slug: "sci-fi", icon: Rocket },
    { name: "Cyberpunk", slug: "cyberpunk", icon: Cpu },
    { name: "Dark Fantasy", slug: "dark-fantasy", icon: Skull },
    { name: "Mystery", slug: "mystery", icon: Search },
    { name: "Romantasy", slug: "romantasy", icon: Heart },
  ];

  const currentThemeObj =
    THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TOP HEADER APP BAR (Fixed)                                  */}
      {/* ============================================================== */}
      <header className="fixed top-0 left-0 w-full z-40 bg-page/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-subtle/40 transition-colors">
        <div className="h-16 w-full px-3 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0">
          
          {/* Mobile Full-Width Search Overlay */}
          {mobileSearchOpen ? (
            <div className="flex sm:hidden items-center w-full h-10 px-3 bg-card rounded-lg border border-accent gap-2 text-xs shadow-sm">
              <Search className="w-4 h-4 text-accent shrink-0" />
              <input
                ref={mobileInputRef}
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search novels, authors..."
                className="bg-transparent text-text-main placeholder:text-text-muted text-xs focus:outline-none w-full min-w-0 truncate whitespace-nowrap"
              />
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-1 rounded text-text-muted hover:text-text-main shrink-0 cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* ================= LEFT: YOUTUBE-STYLE HAMBURGER & LOGO ================= */}
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0 min-w-0">
                {/* YouTube-style Hamburger Menu Button (Available on all screens) */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="p-2 -ml-1 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
                  aria-label="Toggle navigation drawer"
                  title="Main Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                  <DeckleLogo className="h-7 w-7 sm:h-8 sm:w-8 text-accent transition-transform group-hover:scale-105 shrink-0" />
                  <span className="font-serif text-xl sm:text-2xl text-accent tracking-tight font-semibold whitespace-nowrap">
                    Deckle
                  </span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden xl:flex items-center gap-1 shrink-0 ml-2">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                          isActive
                            ? "bg-tag text-text-main font-semibold shadow-2xs"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* ================= RIGHT: SEARCH, THEMES, NOTIFS & USER MENU ================= */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0 flex-nowrap">
                {/* Search Icon Trigger for smaller screens */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(true);
                    setTimeout(() => mobileInputRef.current?.focus(), 50);
                  }}
                  aria-label="Search"
                  className="sm:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Strictly Single-Line Search Bar for sm screens and up */}
                <div className="hidden sm:flex items-center bg-card px-2.5 sm:px-3 py-1.5 rounded-lg border border-border-subtle gap-1.5 sm:gap-2 text-xs min-w-0 sm:w-48 md:w-60 lg:w-72 xl:w-80 whitespace-nowrap flex-nowrap shrink transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search novels, authors..."
                    className="bg-transparent text-text-main placeholder:text-text-muted text-xs focus:outline-none w-full min-w-0 truncate whitespace-nowrap"
                  />
                  <kbd className="hidden lg:inline-flex bg-tag text-text-muted px-1.5 py-0.5 rounded text-[10px] font-mono border border-border-subtle/60 shrink-0 select-none">
                    ⌘K
                  </kbd>
                </div>

                {/* Quick Theme Color Dots (Desktop) */}
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-tag/50 rounded-full border border-border-subtle/40">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeChange(theme.id)}
                      title={`${theme.name} (${theme.desc})`}
                      className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all ${
                        activeTheme === theme.id
                          ? "ring-2 ring-accent scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: theme.color,
                        borderColor: theme.border,
                      }}
                    />
                  ))}
                </div>

                {/* Notifications Button */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
                </button>

                {/* User Profile or Sign In */}
                <div className="relative" ref={userMenuRef}>
                  {authState ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(!userMenuOpen);
                        setProfileSubmenu("main");
                      }}
                      className="flex items-center gap-1.5 cursor-pointer group p-1 rounded-lg hover:bg-tag transition-colors"
                      aria-label="User account and persona menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent overflow-hidden flex items-center justify-center text-accent-text font-medium text-xs shadow-2xs border border-border-subtle/40">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={currentUser?.username || "Avatar"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : currentUser?.username ? (
                          currentUser.username.charAt(0).toUpperCase()
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-text-muted group-hover:text-text-main transition-transform duration-200 ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Link
                        to="/login"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </Link>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* YOUTUBE-STYLE 2-LEVEL PROFILE MENU (WITH PERSONA SWITCHER) */}
                  {/* ========================================================= */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-card border border-border-subtle rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-xs overflow-hidden">
                      {/* VIEW 1: MAIN MENU */}
                      {profileSubmenu === "main" && (
                        <div>
                          {/* Master Parent Account Dossier Card */}
                          <div className="p-3.5 border-b border-border-subtle/50 flex items-start gap-3 bg-tag/30">
                            <div className="w-10 h-10 rounded-full bg-accent overflow-hidden shrink-0 flex items-center justify-center text-accent-text font-semibold text-sm border border-border-subtle/40 shadow-xs">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={currentUser?.username || "Avatar"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : currentUser?.username ? (
                                currentUser.username.charAt(0).toUpperCase()
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-text-main text-sm truncate">
                                  {currentUser?.full_name || currentUser?.username || "Account Holder"}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/20">
                                  {currentUser?.role || "reader"}
                                </span>
                              </div>
                              <div className="text-[11px] text-text-muted truncate font-mono">
                                @{currentUser?.username || "user"}
                              </div>
                              <div className="text-[11px] text-text-muted truncate mt-0.5">
                                {currentUser?.email || "reader@decklenovel.com"}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Link
                                  to="/profile"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="text-[11px] text-accent hover:underline font-semibold"
                                >
                                  Reading Profile →
                                </Link>
                                <span className="text-text-muted text-[10px]">•</span>
                                <Link
                                  to="/account"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="text-[11px] text-text-muted hover:text-text-main font-medium underline underline-offset-2"
                                >
                                  Manage Account
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            {/* Author Studio Gateway (Creator Channel & Pen Names) */}
                            <Link
                              to="/studio"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full px-3.5 py-2.5 flex items-center justify-between text-text-main hover:bg-tag transition-colors text-xs font-medium"
                            >
                              <div className="flex items-center gap-2.5">
                                <PenTool className="w-4 h-4 text-accent" />
                                <span>Author Studio</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                Studio
                              </span>
                            </Link>

                            {/* Reading Profile & Preferences */}
                            <Link
                              to="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-text-main hover:bg-tag transition-colors text-xs font-medium"
                            >
                              <BookOpen className="w-4 h-4 text-accent" />
                              <span>Reading Preferences &amp; Shelf</span>
                            </Link>
                          </div>

                          <div className="border-t border-border-subtle/50 my-1" />

                          <div className="py-1">
                            {/* Appearance Selector Submenu Trigger */}
                            <button
                              type="button"
                              onClick={() => setProfileSubmenu("themes")}
                              className="w-full px-3.5 py-2.5 flex items-center justify-between text-text-main hover:bg-tag transition-colors text-xs font-medium cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <Palette className="w-4 h-4 text-accent" />
                                <span>
                                  Appearance: {currentThemeObj.name.split(" ")[0]}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-text-muted">
                                <span
                                  className="w-2.5 h-2.5 rounded-full border"
                                  style={{
                                    backgroundColor: currentThemeObj.color,
                                    borderColor: currentThemeObj.border,
                                  }}
                                />
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </button>

                            {/* Parent Account Settings (Google Account style) */}
                            <Link
                              to="/account"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full px-3.5 py-2.5 flex items-center justify-between text-text-main hover:bg-tag transition-colors text-xs font-medium"
                            >
                              <div className="flex items-center gap-2.5">
                                <Shield className="w-4 h-4 text-accent" />
                                <span>Parent Account Settings</span>
                              </div>
                              <span className="text-[10px] text-text-muted bg-tag px-1.5 py-0.5 rounded border border-border-subtle/50 font-mono">
                                Root
                              </span>
                            </Link>
                          </div>

                          <div className="border-t border-border-subtle/50 my-1" />

                          {/* Sign Out */}
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-red-600 hover:bg-red-500/10 transition-colors text-xs font-medium cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VIEW 2: YOUTUBE-STYLE PERSONA / PEN NAME SWITCHER */}
                      {profileSubmenu === "personas" && (
                        <div>
                          {/* Submenu Header */}
                          <div className="p-3 border-b border-border-subtle/50 flex items-center gap-2.5 bg-tag/30">
                            <button
                              type="button"
                              onClick={() => setProfileSubmenu("main")}
                              className="p-1 rounded-lg hover:bg-tag text-text-muted hover:text-text-main cursor-pointer"
                              aria-label="Back to main menu"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                              <div className="font-semibold text-text-main text-xs">
                                Personas &amp; Pen Names
                              </div>
                              <div className="text-[10px] text-text-muted">
                                Multiple identities under @{currentUser?.username}
                              </div>
                            </div>
                          </div>

                          {/* Persona Cards List */}
                          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-border-subtle/20">
                            {personaList.map((p) => {
                              const isSelected = p.id === activePersona?.id;
                              return (
                                <button
                                  key={p.id || p.handle}
                                  type="button"
                                  onClick={() => {
                                    dispatch(setActivePersona(p));
                                    setUserMenuOpen(false);
                                  }}
                                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-accent/10 border-l-2 border-accent"
                                      : "hover:bg-tag"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-accent overflow-hidden shrink-0 flex items-center justify-center text-accent-text text-xs font-bold border border-border-subtle/40 shadow-2xs">
                                      {p.avatar_url ? (
                                        <img
                                          src={p.avatar_url}
                                          alt=""
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      ) : (
                                        p.display_name
                                          ?.charAt(0)
                                          ?.toUpperCase() ||
                                        p.handle?.charAt(0)?.toUpperCase() ||
                                        "P"
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-text-main text-xs truncate flex items-center gap-1.5">
                                        <span>{p.display_name}</span>
                                        {p.is_default && (
                                          <span className="text-[9px] uppercase font-bold text-accent bg-accent/10 px-1 py-0.2 rounded">
                                            Default
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-text-muted font-mono truncate">
                                        @{p.handle}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-accent shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Footer Action: Add or Manage Pen Names */}
                          <div className="p-2.5 border-t border-border-subtle/50 bg-card">
                            <Link
                              to="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full py-2 px-3 rounded-xl bg-tag hover:bg-tag/80 border border-border-subtle/60 text-accent text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create or Manage Pen Names</span>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* VIEW 3: READING THEME SELECTOR SUBMENU */}
                      {profileSubmenu === "themes" && (
                        <div>
                          {/* Submenu Header */}
                          <div className="p-3 border-b border-border-subtle/50 flex items-center gap-2.5 bg-tag/30">
                            <button
                              type="button"
                              onClick={() => setProfileSubmenu("main")}
                              className="p-1 rounded-lg hover:bg-tag text-text-muted hover:text-text-main cursor-pointer"
                              aria-label="Back to main menu"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-text-main text-xs">
                              Reading Themes
                            </span>
                          </div>

                          {/* Themes List */}
                          <div className="py-1">
                            {THEMES.map((theme) => {
                              const isSelected = activeTheme === theme.id;
                              return (
                                <button
                                  key={theme.id}
                                  type="button"
                                  onClick={() => handleThemeChange(theme.id)}
                                  className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-accent/10 border-l-2 border-accent"
                                      : "hover:bg-tag"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className="w-4 h-4 rounded-full border shadow-2xs"
                                      style={{
                                        backgroundColor: theme.color,
                                        borderColor: theme.border,
                                      }}
                                    />
                                    <div>
                                      <div className="font-semibold text-text-main text-xs">
                                        {theme.name}
                                      </div>
                                      <div className="text-[10px] text-text-muted">
                                        {theme.desc}
                                      </div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-accent" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. YOUTUBE-STYLE OFF-CANVAS LEFT DRAWER (SLIDE-OVER SIDEBAR)   */}
      {/* ============================================================== */}
      {/* Backdrop Dimming Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 max-w-[85vw] bg-card border-r border-border-subtle z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header (Hamburger + Logo) */}
        <div className="h-16 px-4 border-b border-border-subtle/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-2 -ml-1 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors cursor-pointer"
              aria-label="Close menu drawer"
            >
              <X className="w-5 h-5" />
            </button>
            <Link
              to="/"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 group"
            >
              <DeckleLogo className="h-7 w-7 text-accent transition-transform group-hover:scale-105" />
              <span className="font-serif text-xl font-bold text-accent tracking-tight">
                Deckle
              </span>
            </Link>
          </div>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 text-xs">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent font-semibold"
                      : "text-text-main hover:bg-tag"
                  }`}
                >
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border-subtle/50 my-2" />

          {/* Section: "You" / Personal Content & Reading Shelf */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1 flex items-center justify-between">
              <span>You • Reading Shelf</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            </div>

            {authState ? (
              <>
                <Link
                  to="/library?tab=history"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-tag transition-colors font-medium"
                >
                  <History className="w-4 h-4 text-accent shrink-0" />
                  <span>Reading History</span>
                </Link>

                <Link
                  to="/library?tab=bookmarks"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-tag transition-colors font-medium"
                >
                  <Bookmark className="w-4 h-4 text-accent shrink-0" />
                  <span>Saved Bookmarks</span>
                </Link>

                <Link
                  to="/library?tab=reading"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-tag transition-colors font-medium"
                >
                  <BookOpen className="w-4 h-4 text-accent shrink-0" />
                  <span>Currently Reading</span>
                </Link>

                <Link
                  to="/library?tab=favorites"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-main hover:bg-tag transition-colors font-medium"
                >
                  <Heart className="w-4 h-4 text-accent shrink-0" />
                  <span>Favorite Novels</span>
                </Link>
              </>
            ) : (
              <div className="p-3 bg-tag/50 rounded-xl border border-border-subtle/50 space-y-2">
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Sign in to track reading history, bookmark chapters, and build your novel library.
                </p>
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent text-accent font-semibold text-xs hover:bg-accent/10 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle/50 my-2" />

          {/* Section: Curated Taxonomy & Genres (Content Discovery) */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">
              Explore Genres
            </div>
            {curatedGenres.map((genre) => {
              const Icon = genre.icon;
              return (
                <Link
                  key={genre.slug}
                  to={`/?genre=${genre.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-text-main hover:bg-tag transition-colors font-medium"
                >
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{genre.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border-subtle/50 my-2" />

          {/* Purely Content & Informational Footer */}
          <div className="px-3 py-2 space-y-2 text-[11px] text-text-muted">
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 font-medium">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-text-main transition-colors"
              >
                About
              </Link>
              <Link
                to="/community"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-text-main transition-colors"
              >
                Community
              </Link>
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-text-main transition-colors"
              >
                Guidelines
              </Link>
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="hover:text-text-main transition-colors"
              >
                Terms &amp; Privacy
              </Link>
            </div>
            <div className="text-[10px] text-text-muted/70">
              © 2026 Deckle Web Novels
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
