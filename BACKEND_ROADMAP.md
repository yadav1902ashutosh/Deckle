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

---

## 7. Novel Details & Chapter Directory Architecture (`/book/:slug`)

### A. Database Migrations (`books` & `chapters` extensions)
- **`books` Table Additions**:
  ```sql
  ALTER TABLE books
    ADD COLUMN IF NOT EXISTS original_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.90,
    ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_words BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS edition_notes TEXT DEFAULT 'Official Translation • Complete & Unabridged',
    ADD COLUMN IF NOT EXISTS announcement_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS announcement_content TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS announcement_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

  CREATE INDEX IF NOT EXISTS idx_books_rating ON books(rating DESC);
  ```

- **`chapters` Table Additions (Volume Grouping)**:
  ```sql
  ALTER TABLE chapters
    ADD COLUMN IF NOT EXISTS volume_number INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS volume_title VARCHAR(255) DEFAULT 'Volume 1';

  CREATE INDEX IF NOT EXISTS idx_chapters_book_volume ON chapters(book_id, volume_number);
  ```

### B. Endpoints Specification

- [ ] **Novel Master Dossier (`GET /api/v1/books/:slug`)**:
  - **Controller**: `getBookDetailsBySlug`
  - **Access**: Public (with optional Bearer auth token for user-specific state)
  - **Response Payload**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "id": 1,
        "title": "Battle Through the Heavens",
        "slug": "battle-through-the-heavens",
        "original_title": "斗破苍穹 (Dòu Pò Cāng Qióng)",
        "description": "Here, magic is nonexistent; instead, Dou Qi reigns supreme...",
        "cover_image": "https://res.cloudinary.com/deckle/covers/btth.webp",
        "status": "completed",
        "edition_notes": "Official Translation • Complete & Unabridged",
        "tags": ["Action", "Cultivation", "Eastern Fantasy", "Revenge", "Sect Life"],
        "metrics": {
          "rating": 4.92,
          "ratings_count": 14820,
          "total_words": 4820000,
          "total_chapters": 1663,
          "views_count": 894000,
          "power_stones": 14200,
          "weekly_rank": "#3 in Eastern Fantasy"
        },
        "author": {
          "id": 4,
          "name": "Heavenly Silkworm Potato",
          "avatar_url": "https://res.cloudinary.com/deckle/avatars/potato.webp",
          "bio": "Platinum-tier web novel author behind BTTH, The Great Ruler, and Yuan Zun.",
          "total_works": 5,
          "followers_count": 128400
        },
        "latest_chapter": {
          "chapter_number": 1663,
          "title": "Flame Di Reborn, Savior of the Continent (End)",
          "published_at": "2026-03-15T08:00:00Z"
        },
        "announcement": {
          "title": "Commemorative Hardcover Edition & Special Epilogue Chapters",
          "content": "Special side story volumes covering the ancient Dou Di wars will be published next month!",
          "updated_at": "2026-03-20T14:30:00Z"
        },
        "user_state": {
          "is_bookmarked": true,
          "current_chapter_number": 42,
          "current_chapter_title": "The Alchemist Grandmaster",
          "scroll_percentage": 68.5,
          "last_read_at": "2026-04-01T12:00:00Z"
        }
      },
      "message": "Book details fetched successfully"
    }
    ```

- [ ] **Chapter Table of Contents (`GET /api/v1/books/:slug/chapters`)**:
  - **Controller**: `getBookChaptersCatalog`
  - **Query Parameters**:
    - `volume` (optional integer, filter by volume)
    - `sort` (`asc` | `desc`, default `asc`)
    - `q` (optional string search against title or chapter number)
    - `page` & `limit` (optional; if omitted or `all=true`, returns the lightweight TOC array for fast navigation)
  - **Optimized Selection**: Omit `content` body for bandwidth efficiency; select `id`, `chapter_number`, `title`, `volume_number`, `volume_title`, `words_count`, `published_at`.

- [ ] **Curated Recommendations (`GET /api/v1/books/:slug/recommendations`)**:
  - **Controller**: `getRelatedRecommendations`
  - **Algorithm**:
    1. Match other books sharing matching tags (`WHERE tags && $1 AND slug != $2`).
    2. Fallback or augment with books by the same author persona.
    3. Order by `views_count DESC` and limit to 4 books.

- [ ] **Power Stone Voting (`POST /api/v1/books/:slug/power-stones`)**:
  - **Controller**: `castPowerStones`
  - **Access**: Protected (JWT required)
  - **Body**: `{ "tokens": 1 }`
  - **Logic**: Deducts daily power stones from user wallet table or daily allowance, increments `books.power_stones_count`, and logs event in `token_transactions`.

- [ ] **Author Tip Support (`POST /api/v1/books/:slug/tips`)**:
  - **Controller**: `tipAuthor`
  - **Access**: Protected (JWT required)
  - **Body**: `{ "amount": 100, "message": "Masterpiece! Keep writing." }`

---

## 8. Distraction-Free Reader Manuscript & State Sync (`/book/:slug/chapter/:chapterNum`)

### A. Database Migrations (`reading_history` & `chapter_lore`)
- **`reading_history` Table**:
  ```sql
  CREATE TABLE IF NOT EXISTS reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    scroll_percentage DECIMAL(5,2) DEFAULT 0.00,
    words_read INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, book_id)
  );

  CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id, last_read_at DESC);
  ```

- **`chapter_lore` Table (Lexicon / Cultural Glossary)**:
  ```sql
  CREATE TABLE IF NOT EXISTS chapter_lore (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    term VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_chapter_lore_book ON chapter_lore(book_id);
  ```

### B. Endpoints Specification

- [ ] **Full Manuscript Delivery (`GET /api/v1/books/:slug/chapters/:chapterNum`)**:
  - **Controller**: `getChapterManuscript`
  - **Access**: Public (with optional Bearer auth token)
  - **Response Payload**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "book": {
          "id": 1,
          "title": "Battle Through the Heavens",
          "slug": "battle-through-the-heavens"
        },
        "chapter": {
          "id": 1663,
          "chapter_number": 1663,
          "title": "Flame Di Reborn, Savior of the Continent (End)",
          "volume_number": 12,
          "volume_title": "Volume 12: Battle of the Di",
          "words_count": 3480,
          "estimated_reading_minutes": 18,
          "published_at": "2026-03-15T08:00:00Z",
          "paragraphs": [
            "The chaotic, destructive energy across the Central Plains gradually dispersed...",
            "High above the clouds, the resplendent rainbow-colored flame silhouette stepped forward...",
            "\"From this day forth, peace returns to our Dou Qi Continent,\" Xiao Yan's voice echoed..."
          ]
        },
        "navigation": {
          "prev_chapter": {
            "chapter_number": 1662,
            "title": "The Decisive Heavenly Battle"
          },
          "next_chapter": null
        },
        "lore_context": [
          { "term": "Dou Di", "definition": "The supreme legendary cultivation rank above Dou Sheng." },
          { "term": "Purifying Demonic Lotus Flame", "definition": "Rank 3 on the Heavenly Flame ranking, pure white with demonic cleansing power." }
        ]
      },
      "message": "Chapter manuscript fetched successfully"
    }
    ```

- [ ] **Reading Progress Sync (`POST /api/v1/reading-history/progress`)**:
  - **Controller**: `syncReadingProgress`
  - **Access**: Protected (JWT required)
  - **Body**:
    ```json
    {
      "book_id": 1,
      "chapter_number": 1663,
      "scroll_percentage": 94.5,
      "words_read": 3200,
      "is_completed": false
    }
    ```
  - **Upsert Query**:
    ```sql
    INSERT INTO reading_history (user_id, book_id, chapter_id, chapter_number, scroll_percentage, words_read, is_completed, last_read_at)
    VALUES ($1, $2, (SELECT id FROM chapters WHERE book_id = $2 AND chapter_number = $3), $3, $4, $5, $6, NOW())
    ON CONFLICT (user_id, book_id)
    DO UPDATE SET 
      chapter_id = EXCLUDED.chapter_id,
      chapter_number = EXCLUDED.chapter_number,
      scroll_percentage = EXCLUDED.scroll_percentage,
      words_read = reading_history.words_read + EXCLUDED.words_read,
      is_completed = EXCLUDED.is_completed,
      last_read_at = NOW();
    ```

- [ ] **Fast Resumption Query (`GET /api/v1/reading-history/continue/:bookId`)**:
  - **Controller**: `getResumePoint`
  - **Access**: Protected
  - Returns the exact `chapter_number` and `scroll_percentage` to resume seamless reading.

---

## 9. Reading Preferences & Theme Sync Across Devices

To preserve consistent user experience across web and mobile readers, user display configurations are synchronized with the backend.

### A. Database Migrations
- **`users` Table Preference Column**:
  ```sql
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reading_preferences JSONB DEFAULT '{
      "theme": "parchment",
      "font_family": "serif",
      "font_size": 18,
      "line_height": 1.8,
      "text_indent": true,
      "text_align": "justify"
    }'::jsonb;
  ```

### B. Endpoints Specification
- [ ] **Retrieve Preferences (`GET /api/v1/users/reading-preferences`)**:
  - **Access**: Protected
  - Returns user's persisted reading options.
- [ ] **Update Preferences (`PATCH /api/v1/users/reading-preferences`)**:
  - **Access**: Protected
  - **Supported Themes**: `parchment`, `crisp-paper`, `soft-sage`, `nocturne`, `midnight`.
  - **Body**:
    ```json
    {
      "theme": "parchment",
      "font_family": "serif",
      "font_size": 20,
      "line_height": 1.85,
      "text_indent": true,
      "text_align": "justify",
      "ergonomics": {
        "auto_save": true,
        "hardware_page_turning": true,
        "tap_center_toggle": true,
        "fullscreen_on_entry": false
      }
    }
    ```

---

## 10. Personal Bookshelf, Folders & Batch Operations (`/library`)

### A. Database Migrations (`user_bookshelf` table)
```sql
CREATE TABLE IF NOT EXISTS user_bookshelf (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  folder VARCHAR(50) DEFAULT 'all', -- 'all', 'xianxia', 'favorites', 'finished', or custom user tag
  is_favorite BOOLEAN DEFAULT FALSE,
  unread_chapters_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_bookshelf_user_access ON user_bookshelf(user_id, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookshelf_folder ON user_bookshelf(user_id, folder);
```

### B. Endpoints Specification
- [ ] **Retrieve User Shelf (`GET /api/v1/library/shelf`)**:
  - **Controller**: `getUserBookshelf`
  - **Query Parameters**:
    - `folder`: `'all'` | `'favorites'` | `'finished'` | custom string
    - `sort`: `'recent'` (`ORDER BY last_accessed_at DESC`) | `'progress'` | `'title'`
    - `q`: Search filter across title, author, or book tags
  - **Response Payload**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "books": [
          {
            "id": 1,
            "book_id": 1,
            "title": "Battle Through the Heavens",
            "slug": "battle-through-the-heavens",
            "author": "Heavenly Silkworm Potato",
            "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
            "folder": "favorites",
            "is_favorite": true,
            "current_chapter_number": 42,
            "latest_chapter_number": 1663,
            "latest_chapter_title": "Flame Di Reborn",
            "unread_chapters": 12,
            "progress_percentage": 68.0,
            "total_words": "4.8M words",
            "status": "completed",
            "last_accessed_at": "2026-04-01T12:00:00Z"
          }
        ],
        "active_scroll": {
          "book_id": 1,
          "title": "Battle Through the Heavens",
          "slug": "battle-through-the-heavens",
          "chapter_number": 42,
          "chapter_title": "The Alchemist Grandmaster",
          "progress_percentage": 68.0,
          "last_read_ago": "15m ago"
        }
      },
      "message": "Bookshelf retrieved successfully"
    }
    ```

- [ ] **Batch Remove from Shelf (`POST /api/v1/library/shelf/batch-remove`)**:
  - **Controller**: `batchRemoveFromShelf`
  - **Body**: `{ "book_ids": [1, 2, 4] }`
  - **Query**: `DELETE FROM user_bookshelf WHERE user_id = $1 AND book_id = ANY($2::int[])`

- [ ] **Batch Move Folder (`POST /api/v1/library/shelf/batch-move`)**:
  - **Controller**: `batchMoveShelfFolder`
  - **Body**: `{ "book_ids": [1, 2], "folder": "favorites" }`
  - **Query**: `UPDATE user_bookshelf SET folder = $3, is_favorite = ($3 = 'favorites') WHERE user_id = $1 AND book_id = ANY($2::int[])`

- [ ] **Reading Stats & Momentum (`GET /api/v1/library/stats`)**:
  - **Controller**: `getReadingStats`
  - **Returns**: Streak days (`48 Days`), today reading minutes (`48`), weekly words read (`420,000`), weekly goal target (`500,000`), goal percentage (`84%`), and active streak status.

- [ ] **Reading History (`GET /api/v1/library/history`) & Clear (`DELETE /api/v1/library/history`)**:
  - **Controller**: `getReadingHistory` / `clearReadingHistory`
  - Returns chronologically grouped history entries with last-read chapter pointers and percentages.

- [ ] **Offline Manuscript Batch Delivery (`GET /api/v1/chapters/offline-batch`)**:
  - **Controller**: `getOfflineChapterBatch`
  - **Query**: `book_id=:id&start=:num&end=:num`
  - Returns lightweight sanitized chapter manuscripts for client IndexedDB/localStorage storage.

---

## 11. Leaderboard Rankings & Serial Directory (`/rankings`)

### A. Endpoints Specification
- [ ] **Rankings Directory Query (`GET /api/v1/rankings`)**:
  - **Controller**: `getLeaderboardRankings`
  - **Query Parameters**:
    - `genre`: Filter by taxonomy tags (e.g. `'Fantasy'`, `'Xianxia'`, `'Invincible Flow'`)
    - `status`: `'all'` | `'ongoing'` | `'completed'` | `'ranked_today'`
    - `sort`: `'popular'` (Power rankings leaderboard) | `'updated'` | `'rating'` | `'scale'` (&gt;5M grand epics)
    - `page` & `limit`
  - **Response Payload**:
    ```json
    {
      "statusCode": 200,
      "data": {
        "rankings": [
          {
            "rank": 1,
            "id": 1,
            "title": "Battle Through the Heavens",
            "slug": "battle-through-the-heavens",
            "author": "Tiancan Tudou",
            "status": "completed",
            "cover_image": "https://res.cloudinary.com/deckle/covers/btth.webp",
            "total_words": "7.1M words",
            "views": "1.9M",
            "tags": ["DouQi", "Alchemist", "Cultivation"],
            "excerpt": "In a realm of pure Dou Qi...",
            "latest_chapter_number": 1663,
            "latest_chapter_title": "Flame Di Reborn"
          }
        ],
        "total_works": 1240
      },
      "message": "Rankings fetched successfully"
    }
    ```

- [ ] **Today's Editorial Top Pick (`GET /api/v1/rankings/editorial-pick`)**:
  - **Controller**: `getEditorialTopPick`
  - Fetches the active daily curated spotlight novel with deep editorial blurb, HOT badge, and word metrics.

---

## 12. Reader Profile, Archiving & Account Management (`/profile`)

### A. Database Migrations
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tier_title VARCHAR(50) DEFAULT 'Senior Scholar',
  ADD COLUMN IF NOT EXISTS tier_level VARCHAR(20) DEFAULT 'Tier 7',
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_engagement_hours DECIMAL(6,1) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_words_consumed BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
```

### B. Endpoints Specification
- [ ] **User Profile Dossier (`GET /api/v1/users/me`)**:
  - **Controller**: `getCurrentUserProfile`
  - Returns authenticated reader's statistics, streak count, membership date, and tier standing.

- [ ] **Update Profile Info (`PATCH /api/v1/users/profile`)**:
  - **Controller**: `updateUserProfile`
  - **Body**: `{ "bio": "...", "display_name": "...", "avatar_url": "..." }`

- [ ] **Export Library Archive (`GET /api/v1/users/export-archive`)**:
  - **Controller**: `exportUserArchive`
  - **Format**: `?format=json` or `?format=epub`
  - Generates and streams a downloadable archive of the user's bookmarked novels, reading history, highlights, and annotations.

---

## 13. Reader Sanctum Community Agora & Discourse (`/community`)

### A. Database Migrations (`forum_threads` & `forum_replies`)
```sql
CREATE TABLE IF NOT EXISTS forum_threads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  upvotes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thread_upvotes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, thread_id)
);

CREATE INDEX IF NOT EXISTS idx_threads_book ON forum_threads(book_id);
CREATE INDEX IF NOT EXISTS idx_threads_upvotes ON forum_threads(upvotes_count DESC);
```

### B. Endpoints Specification
- [ ] **Discourse Threads List (`GET /api/v1/community/threads`)**:
  - **Controller**: `getCommunityThreads`
  - **Query**: `category` (`'theory'`, `'dao_debates'`, `'rankings'`), `sort` (`'hot'`, `'top'`, `'new'`), `page`, `limit`
- [ ] **Create Discourse Thread (`POST /api/v1/community/threads`)**:
  - **Controller**: `createThread`
  - **Body**: `{ "title": "...", "content": "...", "book_id": 1, "tags": ["Dao Debate"] }`
- [ ] **Upvote Thread (`POST /api/v1/community/threads/:id/upvote`)**:
  - **Controller**: `toggleThreadUpvote`
  - Atomically increments/decrements `upvotes_count` and toggles entry in `thread_upvotes`.
- [ ] **Top Scholars Leaderboard (`GET /api/v1/community/top-scholars`)**:
  - **Controller**: `getTopScholars`
  - Queries top weekly community contributors ranked by karma / received upvotes.

---

## 14. Master Scribe Author Studio & Manuscript Desk (`/studio`)

### A. Database Migrations (`chapters` scheduling extension)
```sql
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS coins_required INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_chapters_scheduled ON chapters(scheduled_at) WHERE status = 'scheduled';
```

### B. Endpoints Specification
- [ ] **Author Serials Overview (`GET /api/v1/studio/serials`)**:
  - **Controller**: `getAuthorSerials`
  - **Access**: Protected (Author persona required)
  - Returns persona's authored novels with draft counts, word statistics, and subscriber retention rates.

- [ ] **Create or Schedule Chapter (`POST /api/v1/studio/chapters`)**:
  - **Controller**: `createStudioChapter`
  - **Body**:
    ```json
    {
      "book_id": 1,
      "chapter_number": 43,
      "title": "Chapter 43: The Pill Tribulation Cloud",
      "content": "Deep inside the alchemist chamber...",
      "words_count": 3120,
      "status": "scheduled",
      "scheduled_at": "2026-04-10T18:00:00Z"
    }
    ```

- [ ] **Auto-Save Chapter Draft (`PATCH /api/v1/studio/chapters/:id`)**:
  - **Controller**: `autoSaveChapterDraft`
  - Debounced endpoint saving content and word count without triggering subscriber notifications.

- [ ] **Reader Retention Funnel Analytics (`GET /api/v1/studio/analytics/:bookId`)**:
  - **Controller**: `getSerialAnalytics`
  - Calculates 30-day chapter drop-off curves, peak reading hours, and follower growth trends.



