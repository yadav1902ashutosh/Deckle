# 📖 Deckle: Backend Requirements Specification (V2)

## 1. System Overview & Architectural Mandates
Deckle is a high-performance serial web novel platform with a strict decoupled client-server architecture:
1. **Zero Mock Fallbacks on Production Screens:** Every screen must fetch live relational data from the backend REST API with loading states and empty placeholders.
2. **System-Defined Role Model:** Roles (`developer`, `admin`, `writer`, `reader`) are system-governed and immutable by client requests. A reader is automatically promoted to writer status upon novel publication.
3. **Decoupled Identity Hierarchy:**
   - **Root Parent User (`users`):** Governs master login, email credentials, security settings, active device sessions, and 2FA.
   - **Child Personas (`personas`):** Author pen names and reader aliases under the master account (YouTube/AO3 channel model). Public novels, comments, and chapter releases bind to `persona_id`.
4. **CORS & Multi-Persona Headers:** The backend supports the `X-Persona-Id` header to allow client requests to act on behalf of specific active author pen names.

---

## 2. Database Schema Extensions (V2)

### 2.1 User Settings & Ergonomics (`user_settings`)
Persists reading typography, theme preferences, and reading ergonomics per parent account.
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(30) DEFAULT 'parchment',
  font_family VARCHAR(50) DEFAULT 'Newsreader',
  font_size INT DEFAULT 18,
  line_height NUMERIC(3, 2) DEFAULT 1.60,
  content_width VARCHAR(20) DEFAULT 'normal',
  bionic_reading BOOLEAN DEFAULT FALSE,
  sound_effects BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Active Device Sessions (`user_sessions`)
Tracks user terminals for security review and remote session revocation.
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(120) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 User Daily Reading Logs (`user_reading_logs`)
Daily aggregates used for 7-day velocity charts and weekly marathon goals.
```sql
CREATE TABLE IF NOT EXISTS user_reading_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_date DATE NOT NULL,
  words_read INT DEFAULT 0,
  minutes_read INT DEFAULT 0,
  UNIQUE(user_id, read_date)
);
```

### 2.4 Community Discourse (`forum_threads`, `forum_replies`, `thread_upvotes`)
Powers reader circles, theorycrafting, and scholar rankings.
```sql
CREATE TABLE IF NOT EXISTS forum_threads (
  id SERIAL PRIMARY KEY,
  persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  book_id INT REFERENCES books(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'theories',
  upvotes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  thread_id INT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  parent_reply_id INT REFERENCES forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thread_upvotes (
  id SERIAL PRIMARY KEY,
  thread_id INT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(thread_id, persona_id)
);
```

### 2.5 Author Studio & Channel (`persona_subscriptions`, `persona_announcements`)
Enables YouTube-style channel subscriptions and author broadcast announcements.
```sql
CREATE TABLE IF NOT EXISTS persona_subscriptions (
  id SERIAL PRIMARY KEY,
  subscriber_persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  author_persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subscriber_persona_id, author_persona_id)
);

CREATE TABLE IF NOT EXISTS persona_announcements (
  id SERIAL PRIMARY KEY,
  persona_id INT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. API Endpoints Specification (V2)

### 3.1 Bookshelf & Library (`/api/v1/library`)
Base: `/api/v1/library`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Fetches bookshelf novels with reading progress, bookmarks, and folder filter |
| `GET` | `/stats` | Protected | Aggregated library stats (total books, chapters read, streak days, total hours) |
| `GET` | `/goal` | Protected | Weekly reading goal progress (minutes read vs target) |
| `POST` | `/batch-move` | Protected | Move selected bookshelf items to target folder (`Reading`, `Completed`, `Want to Read`) |
| `POST` | `/batch-remove` | Protected | Remove selected bookshelf items |
| `DELETE` | `/clear` | Protected | Clears all reading history for the active persona |

### 3.2 Community Discourse (`/api/v1/community`)
Base: `/api/v1/community`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/threads` | Public | Paginated discussion threads feed with `category` and `sort` (`latest`, `upvotes`) |
| `POST` | `/threads` | Protected | Create a new community discussion thread |
| `POST` | `/threads/:id/upvote` | Protected | Toggle upvote for a discussion thread |
| `GET` | `/top-scholars` | Public | Leaderboard of top community contributors based on upvotes and replies |

### 3.3 Author Studio (`/api/v1/studio`)
Base: `/api/v1/studio`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/serials` | Protected | Author's active serial works with draft counts, word counts, and analytics |
| `GET` | `/serials/:bookId/chapters` | Protected | Fetch all chapters and drafts for author studio view |
| `GET` | `/chapters/:id` | Protected | Fetch a single studio chapter draft by ID |
| `POST` | `/chapters` | Protected | Create a new studio chapter (draft, scheduled, or published) |
| `PATCH` | `/chapters/:id` | Protected | Update an existing studio chapter or draft |
| `DELETE` | `/chapters/:id` | Protected | Soft-delete a studio chapter or draft |
| `GET` | `/analytics/:bookId` | Protected | 30-day readership impressions and subscriber trajectory |
| `POST` | `/subscribe/:id` | Protected | Toggle channel subscription for an author persona |
| `GET` | `/announcements/:handle` | Public | Channel transmission announcements feed |
| `POST` | `/announcements` | Protected | Post a new channel transmission announcement |

### 3.4 Story Volumes & Arcs (`/api/v1/volumes`)
Base: `/api/v1/volumes`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/book/:bookId` | Public | Get all story arcs and chapter counts for a novel |
| `POST` | `/` | Protected | Create a new consecutive volume arc (`volume_number` strictly auto-increments or enforces consecutive sequence) |
| `DELETE` | `/:id` | Protected | Soft-delete a story volume arc |

### 3.5 Master Account & Settings (`/api/v1/users`)
Base: `/api/v1/users`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/settings` | Protected | Get master account reading typography & ergonomics settings |
| `PATCH` | `/settings` | Protected | Update reading typography & ergonomics settings |
| `GET` | `/reading-velocity` | Protected | 7-day daily reading velocity (words and minutes read per day) |
| `GET` | `/genre-affinity` | Protected | Literary genre breakdown and percentages from reading history |
| `GET` | `/sessions` | Protected | List active logged-in device sessions |
| `DELETE` | `/sessions/:id` | Protected | Revoke a remote device session |
| `POST` | `/sessions/revoke-others` | Protected | Sign out all other sessions across devices |
| `POST` | `/2fa/toggle` | Protected | Toggle two-factor authentication flag for master account |

### 3.5 Books & Catalog (`/api/v1/books`)
Base: `/api/v1/books`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Server-side filtered & paginated novel feed (`genre`, `status`, `sort`, `page`, `limit`) |
| `GET` | `/featured` | Public | Editorial spotlight featured novels |
| `GET` | `/rankings` | Public | Power stone rankings and popularity leaderboards |
| `GET` | `/trending-tags` | Public | Trending literary motifs and tags |
| `GET` | `/genres` | Public | Genre list with live published serial counts |
| `GET` | `/:slug/recommendations` | Public | Algorithmic book recommendations |
| `POST` | `/:slug/power-stones` | Protected | Cast daily power stones vote for a novel |
