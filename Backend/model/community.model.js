import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createCommunityTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS forum_threads (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER REFERENCES personas(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'all',
        tags TEXT[] DEFAULT '{}',
        upvotes_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER REFERENCES personas(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        upvotes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS thread_upvotes (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (thread_id, user_id)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_forum_threads_book ON forum_threads(book_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
    `;
  } catch (error) {
    throw new ApiError(500, `Database error initializing community tables: ${error.message}`);
  }
}

// 2. GET FORUM THREADS (With book and author join)
export async function findThreads({ category = null, book_id = null, limit = 20 } = {}) {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    const result = await sql`
      SELECT 
        t.id,
        t.title,
        t.content,
        t.category,
        t.tags,
        t.upvotes_count AS upvotes,
        t.replies_count AS replies,
        t.created_at,
        b.title AS book,
        b.slug AS "bookSlug",
        p.display_name AS author,
        p.avatar_url AS "authorAvatar",
        'Tier 5 Scholar' AS "authorTier",
        SUBSTRING(t.content FROM 1 FOR 180) AS snippet
      FROM forum_threads t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN personas p ON t.persona_id = p.id
      WHERE t.deleted_at IS NULL
        AND (${category}::text IS NULL OR ${category} = 'all' OR LOWER(t.category) = LOWER(${category}))
        AND (${book_id}::int IS NULL OR t.book_id = ${book_id})
      ORDER BY t.created_at DESC
      LIMIT ${limitNum};
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching forum threads: ${error.message}`);
  }
}

// 3. CREATE FORUM THREAD
export async function createThread({ book_id, user_id, persona_id, title, content, category, tags }) {
  try {
    const result = await sql`
      INSERT INTO forum_threads (
        book_id,
        user_id,
        persona_id,
        title,
        content,
        category,
        tags
      )
      VALUES (
        ${book_id || null},
        ${user_id},
        ${persona_id || null},
        ${title},
        ${content},
        ${category || 'all'},
        ${tags || []}
      )
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error creating thread: ${error.message}`);
  }
}

// 4. UPVOTE THREAD
export async function upvoteThread(thread_id, user_id) {
  try {
    // Check if already upvoted
    const existing = await sql`
      SELECT id FROM thread_upvotes WHERE thread_id = ${thread_id} AND user_id = ${user_id} LIMIT 1;
    `;

    if (existing.length > 0) {
      // Toggle off
      await sql`DELETE FROM thread_upvotes WHERE thread_id = ${thread_id} AND user_id = ${user_id};`;
      const updated = await sql`
        UPDATE forum_threads
        SET upvotes_count = GREATEST(0, upvotes_count - 1)
        WHERE id = ${thread_id}
        RETURNING upvotes_count;
      `;
      return { upvoted: false, upvotes_count: updated[0]?.upvotes_count || 0 };
    } else {
      // Insert upvote
      await sql`
        INSERT INTO thread_upvotes (thread_id, user_id) VALUES (${thread_id}, ${user_id});
      `;
      const updated = await sql`
        UPDATE forum_threads
        SET upvotes_count = upvotes_count + 1
        WHERE id = ${thread_id}
        RETURNING upvotes_count;
      `;
      return { upvoted: true, upvotes_count: updated[0]?.upvotes_count || 1 };
    }
  } catch (error) {
    throw new ApiError(500, `Database error upvoting thread: ${error.message}`);
  }
}

// 5. GET TOP SCHOLARS (Community Leaderboard)
export async function getTopScholars() {
  try {
    const result = await sql`
      SELECT 
        p.display_name AS name,
        p.avatar_url,
        'Tier ' || (FLOOR(RANDOM() * 4) + 5)::text || ' Scholar' AS tier,
        (COUNT(t.id) * 150 + COALESCE(SUM(t.upvotes_count), 0) * 10)::text || ' pts' AS karma
      FROM personas p
      JOIN forum_threads t ON t.persona_id = p.id
      GROUP BY p.id, p.display_name, p.avatar_url
      ORDER BY karma DESC
      LIMIT 5;
    `;

    // Fallback scholars if forum is fresh
    if (result.length === 0) {
      return [
        { name: "GrandmasterVance", tier: "Tier 8 Elder", karma: "14,820 pts", rank: 1 },
        { name: "MoonlightScholar", tier: "Tier 6 Scholar", karma: "9,420 pts", rank: 2 },
        { name: "DaoistPotato", tier: "Tier 5 Reader", karma: "6,810 pts", rank: 3 },
        { name: "CelestialInk", tier: "Tier 5 Reader", karma: "4,210 pts", rank: 4 },
      ];
    }

    return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
  } catch (error) {
    throw new ApiError(500, `Database error fetching top scholars: ${error.message}`);
  }
}

// 6. FIND THREAD BY ID
export async function findThreadById(id) {
  try {
    const result = await sql`
      SELECT 
        t.id,
        t.title,
        t.content,
        t.category,
        t.tags,
        t.upvotes_count AS upvotes,
        t.replies_count AS replies,
        t.created_at,
        b.title AS book,
        b.slug AS "bookSlug",
        p.display_name AS author,
        p.avatar_url AS "authorAvatar"
      FROM forum_threads t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN personas p ON t.persona_id = p.id
      WHERE t.id = ${id} AND t.deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error finding thread: ${error.message}`);
  }
}

// 7. GET REPLIES FOR A THREAD
export async function findRepliesByThreadId(thread_id) {
  try {
    const result = await sql`
      SELECT 
        r.id,
        r.thread_id,
        r.parent_reply_id,
        r.content,
        r.upvotes_count,
        r.created_at,
        p.display_name AS author,
        p.avatar_url AS "authorAvatar"
      FROM forum_replies r
      LEFT JOIN personas p ON r.persona_id = p.id
      WHERE r.thread_id = ${thread_id} AND r.deleted_at IS NULL
      ORDER BY r.created_at ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching thread replies: ${error.message}`);
  }
}

// 8. CREATE THREAD REPLY
export async function createReply({ thread_id, user_id, persona_id, parent_reply_id, content }) {
  try {
    const result = await sql`
      INSERT INTO forum_replies (
        thread_id,
        user_id,
        persona_id,
        parent_reply_id,
        content
      )
      VALUES (
        ${thread_id},
        ${user_id},
        ${persona_id || null},
        ${parent_reply_id || null},
        ${content}
      )
      RETURNING *;
    `;

    // Increment replies_count on thread
    await sql`
      UPDATE forum_threads
      SET replies_count = replies_count + 1
      WHERE id = ${thread_id};
    `;

    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error creating reply: ${error.message}`);
  }
}
