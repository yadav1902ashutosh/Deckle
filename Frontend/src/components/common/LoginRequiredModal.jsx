import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookMarked, LogIn, UserPlus, X, Sparkles, BookmarkPlus, CheckCircle2 } from "lucide-react";

export default function LoginRequiredModal({
  isOpen,
  onClose,
  targetBook = null,
  message = "Sign in to add this novel to your library and track reading progress across devices.",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPath = location.pathname + location.search;

  const handleGoToLogin = (tab = "login") => {
    onClose();
    navigate(tab === "signup" ? "/auth" : "/login", {
      state: {
        from: currentPath,
        pendingBook: targetBook,
        message: "Sign in to complete adding this book to your library.",
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border-subtle rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-colors"
      >
        {/* Subtle accent backdrop flare */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-accent/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-tag border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent border border-accent/25 flex items-center justify-center shadow-xs shrink-0">
            <BookmarkPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Reader Authentication
            </span>
            <h3 className="font-serif text-xl font-bold text-text-main leading-tight">
              Sign In to Save
            </h3>
          </div>
        </div>

        {/* Target Book Preview (if available) */}
        {targetBook && (
          <div className="p-3 bg-tag/60 border border-border-subtle rounded-xl flex items-center gap-3.5 mb-4">
            {targetBook.cover_image || targetBook.coverImage ? (
              <img
                src={targetBook.cover_image || targetBook.coverImage}
                alt={targetBook.title}
                className="w-12 h-16 object-cover rounded-md border border-border-subtle shadow-2xs shrink-0"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200";
                }}
              />
            ) : (
              <div className="w-12 h-16 rounded-md bg-card flex items-center justify-center border border-border-subtle shrink-0">
                <BookMarked className="w-6 h-6 text-text-muted" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-serif font-semibold text-text-main text-sm truncate">
                {targetBook.title || "Selected Novel"}
              </div>
              <div className="text-xs text-text-muted truncate mt-0.5">
                {targetBook.author_name || targetBook.authorName || "Serialized Author"}
              </div>
              <div className="text-[11px] text-accent font-medium mt-1">
                Will be added to your reading shelf
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-text-muted leading-relaxed mb-6">
          {message}
        </p>

        {/* Benefits list */}
        <div className="space-y-2 mb-6 bg-card-white/40 p-3 rounded-xl border border-border-subtle/50 text-xs text-text-muted">
          <div className="flex items-center gap-2 text-text-main font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Sync reading location across phone, tablet, and desktop</span>
          </div>
          <div className="flex items-center gap-2 text-text-main font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Get notified when new chapters are serialized</span>
          </div>
          <div className="flex items-center gap-2 text-text-main font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Organize books into custom Reading &amp; Completed shelves</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleGoToLogin("login")}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleGoToLogin("signup")}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-tag hover:bg-border-subtle text-text-main text-xs font-medium border border-border-subtle flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-center text-[11px] text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
