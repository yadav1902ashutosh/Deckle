# Deckle — Backend API Requirements & Specification

This document details the backend endpoints, data contracts, and schema enhancements required to support the Deckle frontend architecture without mock fallbacks.

---

## 1. Catalog & Books API

### 1.1 Extended Query Filtering & Pagination on `GET /api/v1/books`
- **Current Behavior**: `GET /api/v1/books` returns all active books in `books` joined with `personas` and `genres` in `created_at DESC` order.
- **Requirement**: Support query parameters for platform discovery and responsive catalog browsing:
  - `genre` (string, optional): Filter by `genres.slug` or tags match (e.g. `epic-fantasy`, `litrpg`, `progression-fantasy`, `urban-fantasy`, `sci-fi`, `cyberpunk`, `dark-fantasy`, `romantasy`).
  - `status` (string, optional): `ongoing`, `completed`, or `hiatus`.
  - `sort` (string, optional):
    - `popular`: order by `views_count DESC` or reading activity.
    - `newest`: order by `created_at DESC`.
    - `rating`: order by community ratings.
  - `page` (integer, default: 1): 1-indexed page number.
  - `limit` (integer, default: 12): number of novels per page.
- **Target Response Payload**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "data": {
      "books": [
        {
          "id": 1,
          "title": "The Way of the Sunken Citadel",
          "slug": "way-of-the-sunken-citadel",
          "description": "...",
          "cover_image": "https://...",
          "persona_id": 14,
          "author_name": "Arthur Vance",
          "author_handle": "arthur_vance",
          "author_avatar": "https://...",
          "genre_id": 2,
          "genre_name": "Epic Fantasy",
          "genre_slug": "epic-fantasy",
          "status": "ongoing",
          "views_count": 48200,
          "rating": 4.9,
          "reviews_count": 1280,
          "total_chapters": 142,
          "latest_chapter_number": 142,
          "latest_chapter_title": "Spires of the Drowned King",
          "latest_chapter_published_at": "2026-10-04T07:45:00Z",
          "tags": ["epic-fantasy", "high-magic", "world-building"]
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 12,
        "total_count": 48,
        "total_pages": 4
      }
    },
    "message": "Books catalog fetched successfully!"
  }
  ```

---

## 2. Power Rankings & Leaderboard API

### 2.1 `GET /api/v1/books/rankings/top`
- **Purpose**: Powers the `RankingsSidebar` widget on the home page and the dedicated rankings leaderboard.
- **Parameters**: `?timeframe=daily|weekly|all_time` (default: `weekly`) and `?limit=10`.
- **Target Response Payload**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "data": [
      {
        "rank": 1,
        "book_id": 7,
        "title": "Shadow Slave",
        "slug": "shadow-slave",
        "author_name": "Guiltythree",
        "author_handle": "guiltythree_author",
        "cover_image": "https://...",
        "views_count": 89400,
        "rating": 4.9,
        "movement": "double_up" // "double_up" | "up" | "same" | "down"
      }
    ]
  }
  ```

---

## 3. Real-Time Serial Pulse API

### 3.1 `GET /api/v1/chapters/live-pulse`
- **Purpose**: Feeds the real-time activity stream on `LiveSerialPulse`.
- **Target Response Payload**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "data": [
      {
        "chapter_id": 312,
        "book_id": 7,
        "book_slug": "shadow-slave",
        "book_title": "Shadow Slave",
        "chapter_number": 1420,
        "chapter_title": "The Tomb of Ariel",
        "published_at": "2026-10-04T08:15:00Z",
        "author_name": "Guiltythree",
        "author_handle": "guiltythree_author"
      }
    ]
  }
  ```

---

## 4. Author Channel & Community API

### 4.1 Author Channel Subscription
- **`POST /api/v1/personas/:id/subscribe`**
  - Requires user JWT.
  - Adds reader subscription to author persona.
  - Returns updated `subscribers_count`.
- **`DELETE /api/v1/personas/:id/subscribe`**
  - Unsubscribes reader.

### 4.2 Author Channel Community Announcements
- **`GET /api/v1/personas/:handle/announcements`**
  - Public route returning community broadcasts and author notes for the Community tab on `AuthorChannelPage`.
- **`POST /api/v1/personas/:id/announcements`**
  - Protected (author ownership check).
  - Body: `{ content, media_url }`.

---

## 5. Taxonomy & Granular Universal Genres Seeding

Ensure the `genres` table is populated with universal subgenres:

| Name | Slug | Icon | Display Order |
|------|------|------|---------------|
| Epic Fantasy | `epic-fantasy` | `Castle` | 1 |
| Progression Fantasy | `progression-fantasy` | `TrendingUp` | 2 |
| LitRPG & GameLit | `litrpg` | `Gamepad2` | 3 |
| Urban Fantasy | `urban-fantasy` | `Building2` | 4 |
| Paranormal | `paranormal` | `Ghost` | 5 |
| Sci-Fi | `sci-fi` | `Rocket` | 6 |
| Cyberpunk | `cyberpunk` | `Cpu` | 7 |
| Dark Fantasy | `dark-fantasy` | `Skull` | 8 |
| Horror | `horror` | `Eye` | 9 |
| Mystery & Detective | `mystery` | `Search` | 10 |
| Romantasy | `romantasy` | `HeartHandshake` | 11 |
| Romance | `romance` | `Heart` | 12 |

---

## 6. Frontend Fallback Elimination Checklist
- [x] Dedicated `bookService` connecting to `GET /api/v1/books` and `GET /api/v1/books/:slug`.
- [x] Dedicated `personaService` connecting to `GET /api/v1/personas/:handle` and `GET /api/v1/personas/my`.
- [x] Dedicated `chapterService` connecting to `GET /api/v1/chapters/book/:bookId/toc` and reader text.
- [x] Dedicated `readingHistoryService` connecting to `GET /api/v1/history/shelf`.
- [x] Dedicated `userService` connecting to `GET /api/v1/users/current-user`, `PATCH /api/v1/users/profile`, `POST /api/v1/users/change-password`, `POST /api/v1/users/sessions/revoke-others`.
- [x] Unified skeleton loader placeholders (`BookCardSkeleton`, `HeroSpotlightSkeleton`, `AuthorChannelSkeleton`, `BookDetailsSkeleton`, `ListWidgetSkeleton`).
- [x] Removed hardcoded Chinese novel fallbacks and static mock author profiles.
- [x] Zero hardcoded mock book listings on `HomePage`, `AuthorChannelPage`, `BookDetailsPage`, or `CurrentlyReadingWidget`.

---

## 7. Master Parent User Account Management API

In Deckle's 2-tier identity architecture, the **Master Parent User Account** owns authentication credentials, email, password, and active security sessions, governing one or more creative child **Personas** (pen names).

### 7.1 Master User Profile Management
- **`GET /api/v1/users/current-user`** (Protected)
  - Returns authenticated master user entity and all linked child personas.
- **`PATCH /api/v1/users/profile`** (Protected)
  - Allows updating master personal details:
    ```json
    {
      "full_name": "Arthur Vance",
      "avatar_url": "https://...",
      "banner_url": "https://...",
      "gender": "male",
      "dob": "1994-05-18"
    }
    ```
  - Returns updated `user` object.

### 7.2 Security, Credentials & Session Governance
- **`POST /api/v1/users/change-password`** (Protected)
  - Requires:
    ```json
    {
      "currentPassword": "oldPassword123",
      "newPassword": "newSecurePassword456"
    }
    ```
  - Verifies current bcrypt hash, hashes new password with salt rounds (10), and updates the `users` table.
- **`POST /api/v1/users/sessions/revoke-others`** (Protected)
  - Generates and rotates fresh tokens while invalidating existing active refresh tokens across other devices and browsers.

### 7.3 System-Defined Account Roles Architecture
- **Immutable by Client**: The user account `role` is strictly system-managed (`CHECK (role IN ('developer', 'admin', 'writer', 'reader'))`).
- **Registration**: All newly registered users default to `role: 'reader'`. Client payloads attempting to pass `role` in `POST /api/v1/users/register` are ignored.
- **Profile Updates**: `PATCH /api/v1/users/profile` cannot modify the `role` column.
- **Dynamic System Role Promotion**: When an authenticated user publishes their first novel (`POST /api/v1/books`), the system automatically promotes their role from `'reader'` to `'writer'`.
- **Administrative Tiers**: Roles `'admin'` and `'developer'` are internal system access designations restricted to server configuration and database administrators.


