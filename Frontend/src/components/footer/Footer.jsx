import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp, BookOpen } from "lucide-react";

function Footer() {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const navLinks = [
    { name: "Catalog", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Rankings", path: "/rankings" },
    { name: "Author Studio", path: "/studio" },
  ];

  return (
    <footer className="w-full bg-card border-t border-border-subtle/50 py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-accent" />
          <span className="font-serif font-bold text-text-main">Deckle</span>
          <span>•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Compact Nav Links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="hover:text-text-main transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Return to Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-tag hover:text-text-main transition-colors cursor-pointer"
          title="Return to Top"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
