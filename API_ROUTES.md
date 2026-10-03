# 📡 Deckle: API Documentation & Route Reference

**Base URL:** `http://localhost:8000/api/v1`

---

## 🔐 Authentication Standards

Every protected endpoint accepts credentials through **either** of these two methods:
1. **Desktop Browsers (Automatic):** `httpOnly` secure cookie named `accessToken`.
2. **Mobile / Cross-Domain (Explicit Header):**
   ```http
   Authorization: Bearer <your_access_token>
   ```

---

## 🖼️ Media & File Upload Standards (Multer + Cloudinary)

Endpoints supporting image uploads accept **either**:
1. **Multipart Form-Data (`multipart/form-data`):**
   - File attachment directly from local disk (e.g., `<input type="file">` or Postman form-data).
   - Saved temporarily to `public/temp/` and automatically streamed to Cloudinary.
   - Automatically unlinks and removes local temporary files on completion.
   - Max file size: **5 MB**. Supported types: `jpeg`, `jpg`, `png`, `webp`, `gif`.
2. **Raw JSON (`application/json`):**
   - Provide an existing direct image URL in the JSON body (e.g. Unsplash or external CDN).

| Entity | Upload Field Name | Cloudinary Destination Folder | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Book Cover** | `cover_image` | `deckle_books` | Algorithmic genre motif / unsplash |
| **Volume Arc** | `cover_image` | `deckle_volumes` | Inherits novel's cover |
| **Persona Avatar** | `avatar` | `deckle_avatars` | Seeded DiceBear avatar via `@handle` |
| **Persona Banner** | `banner` | `deckle_banners` | Abstract dark gradient palette |

---

## 👤 User & Authentication Routes (`/users`)

Base: `/api/v1/users`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | **Public** | Registers a new user account & generates their initial default Persona |
| `POST` | `/login` | **Public** | Authenticates via email/username & password. Returns tokens & personas |
| `POST` | `/logout` | **Protected** | Clears refresh token in DB & wipes auth cookies |
| `GET` | `/current-user` | **Protected** | Fetches the logged-in user profile & all their owned personas |
| `POST` | `/refresh-token` | **Public** | Issues a new 15m `accessToken` using valid `refreshToken` cookie |
| `PATCH` | `/change-password` | **Protected** | Verifies old password and sets new password |
| `PATCH` | `/update-account` | **Protected** | Updates email and full name |

---

### User Endpoint Specs:

#### 1. Register User
* **Endpoint:** `POST /api/v1/users/register`
* **Access:** Public
* **Request Body (JSON):**
  ```json
  {
    "full_name": "Alex Johnson",
    "username": "alex_writer",
    "email": "alex@example.com",
    "password": "mySecurePassword123",
    "role": "writer",
    "gender": "male",
    "dob": "2000-05-15"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "user": {
        "id": 1,
        "full_name": "Alex Johnson",
        "username": "alex_writer",
        "email": "alex@example.com",
        "role": "writer"
      },
      "defaultPersona": {
        "id": 1,
        "user_id": 1,
        "display_name": "Alex Johnson",
        "handle": "alex_writer",
        "is_default": true
      }
    },
    "message": "User registered successfully with default persona!",
    "success": true
  }
  ```

#### 2. Login User
* **Endpoint:** `POST /api/v1/users/login`
* **Access:** Public
* **Request Body (JSON):**
  ```json
  {
    "email": "alex@example.com",
    "password": "mySecurePassword123"
  }
  ```
* **Cookies Set:** `accessToken` (15m), `refreshToken` (7d)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": { "id": 1, "username": "alex_writer" },
      "accessToken": "eyJhbGciOi...",
      "personas": [{ "id": 1, "handle": "alex_writer", "is_default": true }]
    },
    "message": "User logged in successfully!",
    "success": true
  }
  ```

---

## 🎭 Persona Routes (`/personas`)

Base: `/api/v1/personas`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Creates a new pen name (supports `avatar` & `banner` file uploads) |
| `GET` | `/my` | **Protected** | Fetches all pen names owned by logged-in user |
| `GET` | `/:handle` | **Public** | Author profile page (bio, avatar, published books) |
| `PATCH` | `/:id/preferences` | **Protected** | Updates reader theme, font family, font size, and favorite genres |
| `POST` | `/:id/stats/increment` | **Protected** | Adds words read and increments daily reading streak |
| `DELETE` | `/:id` | **Protected** | Soft-deletes a pen name (cannot delete default primary persona) |

---

### Persona Endpoint Specs:

#### 1. Create a New Persona (Supports Multipart Uploads)
* **Endpoint:** `POST /api/v1/personas`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Content-Type: multipart/form-data` *(or `application/json`)*
* **Form-Data Fields:**
  * `avatar` *(File, optional)*: Avatar image uploaded to Cloudinary `deckle_avatars`
  * `banner` *(File, optional)*: Header banner uploaded to Cloudinary `deckle_banners`
  * `display_name` *(Text, required)*: e.g. "Shadow Weaver"
  * `handle` *(Text, required)*: e.g. "shadow_weaver"
  * `bio` *(Text, optional)*: Author bio
  * `avatar_url` *(Text, optional)*: Fallback URL if file not uploaded
  * `banner_url` *(Text, optional)*: Fallback URL if file not uploaded
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 2,
      "user_id": 1,
      "display_name": "Shadow Weaver",
      "handle": "shadow_weaver",
      "avatar_url": "https://res.cloudinary.com/.../deckle_avatars/avatar-1700.webp",
      "banner_url": "https://res.cloudinary.com/.../deckle_banners/banner-1700.webp",
      "reading_preferences": {
        "theme": "parchment",
        "fontSize": 18,
        "fontFamily": "Merriweather"
      },
      "streak_days": 0,
      "total_words_read": 0
    },
    "message": "New pen name created successfully!",
    "success": true
  }
  ```

#### 2. Update Reading Preferences
* **Endpoint:** `PATCH /api/v1/personas/:id/preferences`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "preferences": {
      "theme": "parchment",
      "fontSize": 20,
      "fontFamily": "Lora",
      "favorite_genres": ["progression-fantasy", "cultivation"]
    }
  }
  ```

#### 3. Increment Reading Session Stats
* **Endpoint:** `POST /api/v1/personas/:id/stats/increment`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "wordsCount": 2400
  }
  ```

---

## 📚 Book Routes (`/books`)

Base: `/api/v1/books`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Publishes novel (supports `cover_image` file upload, genre & tags) |
| `GET` | `/` | **Public** | Main catalog feed of active novels joined with author & genre |
| `GET` | `/:slug` | **Public** | Detailed novel view by slug |
| `DELETE` | `/:id` | **Protected** | Soft-deletes a novel (requires pen name ownership) |

---

### Book Endpoint Specs:

#### 1. Publish a New Novel (Supports Multipart Uploads)
* **Endpoint:** `POST /api/v1/books`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Content-Type: multipart/form-data` *(or `application/json`)*
* **Form-Data Fields:**
  * `cover_image` *(File, optional)*: Image file streamed to Cloudinary `deckle_books`
  * `title` *(Text, required)*: e.g. "The Shadow Monarch"
  * `slug` *(Text, required)*: e.g. "the-shadow-monarch"
  * `description` *(Text, optional)*: Novel synopsis
  * `persona_id` *(Number, required)*: ID of author persona owned by logged-in user
  * `genre_id` *(Number, optional)*: ID of curated genre
  * `status` *(Text, optional)*: `'ongoing'` | `'completed'` | `'hiatus'`
  * `tags` *(JSON Array or Comma string)*: e.g. `["cultivation", "action"]` or `"cultivation, action"`
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 1,
      "title": "The Shadow Monarch",
      "slug": "the-shadow-monarch",
      "cover_image": "https://res.cloudinary.com/.../deckle_books/cover_image-1700.jpg",
      "persona_id": 2,
      "genre_id": 1,
      "status": "ongoing",
      "tags": ["cultivation", "action"],
      "created_at": "2026-10-04T02:00:00.000Z"
    },
    "message": "Novel published successfully!",
    "success": true
  }
  ```

#### 2. Get Active Catalog Feed
* **Endpoint:** `GET /api/v1/books`
* **Access:** Public
* **Success Response (`200 OK`):**
  Returns novels with author display name, handle, avatar, and genre details:
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "title": "The Shadow Monarch",
        "slug": "the-shadow-monarch",
        "cover_image": "https://...",
        "author_name": "Shadow Weaver",
        "author_handle": "shadow_weaver",
        "author_avatar": "https://...",
        "genre_name": "Progression Fantasy",
        "genre_slug": "progression-fantasy"
      }
    ],
    "message": "Books catalog fetched successfully!",
    "success": true
  }
  ```

---

## 📂 Story Volumes & Arcs (`/volumes`)

Base: `/api/v1/volumes`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/book/:bookId` | **Public** | Lists all volume arcs of a book with chapter counts & word rollups |
| `POST` | `/` | **Protected** | Creates story volume arc (supports `cover_image` upload) |
| `DELETE` | `/:id` | **Protected** | Soft-deletes a volume (sets chapters' `volume_id` to NULL) |

---

### Volume Endpoint Specs:

#### 1. Create a New Volume (Arc)
* **Endpoint:** `POST /api/v1/volumes`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Content-Type: multipart/form-data` *(or `application/json`)*
* **Form-Data Fields:**
  * `cover_image` *(File, optional)*: Image file streamed to Cloudinary `deckle_volumes`
  * `book_id` *(Number, required)*: Novel ID
  * `volume_number` *(Number, required)*: Sequential arc number (e.g. 1, 2)
  * `title` *(Text, required)*: e.g. "Volume 1: The Academy Arc"
  * `description` *(Text, optional)*: Arc synopsis
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 10,
      "book_id": 1,
      "volume_number": 1,
      "title": "Volume 1: The Academy Arc",
      "cover_image": "https://res.cloudinary.com/.../deckle_volumes/cover-1700.jpg"
    },
    "message": "Volume created successfully!",
    "success": true
  }
  ```

#### 2. Get All Volumes of a Book
* **Endpoint:** `GET /api/v1/volumes/book/:bookId`
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 10,
        "volume_number": 1,
        "title": "Volume 1: The Academy Arc",
        "chapters_count": 45,
        "total_words": 135000
      }
    ],
    "message": "Volumes fetched successfully!",
    "success": true
  }
  ```

---

## 📑 Chapter Routes (`/chapters`)

Base: `/api/v1/chapters`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Publishes chapter (supports optional `volume_id`) |
| `GET` | `/book/:bookId/toc` | **Public** | Table of contents grouped with volume headers |
| `GET` | `/book/:bookId/read/:chapterNumber` | **Public** | Full chapter reading text + volume arc title |
| `DELETE` | `/:id` | **Protected** | Soft-deletes chapter |

---

### Chapter Endpoint Specs:

#### 1. Add a New Chapter (Story Arc Continuous Numbering)
* **Endpoint:** `POST /api/v1/chapters`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "book_id": 1,
    "volume_id": 10,
    "chapter_number": 1,
    "title": "Prologue: The Awakening",
    "content": "The rain fell heavily against the cobblestone street...",
    "status": "published"
  }
  ```
  *(Note: If `volume_id` is omitted or null, the chapter renders as standalone/flat).*

#### 2. Table of Contents (TOC)
* **Endpoint:** `GET /api/v1/chapters/book/:bookId/toc`
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "chapter_number": 1,
        "title": "Prologue: The Awakening",
        "words_count": 2250,
        "volume_id": 10,
        "volume_number": 1,
        "volume_title": "Volume 1: The Academy Arc"
      }
    ],
    "message": "Table of contents fetched successfully!",
    "success": true
  }
  ```

---

## 🏷️ Curated Taxonomy & Genres (`/genres`)

Base: `/api/v1/genres`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | **Public** | All active curated genres (LitRPG, Cultivation, Dark Fantasy) |
| `GET` | `/:slug` | **Public** | Single genre details by slug |
| `POST` | `/` | **Protected** | Creates new genre |

---

### Genre Endpoint Specs:

#### 1. Get All Active Genres
* **Endpoint:** `GET /api/v1/genres`
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "name": "Progression Fantasy",
        "slug": "progression-fantasy",
        "description": "Power scaling, cultivation of mastery, and training journeys.",
        "icon": "Zap",
        "display_order": 1
      },
      {
        "id": 2,
        "name": "LitRPG & System",
        "slug": "litrpg",
        "description": "Game mechanics, stat sheets, skill trees, and level-ups.",
        "icon": "Layers",
        "display_order": 2
      }
    ],
    "message": "Genres fetched successfully!",
    "success": true
  }
  ```

---

## 🔖 Bookshelf & Reading Progress (`/reading-history`)

Base: `/api/v1/reading-history`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/progress` | **Protected** | Syncs reader's current chapter # and scroll percentage |
| `POST` | `/shelf` | **Protected** | Adds/moves novel to folder (`Reading`, `Completed`, `Plan to Read`) |
| `GET` | `/shelf` | **Protected** | Fetches reader's bookmarked bookshelf |
| `GET` | `/recent` | **Protected** | Fetches recent reading history across all novels |
| `GET` | `/book/:bookId` | **Protected** | Returns reader's exact bookmark & last read chapter for a book |

---

### Reading History Endpoint Specs:

#### 1. Sync Reading Progress (For 1-Click Resume)
* **Endpoint:** `POST /api/v1/reading-history/progress`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "book_id": 1,
    "chapter_id": 12,
    "chapter_number": 12,
    "scroll_percentage": 78.5
  }
  ```

#### 2. Update Bookshelf Status
* **Endpoint:** `POST /api/v1/reading-history/shelf`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "book_id": 1,
    "is_bookmarked": true,
    "folder": "Reading",
    "is_favorite": true
  }
  ```
  *(Folders allowed: `'Reading'`, `'Completed'`, `'Plan to Read'`, `'On Hold'`, `'Dropped'`)*

#### 3. Fetch Bookshelf
* **Endpoint:** `GET /api/v1/reading-history/shelf?folder=Reading`
* **Access:** Protected (`verifyJWT`)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "book_id": 1,
        "title": "The Shadow Monarch",
        "slug": "the-shadow-monarch",
        "cover_image": "https://...",
        "last_chapter_number": 12,
        "scroll_percentage": 78.5,
        "folder": "Reading",
        "total_chapters": 45
      }
    ],
    "message": "Bookshelf fetched successfully!",
    "success": true
  }
  ```

---

## 📜 Chapter Lore & Margin Notes (`/lore`)

Base: `/api/v1/lore`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/chapter/:chapterId` | **Public** | Fetches all margin annotations/glossary terms for a chapter |
| `POST` | `/chapter/:chapterId` | **Protected** | Author creates a lore annotation for reader hover tooltips |
| `DELETE` | `/:id` | **Protected** | Author deletes a lore note by ID |

---

### Chapter Lore Endpoint Specs:

#### 1. Get Chapter Lore (Reader Tooltips)
* **Endpoint:** `GET /api/v1/lore/chapter/:chapterId` (e.g. `/api/v1/lore/chapter/1`)
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "chapter_id": 1,
        "term": "Beyonder",
        "definition": "A human who has consumed a sequence potion to attain supernatural pathways.",
        "order_index": 0
      }
    ],
    "message": "Chapter lore fetched successfully!",
    "success": true
  }
  ```

#### 2. Create Lore Annotation
* **Endpoint:** `POST /api/v1/lore/chapter/:chapterId`
* **Access:** Protected (`verifyJWT`)
* **Request Body (JSON):**
  ```json
  {
    "term": "Qi Tribulation",
    "definition": "The celestial lightning strike that tests a cultivator attempting to break into the Core Formation realm.",
    "order_index": 1
  }
  ```
