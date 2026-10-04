import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createReadingHistoryTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS reading_history (
        id SERIAL PRIMARY KEY,
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        last_read_chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
        last_chapter_number INTEGER DEFAULT 1,
        scroll_percentage DECIMAL(5,2) DEFAULT 0.00,
        is_bookmarked BOOLEAN DEFAULT FALSE,
        folder VARCHAR(50) DEFAULT 'Reading' CHECK (folder IN ('all', 'Reading', 'reading', 'Completed', 'completed', 'Plan to Read', 'plan_to_read', 'On Hold', 'Dropped')),
        is_favorite BOOLEAN DEFAULT FALSE,
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (persona_id, book_id)
      );
    `;

    // Drop restrictive check constraint if it prevents lowercased folder names
    await sql`
      ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_folder_check;
    `;

    // Add words_read_today or daily tracking if needed
    await sql`
      ALTER TABLE reading_history ADD COLUMN IF NOT EXISTS words_read_session BIGINT DEFAULT 0;
    `;

    // 7-day word goal rollup table
    await sql`
      CREATE TABLE IF NOT EXISTS user_reading_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER REFERENCES personas(id) ON DELETE SET NULL,
        read_date DATE DEFAULT CURRENT_DATE,
        words_read BIGINT DEFAULT 0,
        minutes_read INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, read_date)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reading_history_persona ON reading_history(persona_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reading_history_bookmarked 
      ON reading_history(persona_id, is_bookmarked) 
      WHERE is_bookmarked = TRUE;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reading_history_last_read 
      ON reading_history(persona_id, last_read_at DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_reading_logs_user_date 
      ON user_reading_logs(user_id, read_date DESC);
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing reading_history table: ${error.message}`
    );
  }
}

// 2. UPSERT READING PROGRESS (Syncs reading location & updates last_read_at)
export async function upsertReadingProgress({
  persona_id,
  user_id = null,
  book_id,
  chapter_id,
  chapter_number = 1,
  scroll_percentage = 0.0,
  words_count = 0,
}) {
  try {
    const result = await sql`
      INSERT INTO reading_history (
        persona_id,
        book_id,
        last_read_chapter_id,
        last_chapter_number,
        scroll_percentage,
        last_read_at
      )
      VALUES (
        ${persona_id},
        ${book_id},
        ${chapter_id || null},
        ${chapter_number},
        ${scroll_percentage},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (persona_id, book_id) DO UPDATE SET
        last_read_chapter_id = EXCLUDED.last_read_chapter_id,
        last_chapter_number = EXCLUDED.last_chapter_number,
        scroll_percentage = EXCLUDED.scroll_percentage,
        last_read_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    // Rollup to daily logs if user_id or persona_id is present
    if (user_id && words_count > 0) {
      await sql`
        INSERT INTO user_reading_logs (user_id, persona_id, read_date, words_read, minutes_read)
        VALUES (${user_id}, ${persona_id}, CURRENT_DATE, ${words_count}, ${Math.ceil(words_count / 220)})
        ON CONFLICT (user_id, read_date) DO UPDATE SET
          words_read = user_reading_logs.words_read + EXCLUDED.words_read,
          minutes_read = user_reading_logs.minutes_read + EXCLUDED.minutes_read;
      `;
    }

    return result[0];
  } catch (error) {
    throw new ApiError(
      500,
      `Database error recording reading progress: ${error.message}`
    );
  }
}

// 3. TOGGLE OR UPDATE BOOKSHELF / BOOKMARK
export async function updateBookshelfStatus({
  persona_id,
  book_id,
  is_bookmarked = true,
  folder = "Reading",
  is_favorite = false,
}) {
  try {
    const result = await sql`
      INSERT INTO reading_history (
        persona_id,
        book_id,
        is_bookmarked,
        folder,
        is_favorite
      )
      VALUES (
        ${persona_id},
        ${book_id},
        ${is_bookmarked},
        ${folder},
        ${is_favorite}
      )
      ON CONFLICT (persona_id, book_id) DO UPDATE SET
        is_bookmarked = EXCLUDED.is_bookmarked,
        folder = COALESCE(EXCLUDED.folder, reading_history.folder),
        is_favorite = EXCLUDED.is_favorite
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(
      500,
      `Database error updating bookshelf status: ${error.message}`
    );
  }
}

// 4. BATCH REMOVE NOVELS FROM SHELF
export async function batchRemoveFromBookshelf(persona_id, bookIds = []) {
  try {
    if (!bookIds || bookIds.length === 0) return [];
    const result = await sql`
      UPDATE reading_history
      SET is_bookmarked = FALSE
      WHERE persona_id = ${persona_id} AND book_id = ANY(${bookIds}::int[])
      RETURNING book_id;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error removing books from shelf: ${error.message}`);
  }
}

// 5. BATCH MOVE NOVELS TO FOLDER
export async function batchMoveBookshelfFolder(persona_id, bookIds = [], targetFolder) {
  try {
    if (!bookIds || bookIds.length === 0) return [];
    const result = await sql`
      UPDATE reading_history
      SET folder = ${targetFolder}
      WHERE persona_id = ${persona_id} AND book_id = ANY(${bookIds}::int[])
      RETURNING book_id, folder;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error moving books to folder: ${error.message}`);
  }
}

// 6. GET BOOKSHELF (With active reading hero data & counts)
export async function getPersonaBookshelf(persona_id, folder = null) {
  try {
    const normFolder = folder ? folder.toLowerCase() : null;

    return await sql`
      SELECT 
        rh.id AS history_id,
        rh.book_id,
        rh.last_chapter_number,
        rh.scroll_percentage,
        rh.folder,
        rh.is_favorite,
        rh.last_read_at,
        b.title,
        b.slug,
        b.cover_image,
        b.status,
        b.description,
        b.tags,
        b.total_words,
        author.display_name AS author_name,
        author.handle AS author_handle,
        g.name AS genre_name,
        (
          SELECT json_build_object(
            'chapter_number', c.chapter_number,
            'title', c.title
          )
          FROM chapters c
          WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
          ORDER BY c.chapter_number DESC
          LIMIT 1
        ) AS latest_chapter,
        (
          SELECT COUNT(c.id)::int
          FROM chapters c
          WHERE c.book_id = b.id AND c.deleted_at IS NULL AND c.status = 'published'
        ) AS total_chapters,
        GREATEST(0, (
          SELECT COUNT(c.id)::int
          FROM chapters c
          WHERE c.book_id = b.id AND c.deleted_at IS NULL AND c.status = 'published'
            AND c.chapter_number > COALESCE(rh.last_chapter_number, 0)
        )) AS unread_chapters
      FROM reading_history rh
      JOIN books b ON rh.book_id = b.id
      JOIN personas author ON b.persona_id = author.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE rh.persona_id = ${persona_id} 
        AND rh.is_bookmarked = TRUE
        AND b.deleted_at IS NULL
        AND (${normFolder}::text IS NULL OR ${normFolder} = 'all' OR LOWER(rh.folder) = ${normFolder})
      ORDER BY rh.last_read_at DESC;
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching bookshelf: ${error.message}`
    );
  }
}

// 7. GET LIBRARY STATS & ACTIVE READING SPOTLIGHT
export async function getLibraryStats(persona_id) {
  try {
    const counts = await sql`
      SELECT 
        COUNT(id)::int AS total_saved,
        COUNT(CASE WHEN LOWER(folder) = 'reading' THEN 1 END)::int AS reading_count,
        COUNT(CASE WHEN LOWER(folder) = 'completed' THEN 1 END)::int AS completed_count,
        COUNT(CASE WHEN is_favorite = TRUE THEN 1 END)::int AS favorites_count
      FROM reading_history
      WHERE persona_id = ${persona_id} AND is_bookmarked = TRUE;
    `;

    const activeHero = await sql`
      SELECT 
        rh.book_id,
        rh.last_chapter_number,
        rh.scroll_percentage,
        rh.last_read_at,
        b.title,
        b.slug,
        b.cover_image,
        p.display_name AS author_name,
        (
          SELECT c.title FROM chapters c 
          WHERE c.book_id = b.id AND c.chapter_number = rh.last_chapter_number 
          LIMIT 1
        ) AS current_chapter_title,
        (
          SELECT COUNT(c.id)::int FROM chapters c 
          WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
        ) AS total_chapters
      FROM reading_history rh
      JOIN books b ON rh.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      WHERE rh.persona_id = ${persona_id} AND b.deleted_at IS NULL
      ORDER BY rh.last_read_at DESC
      LIMIT 1;
    `;

    return {
      stats: counts[0] || { total_saved: 0, reading_count: 0, completed_count: 0, favorites_count: 0 },
      active_reading: activeHero[0] || null,
    };
  } catch (error) {
    throw new ApiError(500, `Database error fetching library stats: ${error.message}`);
  }
}

// 8. GET RECENT READING HISTORY FOR A PERSONA
export async function getPersonaReadingHistory(persona_id, limit = 20) {
  try {
    return await sql`
      SELECT 
        rh.id AS history_id,
        rh.book_id,
        rh.last_chapter_number,
        rh.scroll_percentage,
        rh.last_read_at,
        b.title,
        b.slug,
        b.cover_image,
        b.status,
        author.display_name AS author_name,
        author.handle AS author_handle,
        g.name AS genre_name,
        (
          SELECT c.title FROM chapters c 
          WHERE c.book_id = b.id AND c.chapter_number = rh.last_chapter_number 
          LIMIT 1
        ) AS chapter_title
      FROM reading_history rh
      JOIN books b ON rh.book_id = b.id
      JOIN personas author ON b.persona_id = author.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE rh.persona_id = ${persona_id} AND b.deleted_at IS NULL
      ORDER BY rh.last_read_at DESC
      LIMIT ${limit};
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching reading history: ${error.message}`
    );
  }
}

// 9. CLEAR READING HISTORY
export async function clearPersonaReadingHistory(persona_id) {
  try {
    await sql`
      DELETE FROM reading_history
      WHERE persona_id = ${persona_id} AND is_bookmarked = FALSE;
    `;
    await sql`
      UPDATE reading_history
      SET last_chapter_number = 1, scroll_percentage = 0.00
      WHERE persona_id = ${persona_id};
    `;
    return true;
  } catch (error) {
    throw new ApiError(500, `Database error clearing reading history: ${error.message}`);
  }
}

// 10. GET 7-DAY WEEKLY READING GOAL ROLLUP
export async function getWeeklyReadingGoal(userId) {
  try {
    const weeklyData = await sql`
      SELECT 
        COALESCE(SUM(words_read), 0)::bigint AS words_read,
        COALESCE(SUM(minutes_read), 0)::int AS minutes_read
      FROM user_reading_logs
      WHERE user_id = ${userId}
        AND read_date >= CURRENT_DATE - INTERVAL '7 days';
    `;

    const wordsRead = parseInt(weeklyData[0]?.words_read || 0, 10);
    const goalWords = 1500000; // 1.5M standard goal
    const percentage = Math.min(100, Math.round((wordsRead / goalWords) * 100));

    return {
      words_read: wordsRead,
      goal_words: goalWords,
      percentage: percentage,
      headline: `${(wordsRead / 1000000).toFixed(1)}M Words Read`,
      rank_bracket: "Top 3% of readers this week",
    };
  } catch (error) {
    throw new ApiError(500, `Database error fetching weekly reading goal: ${error.message}`);
  }
}

// 11. GET SINGLE BOOK PROGRESS (Compatibility)
export async function getBookProgress(persona_id, book_id) {
  try {
    const result = await sql`
      SELECT * FROM reading_history
      WHERE persona_id = ${persona_id} AND book_id = ${book_id}
      LIMIT 1;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching book progress: ${error.message}`);
  }
}
