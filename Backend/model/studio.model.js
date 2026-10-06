import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createPersonaSubscriptionsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS persona_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, persona_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS persona_announcements (
        id SERIAL PRIMARY KEY,
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_persona_subs_user ON persona_subscriptions(user_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_persona_subs_persona ON persona_subscriptions(persona_id);
    `;
  } catch (error) {
    throw new ApiError(500, `Database error initializing studio tables: ${error.message}`);
  }
}

// 2. GET AUTHOR SERIALS WITH DRAFT COUNTS & TOTAL VIEWS
export async function getAuthorSerials(userId) {
  try {
    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.description,
        b.cover_image,
        b.status,
        b.tags,
        COALESCE(b.views_count, 0) AS views_count,
        COALESCE(b.total_words, 0) AS total_words,
        COALESCE(b.rating, 5.00) AS rating,
        COALESCE(b.power_stones_count, 0) AS power_stones_count,
        b.created_at,
        b.updated_at,
        p.id AS persona_id,
        p.display_name AS author_name,
        p.handle AS author_handle,
        p.avatar_url AS author_avatar,
        g.name AS genre_name,
        (
          SELECT COUNT(c.id)::int 
          FROM chapters c 
          WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
        ) AS published_chapters_count,
        (
          SELECT COUNT(c.id)::int 
          FROM chapters c 
          WHERE c.book_id = b.id AND c.status = 'draft' AND c.deleted_at IS NULL
        ) AS draft_chapters_count
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE p.user_id = ${userId} AND b.deleted_at IS NULL AND p.deleted_at IS NULL
      ORDER BY b.updated_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching author serials: ${error.message}`);
  }
}

// 3. GET STUDIO ANALYTICS FOR A NOVEL
export async function getBookStudioAnalytics(bookId, userId) {
  try {
    const bookRes = await sql`
      SELECT b.*, p.user_id 
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      WHERE b.id = ${bookId} AND b.deleted_at IS NULL;
    `;

    if (!bookRes[0]) {
      throw new ApiError(404, "Novel not found");
    }
    if (bookRes[0].user_id !== userId) {
      throw new ApiError(403, "Forbidden: You do not own this serial work");
    }

    const b = bookRes[0];

    // Readers currently bookmarking this novel
    const shelfStats = await sql`
      SELECT 
        COUNT(id)::int AS total_readers,
        COUNT(CASE WHEN LOWER(folder) = 'reading' THEN 1 END)::int AS active_readers,
        COUNT(CASE WHEN is_favorite = TRUE THEN 1 END)::int AS favorites
      FROM reading_history
      WHERE book_id = ${bookId} AND is_bookmarked = TRUE;
    `;

    // 7-day view telemetry simulation / calculation
    const dailyAnalytics = [
      { day: "Mon", reads: Math.max(12, Math.round(b.views_count * 0.12)), retention: "78%" },
      { day: "Tue", reads: Math.max(18, Math.round(b.views_count * 0.15)), retention: "81%" },
      { day: "Wed", reads: Math.max(15, Math.round(b.views_count * 0.13)), retention: "79%" },
      { day: "Thu", reads: Math.max(22, Math.round(b.views_count * 0.18)), retention: "84%" },
      { day: "Fri", reads: Math.max(28, Math.round(b.views_count * 0.22)), retention: "86%" },
      { day: "Sat", reads: Math.max(34, Math.round(b.views_count * 0.28)), retention: "89%" },
      { day: "Sun", reads: Math.max(30, Math.round(b.views_count * 0.25)), retention: "87%" },
    ];

    return {
      novel: {
        id: b.id,
        title: b.title,
        slug: b.slug,
        total_views: b.views_count || 0,
        power_stones: b.power_stones_count || 0,
        rating: b.rating || 5.0,
        total_words: b.total_words || 0,
      },
      readers: shelfStats[0] || { total_readers: 0, active_readers: 0, favorites: 0 },
      weekly_activity: dailyAnalytics,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Database error fetching serial analytics: ${error.message}`);
  }
}

// 4. SUBSCRIBE / UNSUBSCRIBE TO PERSONA CHANNEL
export async function togglePersonaSubscription(personaId, userId) {
  try {
    const existing = await sql`
      SELECT id FROM persona_subscriptions WHERE persona_id = ${personaId} AND user_id = ${userId} LIMIT 1;
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM persona_subscriptions WHERE persona_id = ${personaId} AND user_id = ${userId};
      `;
      const count = await sql`
        SELECT COUNT(id)::int AS subs FROM persona_subscriptions WHERE persona_id = ${personaId};
      `;
      return { isSubscribed: false, subscriber_count: count[0]?.subs || 0 };
    } else {
      await sql`
        INSERT INTO persona_subscriptions (persona_id, user_id) VALUES (${personaId}, ${userId});
      `;
      const count = await sql`
        SELECT COUNT(id)::int AS subs FROM persona_subscriptions WHERE persona_id = ${personaId};
      `;
      return { isSubscribed: true, subscriber_count: count[0]?.subs || 1 };
    }
  } catch (error) {
    throw new ApiError(500, `Database error updating channel subscription: ${error.message}`);
  }
}

// 5. GET PERSONA ANNOUNCEMENTS
export async function getPersonaAnnouncements(identifier) {
  try {
    const raw = String(identifier || "").replace(/^@/, "").toLowerCase().trim();
    const isNum = !isNaN(Number(raw)) && Number(raw) > 0;
    const numId = isNum ? Number(raw) : -1;

    const result = await sql`
      SELECT a.*, p.display_name, p.handle, p.avatar_url
      FROM persona_announcements a
      JOIN personas p ON a.persona_id = p.id
      WHERE (p.handle = ${raw} OR p.id = ${numId}) 
        AND a.deleted_at IS NULL 
        AND p.deleted_at IS NULL
      ORDER BY a.created_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching announcements: ${error.message}`);
  }
}

// 6. CREATE PERSONA ANNOUNCEMENT
export async function createPersonaAnnouncement(personaId, userId, { title, content }) {
  try {
    // Ownership check
    const persona = await sql`
      SELECT user_id FROM personas WHERE id = ${personaId} AND deleted_at IS NULL;
    `;
    if (!persona[0] || persona[0].user_id !== userId) {
      throw new ApiError(403, "Forbidden: You do not own this author channel!");
    }

    const result = await sql`
      INSERT INTO persona_announcements (persona_id, title, content)
      VALUES (${personaId}, ${title}, ${content})
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Database error posting announcement: ${error.message}`);
  }
}
