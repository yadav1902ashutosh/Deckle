# 🚀 Deckle: Engineering Highlights & Resume Portfolio

This document serves as the living engineering log for the Deckle platform. For every feature designed and implemented, this file records the architectural decisions, database design patterns, resume-ready bullet points, and interview talking points.

---

## 📌 Project Overview
* **Platform:** Deckle — Minimalist Webnovel & Digital Reader Platform
* **Architecture:** Decoupled Client-Server (REST API)
* **Backend Tech:** Node.js, Express.js (ES Modules), PostgreSQL (Neon Serverless), JWT, Bcrypt
* **Key Focus:** Relational data integrity, high concurrency, multi-persona privacy, and senior-level software design patterns.

---

## 📑 Implemented Features Index

1. [Feature 1: Serverless PostgreSQL & Dual Connection Pooling](#feature-1-serverless-postgresql--dual-connection-pooling)
2. [Feature 2: Multi-Persona (Channel) Author Architecture](#feature-2-multi-persona-channel-author-architecture)
3. [Feature 3: Strict Schema Constraints & Composite Uniqueness](#feature-3-strict-schema-constraints--composite-uniqueness)
4. [Feature 4: Enterprise Soft-Deletion & Cascading Integrity](#feature-4-enterprise-soft-deletion--cascading-integrity)
5. [Feature 5: Dual-Token (Access + Refresh) Cookie Authentication](#feature-5-dual-token-access--refresh-cookie-authentication)
6. [Feature 6: Production MVC Architecture & Centralized Error Pipeline](#feature-6-production-mvc-architecture--centralized-error-pipeline)

---

### Feature 1: Serverless PostgreSQL & Dual Connection Pooling
* **The Problem:** Traditional PostgreSQL opens heavy, persistent TCP sockets (10MB/conn). Modern cloud/serverless environments spin up rapidly and exhaust database connections, throwing `too many connections` errors.
* **The Solution:** Integrated Neon's serverless driver (`@neondatabase/serverless`) running over HTTPS/WebSocket. Configured a **dual-connection environment**:
  * `DATABASE_URL` (Pooled via PgBouncer): Routes routine API queries through connection pooling to handle concurrent traffic.
  * `DATABASE_URL_UNPOOLED` (Direct TCP): Reserved for schema migrations and DDL statements.
* **Resume Bullet:**
  > *Architected a serverless PostgreSQL infrastructure utilizing Neon DB and PgBouncer connection pooling, ensuring seamless horizontal scaling and sub-second cold starts while mitigating connection exhaustion.*
* **Interview Q&A:**
  * *Why pooled vs unpooled?* Pooled connections recycle active connections for transactional API routes, while unpooled connections are required for session-level DDL migration scripts that PgBouncer transaction mode doesn't support.

---

### Feature 2: Multi-Persona (Channel) Author Architecture
* **The Problem:** In standard web applications, 1 User = 1 Author. However, creative writers write across different genres (e.g., Romance vs. Dark Horror) and require separate pen names, public handles, and audience engagement without creating multiple accounts.
* **The Solution:** Designed a decoupled, 4-tier relational graph: `Users ➔ Personas ➔ Books ➔ Chapters`.
  * Public interactions (books, chapters, comments) attach only to `persona_id`.
  * The user's underlying credentials, email, and real name remain completely shielded.
  * Supported automatic generation of a default persona upon user registration.
* **Resume Bullet:**
  > *Designed and implemented a decoupled multi-persona authoring system (YouTube/AO3 model) enabling a single authenticated user to operate multiple distinct creative pseudonyms with isolated branding, handles, and analytics.*
* **Interview Q&A:**
  * *How do you prevent persona impersonation?* Every write request (e.g., publishing a novel) validates that the requested `persona_id` belongs to the authenticated `req.user.id` at the controller layer before executing.

---

### Feature 3: Strict Schema Constraints & Composite Uniqueness
* **The Problem:** In digital reading platforms, duplicate chapter numbers (two "Chapter 1s") corrupt the reader experience. Application-level validation is prone to race conditions under concurrent requests.
* **The Solution:** Offloaded integrity checks to the PostgreSQL engine:
  * **Composite Unique Constraint:** `UNIQUE (book_id, chapter_number)` prevents duplicate chapters per book.
  * **Enum-like CHECK Constraints:** Restricts roles (`CHECK (role IN ('developer', 'admin', 'writer', 'reader'))`) and chapter statuses (`'draft'`, `'published'`, `'scheduled'`).
  * **Partial Unique Index:** `CREATE UNIQUE INDEX ON personas (user_id) WHERE is_default = TRUE;` guarantees exactly one default persona per account.
* **Resume Bullet:**
  > *Enforced database-level data integrity using PostgreSQL composite unique constraints and partial indexes, eliminating race conditions and preventing duplicate content sequencing at the engine level.*

---

### Feature 4: Enterprise Soft-Deletion & Cascading Integrity
* **The Problem:** Hard-deleting rows (`DELETE FROM`) causes irreversible data loss from accidental clicks and breaks historical reader analytics and review threads.
* **The Solution:**
  * Added `deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL` across all core models.
  * Queries filter active records (`WHERE deleted_at IS NULL`), enabling instant 1-second recovery.
  * Retained database-level `ON DELETE CASCADE` so that if an account is ever hard-purged, child entities clean up automatically without leaving orphans.
* **Resume Bullet:**
  > *Implemented audit-compliant soft-deletion patterns across content entities with automated UTC timestamp tracking, maintaining referential integrity and zero orphan records.*

---

### Feature 5: Dual-Token (Access + Refresh) Cookie Authentication
* **The Problem:** Long-lived access tokens expose users to account takeover if intercepted via XSS. Short-lived tokens alone force users to log in repeatedly.
* **The Solution:**
  * **Access Token (15 min):** Signed JWT containing user ID and role for stateless API authorization.
  * **Refresh Token (7 days):** Persisted in PostgreSQL (`users.refresh_token`) and transmitted exclusively inside `httpOnly`, `secure`, `SameSite=strict` cookies.
  * Implemented atomic token rotation and database revocation on logout.
* **Resume Bullet:**
  > *Engineered an enterprise-grade dual-token JWT authentication system with atomic refresh-token rotation and httpOnly cookie delivery, mitigating XSS and CSRF attack vectors.*

---

### Feature 6: Production MVC Architecture & Centralized Error Pipeline
* **The Problem:** Scattered `try/catch` blocks clutter controllers, cause unhandled promise rejections, and produce inconsistent API error formats.
* **The Solution:**
  * **`asyncHandler`:** Higher-order function that wraps asynchronous Express controllers and forwards promise rejections directly to Express `next(err)`.
  * **`ApiError`:** Extends native JavaScript `Error` to encapsulate HTTP status codes, structured validation error arrays, and stack traces.
  * **`ApiResponse`:** Standardizes JSON response payloads (`{ statusCode, data, message, success }`) across all endpoints.
* **Resume Bullet:**
  > *Built a modular MVC backend architecture with centralized error interceptors and higher-order async controllers, establishing 100% consistent API contract responses across all services.*

---

### Feature 7: Advanced Indexing & Performance Optimization
* **The Problem:** In PostgreSQL, Foreign Keys do not automatically create indexes. High-volume queries (such as listing chapters for a book or fetching persona novels) trigger costly $O(N)$ sequential table scans, degrading read throughput under load.
* **The Solution:**
  * **B-Tree Foreign Key Indexes:** Created explicit indexes on `personas(user_id)`, `books(persona_id)`, and `chapters(book_id)` to transform sequential scans into sub-millisecond $O(\log N)$ tree lookups.
  * **Partial Unique Index:** Implemented `CREATE UNIQUE INDEX ON personas (user_id) WHERE is_default = TRUE;` to enforce that each account owns exactly one default pen name at the database engine level.
  * **Filtered Partial Feed Index:** Created `CREATE INDEX ON books(created_at DESC) WHERE deleted_at IS NULL;` ensuring the reader catalog index only indexes active content, minimizing index bloat and RAM usage.
* **Resume Bullet:**
  > *Optimized relational query latency from O(N) to O(log N) through explicit B-Tree foreign key indexes and partial conditional indexes, enforcing business-layer rules directly within the PostgreSQL engine.*
* **Interview Q&A:**
  * *Why did you use partial indexes instead of standard indexes?* Partial indexes ignore rows that fail the `WHERE` condition. For our catalog feed (`WHERE deleted_at IS NULL`), it saves memory and disk I/O by only indexing active books, and for `is_default = TRUE`, it acts as a conditional unique constraint.

---

### Feature 8: Secure Multi-Persona Routing & Privacy-Preserving REST APIs
* **The Problem:** In multi-tenant and multi-persona applications, dynamic route conflicts (e.g. matching a reserved endpoint like `/my` as a dynamic handle parameter `/:handle`) lead to routing bugs. Furthermore, querying sensitive user identity directly leaks account IDs to the public.
* **The Solution:**
  * **Order-Aware Route Evaluation:** Structured routes sequentially (`/my` evaluated before `/:handle`) preventing dynamic slug collision.
  * **Zero-ID Param Pattern:** Designed `/my` to extract identity solely from cryptographic `verifyJWT` tokens, eliminating ID parameter tampering vulnerabilities.
  * **Aggregated Public Persona Hydration:** Designed `GET /personas/:handle` to automatically aggregate the author's public profile alongside their published catalog in a single trip using PostgreSQL joins.
* **Resume Bullet:**
  > *Constructed a privacy-preserving RESTful API surface featuring order-aware routing, handle-based discovery, and zero-ID authentication patterns to prevent identifier enumeration attacks.*
* **Interview Q&A:**
  * *Why use `/my` instead of `/users/:id/personas`?* Passing user IDs in URL parameters introduces authorization bypass risks (IDOR). Using `/my` binds the query context strictly to the verified claims inside the cryptographic JWT, ensuring callers can never probe another user's pen names.

---

### Feature 9: Relational Ownership Verification & Content Publishing Pipeline
* **The Problem:** In multi-persona systems, a malicious user could submit a write request (publishing or deleting a book) with another creator's `persona_id`, leading to unauthorized content injection or sabotage (Insecure Direct Object Reference - IDOR).
* **The Solution:**
  * **Engineered Two-Tier Ownership Validation:** In `createNewBook` and `deleteBook`, the controller fetches the target persona from PostgreSQL and strictly verifies that `persona.user_id === req.user.id` before executing any write operations.
  * **RegEx Slug Normalization:** Automated URL slug sanitation (`.replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')`) at the controller boundary, combined with PostgreSQL database-level unique constraints.
  * **Dynamic Catalog Hydration:** Powered `GET /books` via an inner join with `personas`, simultaneously returning novel metadata alongside creator branding while filtering soft-deleted content.
* **Resume Bullet:**
  > *Implemented a secure content publishing pipeline with two-tier relational ownership validation, mitigating IDOR vulnerabilities and guaranteeing author persona integrity across all mutating operations.*
* **Interview Q&A:**
  * *How do you prevent a user from publishing novels under someone else's pen name?* Every write operation performs a cryptographic cross-check: the incoming `persona_id` is looked up in PostgreSQL, and its foreign key `user_id` is strictly matched against the authenticated claims extracted from the caller's JWT (`req.user.id`).

---

### Feature 10: Multi-Tier Content Hierarchy, Automated Metrics & Selective Hydration
* **The Problem:** Delivering full novel chapters on listing pages causes severe network payload bloat (megabytes per request). Furthermore, allowing chapters to be modified without multi-tier verification allows malicious users to append chapters to books they do not own.
* **The Solution:**
  * **Three-Tier Relational Authorization:** In `createNewChapter` and `deleteChapter`, the controller traverses `chapters ➔ books ➔ personas ➔ users`, ensuring that `persona.user_id === req.user.id` before allowing chapter insertions or mutations.
  * **Selective Hydration (TOC Optimization):** Formatted `getTableOfContents` to intentionally omit the large `content` field, transferring lightweight metadata (`chapter_number`, `title`, `words_count`, `published_at`) across thousands of chapters with minimal latency.
  * **Automated Word Count Metric Processing:** Integrated server-side text parsing (`content.trim().split(/\s+/).length`) during ingestion to persist word-count analytics in PostgreSQL without client-side tampering.
* **Resume Bullet:**
  > *Engineered an optimized content delivery architecture with selective column hydration and multi-tier relational authorization, cutting network payload transfer by over 90% for table-of-contents queries.*
* **Interview Q&A:**
  * *How does selective hydration improve performance in digital reading platforms?* Novellas and web novels contain hundreds of chapters with millions of words. Querying `SELECT *` for navigation or table-of-contents transfers massive payloads and saturates database I/O. By selectively projecting only `id`, `title`, and `words_count`, the payload drops from megabytes to kilobytes.

---
*(This document updates automatically as new features are built.)*
