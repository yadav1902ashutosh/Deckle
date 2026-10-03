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

## 👤 User & Authentication Routes (`/users`)

Base: `/api/v1/users`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | **Public** | Registers a new user account & generates their initial default Persona |
| `POST` | `/login` | **Public** | Authenticates via email/username & password. Returns tokens & personas |
| `POST` | `/logout` | **Protected** | Clears refresh token in DB & wipes auth cookies |
| `GET` | `/current-user` | **Protected** | Fetches the logged-in user profile & all their owned personas |

---

### Detailed Endpoint Specs:

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
        "role": "writer",
        "gender": "male",
        "dob": "2000-05-15T00:00:00.000Z",
        "created_at": "2026-10-02T12:00:00.000Z"
      },
      "defaultPersona": {
        "id": 1,
        "user_id": 1,
        "display_name": "Alex Johnson",
        "handle": "alex_writer",
        "bio": "Hello, I'm Alex Johnson! Welcome to my reading space.",
        "avatar_url": "https://via.placeholder.com/150",
        "is_default": true
      }
    },
    "message": "User registered successfully with default persona!",
    "success": true
  }
  ```

---

#### 2. Login User
* **Endpoint:** `POST /api/v1/users/login`
* **Access:** Public
* **Request Body (Accepts Email OR Username):**
  ```json
  {
    "email": "alex@example.com",
    "password": "mySecurePassword123"
  }
  ```
  *(OR)*
  ```json
  {
    "username": "alex_writer",
    "password": "mySecurePassword123"
  }
  ```
* **Cookies Set:** `accessToken` (15m), `refreshToken` (7d)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": {
        "id": 1,
        "full_name": "Alex Johnson",
        "username": "alex_writer",
        "email": "alex@example.com",
        "role": "writer"
      },
      "personas": [
        {
          "id": 1,
          "display_name": "Alex Johnson",
          "handle": "alex_writer",
          "is_default": true
        }
      ],
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
    },
    "message": "User logged in successfully!",
    "success": true
  }
  ```

---

#### 3. Logout User
* **Endpoint:** `POST /api/v1/users/logout`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {},
    "message": "User logged out successfully!",
    "success": true
  }
  ```

---

#### 4. Get Current User
* **Endpoint:** `GET /api/v1/users/current-user`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": {
        "id": 1,
        "full_name": "Alex Johnson",
        "username": "alex_writer",
        "email": "alex@example.com",
        "role": "writer"
      },
      "personas": [
        {
          "id": 1,
          "display_name": "Alex Johnson",
          "handle": "alex_writer",
          "is_default": true
        }
      ]
    },
    "message": "Current user profile fetched successfully!",
    "success": true
  }
  ```

---

## 🎭 Persona Routes (`/personas`)

Base: `/api/v1/personas`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Creates a new pen name under the logged-in user |
| `GET` | `/my` | **Protected** | Fetches all pen names owned by the logged-in user |
| `GET` | `/:handle` | **Public** | Public author profile page (bio, avatar, published books) |

---

### Detailed Endpoint Specs:

#### 1. Create a New Persona (Pen Name)
* **Endpoint:** `POST /api/v1/personas`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Request Body (JSON):**
  ```json
  {
    "display_name": "Shadow Weaver",
    "handle": "shadow_weaver",
    "bio": "Writer of dark fantasy and horror.",
    "avatar_url": "https://via.placeholder.com/150",
    "banner_url": "https://via.placeholder.com/400x150"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 2,
      "user_id": 1,
      "display_name": "Shadow Weaver",
      "handle": "shadow_weaver",
      "bio": "Writer of dark fantasy and horror.",
      "avatar_url": "https://via.placeholder.com/150",
      "banner_url": "https://via.placeholder.com/400x150",
      "is_default": false,
      "created_at": "2026-10-02T13:00:00.000Z"
    },
    "message": "New pen name created successfully!",
    "success": true
  }
  ```

---

#### 2. Get My Personas (Active Switcher)
* **Endpoint:** `GET /api/v1/personas/my`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "display_name": "Alex Johnson",
        "handle": "alex_writer",
        "is_default": true,
        "avatar_url": "https://via.placeholder.com/150"
      },
      {
        "id": 2,
        "display_name": "Shadow Weaver",
        "handle": "shadow_weaver",
        "is_default": false,
        "avatar_url": "https://via.placeholder.com/150"
      }
    ],
    "message": "User personas fetched successfully!",
    "success": true
  }
  ```

---

#### 3. Get Public Persona Profile (By Handle)
* **Endpoint:** `GET /api/v1/personas/:handle` (e.g. `/api/v1/personas/shadow_weaver`)
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "persona": {
        "id": 2,
        "display_name": "Shadow Weaver",
        "handle": "shadow_weaver",
        "bio": "Writer of dark fantasy and horror.",
        "avatar_url": "https://via.placeholder.com/150",
        "banner_url": "https://via.placeholder.com/400x150"
      },
      "books": [
        {
          "id": 10,
          "title": "The Whispering Tombs",
          "slug": "the-whispering-tombs",
          "status": "ongoing",
          "views_count": 1420
        }
      ]
    },
    "message": "Author profile fetched successfully!",
    "success": true
  }
  ```

---

---

## 📚 Book Routes (`/books`)

Base: `/api/v1/books`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Publishes a novel under a persona (validates persona ownership) |
| `GET` | `/` | **Public** | Main catalog feed of active novels with author pen names & avatars |
| `GET` | `/:slug` | **Public** | Detailed novel view by slug (includes full synopsis & author details) |
| `DELETE` | `/:id` | **Protected** | Soft-deletes a novel (requires pen name ownership) |

---

### Detailed Endpoint Specs:

#### 1. Publish a New Novel
* **Endpoint:** `POST /api/v1/books`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Request Body (JSON):**
  ```json
  {
    "title": "The Shadow Monarch",
    "slug": "the-shadow-monarch",
    "description": "In a world overrun by portals, one weak hunter awakens an army of shadows.",
    "cover_image": "https://via.placeholder.com/300x450",
    "persona_id": 2,
    "status": "ongoing",
    "tags": ["fantasy", "action", "level-up"]
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 1,
      "title": "The Shadow Monarch",
      "slug": "the-shadow-monarch",
      "description": "In a world overrun by portals, one weak hunter awakens an army of shadows.",
      "cover_image": "https://via.placeholder.com/300x450",
      "persona_id": 2,
      "status": "ongoing",
      "views_count": 0,
      "tags": ["fantasy", "action", "level-up"],
      "created_at": "2026-10-02T13:30:00.000Z",
      "updated_at": "2026-10-02T13:30:00.000Z",
      "deleted_at": null
    },
    "message": "Novel published successfully!",
    "success": true
  }
  ```

---

#### 2. Get Active Books Feed
* **Endpoint:** `GET /api/v1/books`
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "title": "The Shadow Monarch",
        "slug": "the-shadow-monarch",
        "description": "In a world overrun by portals...",
        "cover_image": "https://via.placeholder.com/300x450",
        "persona_id": 2,
        "status": "ongoing",
        "views_count": 0,
        "tags": ["fantasy", "action", "level-up"],
        "created_at": "2026-10-02T13:30:00.000Z",
        "author_name": "Shadow Weaver",
        "author_handle": "shadow_weaver",
        "author_avatar": "https://via.placeholder.com/150"
      }
    ],
    "message": "Books catalog fetched successfully!",
    "success": true
  }
  ```

---

#### 3. Get Novel Details by Slug
* **Endpoint:** `GET /api/v1/books/:slug` (e.g. `/api/v1/books/the-shadow-monarch`)
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "id": 1,
      "title": "The Shadow Monarch",
      "slug": "the-shadow-monarch",
      "description": "In a world overrun by portals, one weak hunter awakens an army of shadows.",
      "cover_image": "https://via.placeholder.com/300x450",
      "persona_id": 2,
      "status": "ongoing",
      "views_count": 0,
      "tags": ["fantasy", "action", "level-up"],
      "created_at": "2026-10-02T13:30:00.000Z",
      "author_name": "Shadow Weaver",
      "author_handle": "shadow_weaver",
      "author_avatar": "https://via.placeholder.com/150",
      "author_bio": "Writer of dark fantasy and horror."
    },
    "message": "Novel details fetched successfully!",
    "success": true
  }
  ```

---

#### 4. Soft Delete a Novel
* **Endpoint:** `DELETE /api/v1/books/:id` (e.g. `/api/v1/books/1`)
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Request Body (JSON):**
  ```json
  {
    "persona_id": 2
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "id": 1,
      "title": "The Shadow Monarch",
      "deleted_at": "2026-10-02T13:45:00.000Z"
    },
    "message": "Novel deleted successfully!",
    "success": true
  }
  ```

---

---

## 📑 Chapter Routes (`/chapters`)

Base: `/api/v1/chapters`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Protected** | Adds a new chapter to a novel (verifies author persona ownership) |
| `GET` | `/book/:bookId/toc` | **Public** | Table of contents (fast query: titles & word counts only) |
| `GET` | `/book/:bookId/read/:chapterNumber` | **Public** | Reads a single published chapter (with full text content) |
| `DELETE` | `/:id` | **Protected** | Soft-deletes a chapter (requires novel ownership) |

---

### Detailed Endpoint Specs:

#### 1. Add a New Chapter
* **Endpoint:** `POST /api/v1/chapters`
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Request Body (JSON):**
  ```json
  {
    "book_id": 1,
    "chapter_number": 1,
    "title": "Prologue: The Awakening",
    "content": "The rain fell heavily against the cobblestone street. Alone in the alleyway, Jin felt a strange pulsing warmth inside his chest...",
    "status": "published"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 1,
      "book_id": 1,
      "chapter_number": 1,
      "title": "Prologue: The Awakening",
      "content": "The rain fell heavily against the cobblestone street...",
      "words_count": 22,
      "status": "published",
      "published_at": "2026-10-02T14:00:00.000Z",
      "created_at": "2026-10-02T14:00:00.000Z",
      "updated_at": "2026-10-02T14:00:00.000Z",
      "deleted_at": null
    },
    "message": "Chapter created successfully!",
    "success": true
  }
  ```

---

#### 2. Get Novel Table of Contents (TOC)
* **Endpoint:** `GET /api/v1/chapters/book/:bookId/toc` (e.g. `/api/v1/chapters/book/1/toc`)
* **Access:** Public
* **Performance Note:** Selectively excludes heavy text content (`content`) to transfer only lightweight metadata across thousands of chapters.
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
        "published_at": "2026-10-02T14:00:00.000Z"
      },
      {
        "id": 2,
        "chapter_number": 2,
        "title": "Chapter 2: The First Dungeon",
        "words_count": 3100,
        "published_at": "2026-10-02T15:30:00.000Z"
      }
    ],
    "message": "Table of contents fetched successfully!",
    "success": true
  }
  ```

---

#### 3. Read a Single Published Chapter
* **Endpoint:** `GET /api/v1/chapters/book/:bookId/read/:chapterNumber` (e.g. `/api/v1/chapters/book/1/read/1`)
* **Access:** Public
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "id": 1,
      "book_id": 1,
      "chapter_number": 1,
      "title": "Prologue: The Awakening",
      "content": "The rain fell heavily against the cobblestone street...",
      "words_count": 2250,
      "status": "published",
      "published_at": "2026-10-02T14:00:00.000Z",
      "created_at": "2026-10-02T14:00:00.000Z"
    },
    "message": "Chapter content fetched successfully!",
    "success": true
  }
  ```

---

#### 4. Soft Delete a Chapter
* **Endpoint:** `DELETE /api/v1/chapters/:id` (e.g. `/api/v1/chapters/1`)
* **Access:** Protected (`verifyJWT`)
* **Headers:** `Authorization: Bearer <accessToken>` (or cookie)
* **Request Body (JSON):**
  ```json
  {
    "book_id": 1
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "id": 1,
      "chapter_number": 1,
      "title": "Prologue: The Awakening",
      "deleted_at": "2026-10-02T14:15:00.000Z"
    },
    "message": "Chapter deleted successfully!",
    "success": true
  }
  ```

