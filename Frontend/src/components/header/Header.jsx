import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  LogIn,
  Palette,
} from "lucide-react";
import DeckleLogo from "../common/DeckleLogo";
import { DECKLE_THEMES, getActiveTheme, applyTheme } from "../../utils/themeConfig";

export const THEMES = DECKLE_THEMES;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth?.status);
  const user = useSelector((state) => state.auth?.userData);

  const [activeTheme, setActiveTheme] = useState(getActiveTheme());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileThemeOpen, setMobileThemeOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const themeDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const current = getActiveTheme();
    setActiveTheme(current);
    applyTheme(current);

    const handleThemeChangeEvt = (e) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("deckle_theme_change", handleThemeChangeEvt);
    return () => window.removeEventListener("deckle_theme_change", handleThemeChangeEvt);
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(e.target)
      ) {
        setMobileThemeOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (mobileThemeOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileThemeOpen, userMenuOpen]);

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    applyTheme(themeName);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  const navLinks = [
    { name: "Catalog", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Rankings", path: "/rankings" },
    { name: "Community", path: "/community" },
    { name: "Author Studio", path: "/studio" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-page/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-border-subtle/40 transition-colors">
      <div className="h-16 w-full px-3 sm:px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0">
        {/* On smaller screens, when search is open, display full-width single-line search overlay */}
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
            {/* ================= LEFT: BRAND & NAV ================= */}
            <div className="flex items-center gap-4 lg:gap-8 shrink-0 min-w-0">
              {/* Logo & Brand */}
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <DeckleLogo className="h-7 w-7 sm:h-8 sm:w-8 text-accent transition-transform group-hover:scale-105 shrink-0" />
                <span className="font-serif text-xl sm:text-2xl text-accent tracking-tight font-semibold whitespace-nowrap">
                  Deckle
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center gap-1 shrink-0">
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

            {/* ================= RIGHT: SEARCH, THEMES, NOTIFS & USER ================= */}
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

              {/* Mobile Theme Toggle Button (with live active color dot) */}
              <div className="relative sm:hidden" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setMobileThemeOpen(!mobileThemeOpen)}
                  aria-label="Change reading theme"
                  title="Switch theme"
                  className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors relative flex items-center justify-center cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  <span
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-card"
                    style={{
                      backgroundColor: THEMES.find((t) => t.id === activeTheme)?.color || "#fdf9f0",
                    }}
                  />
                </button>

                {/* Mobile Theme Popover */}
                {mobileThemeOpen && (
                  <div className="absolute right-0 top-11 z-50 bg-card rounded-xl border border-border-subtle p-2 shadow-xl w-44 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Reading Themes
                    </div>
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          handleThemeChange(t.id);
                          setMobileThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          activeTheme === t.id
                            ? "bg-tag text-text-main font-semibold ring-1 ring-accent"
                            : "text-text-muted hover:text-text-main hover:bg-page"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border shrink-0"
                          style={{ backgroundColor: t.color, borderColor: t.border }}
                        />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5-Theme Dots (Tablet & Desktop) */}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border-subtle">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    title={`${theme.name} (${theme.desc})`}
                    className={`w-4 h-4 rounded-full border cursor-pointer transition-all ${
                      activeTheme === theme.id ? "ring-2 ring-accent scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: theme.color, borderColor: theme.border }}
                  />
                ))}
              </div>

              {/* Notifications Button with Ping Dot */}
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
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 cursor-pointer group p-1 rounded-lg hover:bg-tag transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-text font-medium text-xs shadow-2xs">
                      {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-main transition-colors" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Link
                      to="/profile"
                      title="Reader Settings & Profile"
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors"
                    >
                      <User className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border-subtle rounded-xl shadow-lg py-1.5 z-50 animate-fadeIn text-xs">
                    <div className="px-3 py-2 border-b border-border-subtle/50">
                      <div className="font-semibold text-text-main truncate">
                        {user?.username || "Julian Thorne"}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {user?.email || "reader@decklenovel.com"}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-text-main hover:bg-tag transition-colors"
                    >
                      Profile &amp; Settings
                    </Link>
                    <Link
                      to="/library"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-text-main hover:bg-tag transition-colors"
                    >
                      My Bookshelf
                    </Link>
                    <Link
                      to="/studio"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-2 text-text-main hover:bg-tag transition-colors"
                    >
                      Author Studio
                    </Link>

                    <div className="border-t border-border-subtle/50 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-tag transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-card border-b border-border-subtle px-4 py-3 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-text-main hover:bg-tag"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Reading Themes Segmenter in Drawer */}
          <div className="pt-2 border-t border-border-subtle">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
              Reading Theme
            </span>
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                    activeTheme === theme.id
                      ? "bg-tag border border-accent ring-1 ring-accent"
                      : "hover:bg-tag border border-border-subtle/50"
                  }`}
                  title={theme.name}
                >
                  <span
                    className="w-5 h-5 rounded-full border shadow-2xs"
                    style={{ backgroundColor: theme.color, borderColor: theme.border }}
                  />
                  <span className="text-[10px] text-text-muted font-medium truncate max-w-full">
                    {theme.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
