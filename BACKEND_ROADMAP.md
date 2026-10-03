# Deckle Backend Roadmap & API Contracts

This file tracks all pending backend endpoints, database schema additions, and query enhancements identified during frontend development of the **Discovery Catalog (`/`)**, **Header**, and **Sidebar Ecosystem**.

---

## 1. Editorial Spotlight & Featured Serials
- [ ] **Database Migration (`books` table)**:
  - Add `is_featured` boolean and `badge` column:
    ```sql
    ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT NULL; -- e.g. 'Classic', 'Hot', 'Titan', 'Monument'

    CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;
    ```
- [ ] **Endpoint `GET /api/v1/books/featured`**:
  - Returns top curated/featured serials with full editorial dossier (synopsis, metrics, author handle, rating).
  - Fallback logic: if fewer than 5 books have `is_featured = TRUE`, order by `views_count DESC`.
  - **Important**: Mount *before* `GET /api/v1/books/:slug` in `book.routes.js`.

---

## 2. Catalog Feed Filtering, Sorting & Pagination
- [ ] **Endpoint `GET /api/v1/books` Query Parameters**:
  - `genre`: Filter by Postgres text array `tags` (e.g. `WHERE tags @> ARRAY[${genre}]::text[]`).
  - `status`: `ongoing` | `completed` | `hiatus`.
  - `sort`: 
    - `popular` (`ORDER BY views_count DESC`)
    - `updated` (`ORDER BY updated_at DESC`)
    - `rating` (`ORDER BY rating DESC`)
    - `scale` (`ORDER BY total_words DESC`)
  - `min_words` / `max_words`: Filter by word count tiers (`< 1M`, `1M - 3M`, `3M - 7M`, `> 7M`).
  - `page` & `limit`: Return paginated response with metadata:
    ```json
    {
      "statusCode": 200,
      "data": {
        "novels": [...],
        "pagination": {
          "currentPage": 1,
          "totalPages": 124,
          "totalNovels": 1420,
          "displayRange": "1 - 8"
        }
      },
      "message": "Books fetched successfully"
    }
    ```

---

## 3. Taxonomy & Genre Aggregation
- [ ] **Endpoint `GET /api/v1/books/genres`**:
  - Aggregates unique tags across all active published novels with counts:
    ```sql
    SELECT unnest(tags) AS genre, COUNT(*) AS count
    FROM books
    WHERE deleted_at IS NULL
    GROUP BY genre
    ORDER BY count DESC;
    ```
  - Cache response at edge/memory with `Cache-Control: public, max-age=86400`.

- [ ] **Endpoint `GET /api/v1/books/trending-tags` (Trending Motifs)**:
  - Returns top 10 community motifs (`#DecisiveHero`, `#ImmortalBones`, `#CheatSystem`, `#SectBuilding`, etc.) for the homepage tag cloud.

---

## 4. Sidebar Real-Time Widgets
- [ ] **Power Rankings Endpoint (`GET /api/v1/books/rankings`)**:
  - Returns the Top 10 leaderboard with weekly rank numbers (1 to 10), author name, vote tokens, and rank movement (`double_up`, `up`, `down`, `same`).

- [ ] **Live Serial Pulse Endpoint (`GET /api/v1/chapters/live-pulse`)**:
  - Queries latest 4 chapters published across all books:
    ```sql
    SELECT 
      chapters.id,
      chapters.chapter_number,
      chapters.title AS chapter_title,
      chapters.created_at,
      books.title AS novel_title,
      books.slug AS novel_slug
    FROM chapters
    JOIN books ON chapters.book_id = books.id
    WHERE chapters.deleted_at IS NULL AND books.deleted_at IS NULL
    ORDER BY chapters.created_at DESC
    LIMIT 4;
    ```

- [ ] **Reading Progress / Weekly Marathon (`GET /api/v1/reading-progress/weekly-goal`)**:
  - Calculates words read in the past 7 days for the authenticated reader (`SELECT COALESCE(SUM(words_read), 0) FROM reader_history WHERE user_id = $1 AND read_at >= NOW() - INTERVAL '7 days'`).
  - Returns `{ wordsRead: 1200000, goalWords: 1500000, percentage: 80, percentileRank: "top 3%" }`.

---

## 5. Global Search & Reader Bookmarks
- [ ] **Endpoint `GET /api/v1/books/search?q=:query`**:
  - Powers the Header `⌘K` global search bar.
  - Matches across book titles, persona author names, and tags using Postgres ILIKE or Full-Text Search (`tsvector`).

- [ ] **Personal Library Shelf Endpoints**:
  - `POST /api/v1/library/bookmark`: Add novel to personal library.
  - `DELETE /api/v1/library/bookmark/:bookId`: Remove novel from library.
  - `GET /api/v1/library`: List bookmarked novels for current user with last-read chapter pointer.

---

## 6. Multer & Cloudinary Media Upload Architecture

### A. Dependencies & Environment
- **Packages**:
  - `npm install multer cloudinary` in `Backend/`
- **Environment Variables** (already in `Backend/.env`):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### B. Multer Middleware Configuration (`Backend/middleware/multer.middleware.js`)
- **Disk Storage Strategy**:
  - Destination: `./public/temp` with `.gitkeep`.
  - Filename hashing: Timestamp + original name sanitize (`${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`).
- **Validation Rules**:
  - File types: Strict regex/mime filter for `image/jpeg`, `image/png`, `image/webp`, `image/avif`.
  - File size limit: `5MB` (`5 * 1024 * 1024` bytes).
  - Error handling: Friendly `ApiError(400, "Invalid file format. Only JPEG, PNG, WEBP, and AVIF are supported.")`.

### C. Cloudinary Utility (`Backend/utils/cloudinary.js`)
- **Upload Utility (`uploadOnCloudinary(localFilePath, folderName)`)**:
  - Upload options:
    - `resource_type: "image"`
    - `folder: "deckle/" + folderName` (e.g. `deckle/covers`, `deckle/avatars`, `deckle/banners`)
    - Automatic format and compression: `{ quality: "auto", fetch_format: "auto" }`
  - Lifecycle: Always cleans up the temporary local file via `fs.unlinkSync(localFilePath)` inside a `try/finally` block to prevent disk leakage.
  - Returns: `{ url: response.secure_url, publicId: response.public_id }`.
- **Delete Utility (`deleteFromCloudinary(publicId)`)**:
  - Destroys asset via `cloudinary.uploader.destroy(publicId)` when covers or avatars are replaced or soft-deleted.

### D. Targeted Upload Routes & Controllers
- [ ] **Book Cover Upload (`POST /api/v1/books`)**:
  - Integrate `upload.single("cover_image")`.
  - Dual-mode support:
    - If a binary file is attached, upload to Cloudinary folder `deckle/covers`.
    - If a URL string is provided in `req.body.cover_image`, validate and persist directly.
    - If neither is provided, fallback to `getFallbackBookCover(cleanSlug, tags)` from `Backend/utils/imageReference.js`.
- [ ] **Author Persona Avatar & Banner (`PATCH /api/v1/personas/:id/media`)**:
  - Integrate `upload.fields([{ name: "avatar", maxCount: 1 }, { name: "banner", maxCount: 1 }])`.
  - Saves to `deckle/personas`.
- [ ] **User Profile Avatar (`PATCH /api/v1/users/avatar`)**:
  - Protected endpoint with `upload.single("avatar")`.
  - Saves to `deckle/avatars` and updates `users.avatar_url`.
- [ ] **Database Schema Adjustments**:
  - Consider adding `cover_image_public_id VARCHAR(255)` to `books` and `avatar_public_id VARCHAR(255)` to `users` / `personas` to enable clean Cloudinary asset purging when files are modified.

