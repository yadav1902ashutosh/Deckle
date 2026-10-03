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
} from "lucide-react";
import DeckleLogo from "../common/DeckleLogo";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.auth?.status);
  const user = useSelector((state) => state.auth?.userData);

  const [activeTheme, setActiveTheme] = useState("parchment");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("deckle_theme") || "parchment";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
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

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    localStorage.setItem("deckle_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
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

          {/* 5-Theme Dots */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border-subtle">
            <button
              type="button"
              onClick={() => handleThemeChange("parchment")}
              title="Parchment (Warm Paper)"
              className={`w-4 h-4 rounded-full bg-[#fdf9f0] border border-[#d6c3b7] cursor-pointer transition-all ${
                activeTheme === "parchment" ? "ring-2 ring-accent scale-110" : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("crisp-paper")}
              title="Crisp Paper (Daylight Clean)"
              className={`w-4 h-4 rounded-full bg-[#ffffff] border border-[#cbd5e1] cursor-pointer transition-all ${
                activeTheme === "crisp-paper" ? "ring-2 ring-accent scale-110" : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("soft-sage")}
              title="Soft Sage (Eye Care Green)"
              className={`w-4 h-4 rounded-full bg-[#ebf1ea] border border-[#b8c8b7] cursor-pointer transition-all ${
                activeTheme === "soft-sage" ? "ring-2 ring-accent scale-110" : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("nocturne")}
              title="Nocturne (Slate Twilight)"
              className={`w-4 h-4 rounded-full bg-[#191e24] border border-[#374353] cursor-pointer transition-all ${
                activeTheme === "nocturne" ? "ring-2 ring-accent scale-110" : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("midnight")}
              title="Midnight (OLED Night)"
              className={`w-4 h-4 rounded-full bg-[#0b0c0e] border border-[#282c34] cursor-pointer transition-all ${
                activeTheme === "midnight" ? "ring-2 ring-accent scale-110" : "hover:scale-105"
              }`}
            />
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
          {authState ? (
            <div className="flex items-center gap-1.5 cursor-pointer group p-1 rounded-lg hover:bg-tag transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-text font-medium text-xs shadow-2xs">
                {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-main transition-colors" />
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

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
        <div className="xl:hidden bg-card border-b border-border-subtle px-4 py-3 space-y-2">
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
      )}
    </header>
  );
}
