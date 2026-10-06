import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import readingHistoryService from "../services/readingHistoryService/readingHistoryService";
import LoginRequiredModal from "../components/common/LoginRequiredModal";
import { Bookmark, CheckCircle2, BookmarkCheck } from "lucide-react";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const authStatus = useSelector((state) => state.auth?.status);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetBook, setTargetBook] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch initial bookshelf IDs when authenticated
  const refreshShelf = useCallback(async () => {
    const token = localStorage.getItem("deckle_token") || localStorage.getItem("deckle-token");
    if (!token && !authStatus) {
      setBookmarkedIds(new Set());
      return;
    }

    try {
      const shelf = await readingHistoryService.getBookshelf("all");
      if (Array.isArray(shelf)) {
        const ids = new Set(shelf.map((item) => Number(item.book_id || item.id)));
        setBookmarkedIds(ids);
      }
    } catch (err) {
      console.warn("Could not load bookshelf items:", err);
    }
  }, [authStatus]);

  // Load shelf on auth changes and execute pending add-to-library if present
  useEffect(() => {
    const token = localStorage.getItem("deckle_token") || localStorage.getItem("deckle-token");
    const isAuthenticated = authStatus || Boolean(token);

    if (isAuthenticated) {
      refreshShelf();

      // Check if there was a pending book waiting for login
      try {
        const pendingRaw = sessionStorage.getItem("deckle_pending_library_book");
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          sessionStorage.removeItem("deckle_pending_library_book");
          if (pending?.id) {
            readingHistoryService
              .updateBookshelf({
                book_id: Number(pending.id),
                is_bookmarked: true,
                folder: "Reading",
              })
              .then(() => {
                setBookmarkedIds((prev) => new Set([...prev, Number(pending.id)]));
                showToast(`"${pending.title || "Novel"}" added to your library!`);
              })
              .catch((err) => console.warn("Failed to add pending book to shelf:", err));
          }
        }
      } catch (err) {
        console.warn("Error processing pending library book:", err);
      }
    } else {
      setBookmarkedIds(new Set());
    }
  }, [authStatus, refreshShelf, showToast]);

  const isBookmarked = useCallback(
    (bookId) => {
      if (!bookId) return false;
      return bookmarkedIds.has(Number(bookId));
    },
    [bookmarkedIds]
  );

  const toggleLibrary = useCallback(
    async (book, e) => {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      if (!book || !book.id) return false;

      const token = localStorage.getItem("deckle_token") || localStorage.getItem("deckle-token");
      const isAuthenticated = authStatus || Boolean(token);

      if (!isAuthenticated) {
        setTargetBook(book);
        setIsLoginModalOpen(true);
        try {
          sessionStorage.setItem("deckle_pending_library_book", JSON.stringify(book));
        } catch {
          // ignore storage error
        }
        return false;
      }

      const bookId = Number(book.id);
      const currentlyBookmarked = bookmarkedIds.has(bookId);
      const nextState = !currentlyBookmarked;

      // Optimistic state update
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (nextState) {
          next.add(bookId);
        } else {
          next.delete(bookId);
        }
        return next;
      });

      showToast(
        nextState
          ? `"${book.title || "Novel"}" added to your library`
          : `"${book.title || "Novel"}" removed from library`
      );

      try {
        await readingHistoryService.updateBookshelf({
          book_id: bookId,
          is_bookmarked: nextState,
          folder: "Reading",
        });
        return true;
      } catch (err) {
        console.error("Failed to update bookshelf:", err);
        // Revert on error
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (currentlyBookmarked) {
            next.add(bookId);
          } else {
            next.delete(bookId);
          }
          return next;
        });
        showToast("Failed to update library. Please try again.");
        return false;
      }
    },
    [authStatus, bookmarkedIds, showToast]
  );

  const openLoginModal = useCallback((book = null) => {
    setTargetBook(book);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setTargetBook(null);
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        bookmarkedIds,
        isBookmarked,
        toggleLibrary,
        refreshShelf,
        openLoginModal,
      }}
    >
      {children}

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        targetBook={targetBook}
      />

      {/* Floating Library Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-card border border-border-subtle shadow-xl text-text-main text-xs font-medium animate-fadeIn backdrop-blur-md"
        >
          <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}

export default LibraryContext;
