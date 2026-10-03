import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, LogIn, Menu, X } from "lucide-react";

function Header() {
  const location = useLocation();
  const [activeTheme, setActiveTheme] = useState("parchment");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("deckle_theme") || "parchment";
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  function handleThemeChange(themeName) {
    setActiveTheme(themeName);
    localStorage.setItem("deckle_theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }

  const navLinks = [
    { name: "Catalog", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Rankings", path: "/rankings" },
    { name: "Author Studio", path: "/studio" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-page/90 backdrop-blur-md border-b border-border-subtle/50 transition-colors">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* ================= LEFT: BRAND & NAV ================= */}
        <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-text shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-text-main group-hover:text-accent transition-colors">
              Deckle
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    isActive
                      ? "bg-tag text-accent font-semibold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ================= RIGHT: SEARCH, THEMES & SIGN IN ================= */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search Box (Desktop only) */}
          <div className="hidden lg:flex items-center bg-input border border-border-subtle/60 px-3 py-1.5 rounded-lg gap-2 w-64 text-sm">
            <Search className="w-4 h-4 text-text-muted" />
            <span className="text-text-muted select-none flex-1">
              Search novels, authors...
            </span>
            <kbd className="text-[10px] bg-tag text-text-muted px-1.5 py-0.5 rounded border border-border-subtle/50">
              Ctrl K
            </kbd>
          </div>

          {/* 5 Tactile Theme Dots (Tablets & Desktops) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-input border border-border-subtle/50">
            <button
              type="button"
              onClick={() => handleThemeChange("parchment")}
              title="Parchment (Warm Paper)"
              className={`w-4 h-4 rounded-full bg-[#fdf9f0] border border-[#d6c3b7] cursor-pointer transition-transform ${
                activeTheme === "parchment"
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("crisp-paper")}
              title="Crisp Paper (Daylight)"
              className={`w-4 h-4 rounded-full bg-[#ffffff] border border-[#cbd5e1] cursor-pointer transition-transform ${
                activeTheme === "crisp-paper"
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("soft-sage")}
              title="Soft Sage (Eye Care Green)"
              className={`w-4 h-4 rounded-full bg-[#ebf1ea] border border-[#b8c8b7] cursor-pointer transition-transform ${
                activeTheme === "soft-sage"
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("nocturne")}
              title="Nocturne (Twilight Slate)"
              className={`w-4 h-4 rounded-full bg-[#191e24] border border-[#374353] cursor-pointer transition-transform ${
                activeTheme === "nocturne"
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
            />
            <button
              type="button"
              onClick={() => handleThemeChange("midnight")}
              title="Midnight (OLED Night Sanctuary)"
              className={`w-4 h-4 rounded-full bg-[#0b0c0e] border border-[#282c34] cursor-pointer transition-transform ${
                activeTheme === "midnight"
                  ? "ring-2 ring-accent scale-110"
                  : "hover:scale-105"
              }`}
            />
          </div>

          {/* Sign In CTA Button (Icon on mobile, text on tablet/desktop) */}
          <Link
            to="/login"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-accent text-accent-text text-xs font-semibold flex-shrink-0 hover:opacity-90 transition-opacity shadow-sm"
            title="Sign In"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>

          {/* Mobile Hamburger Toggle (Never overflows!) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-tag flex-shrink-0 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border-subtle px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm text-text-main hover:bg-tag"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;
