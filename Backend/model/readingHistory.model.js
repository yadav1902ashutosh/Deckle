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
        folder VARCHAR(50) DEFAULT 'Reading' CHECK (folder IN ('Reading', 'Completed', 'Plan to Read', 'On Hold', 'Dropped')),
        is_favorite BOOLEAN DEFAULT FALSE,
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (persona_id, book_id)
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
  book_id,
  chapter_id,
  chapter_number = 1,
  scroll_percentage = 0.0,
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

// 4. GET BOOKSHELF FOR A PERSONA (Only bookmarked books)
export async function getPersonaBookshelf(persona_id, folder = null) {
  try {
    if (folder) {
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
          author.display_name AS author_name,
          author.handle AS author_handle,
          g.name AS genre_name,
          (SELECT COUNT(c.id) FROM chapters c WHERE c.book_id = b.id AND c.deleted_at IS NULL AND c.status = 'published') AS total_chapters
        FROM reading_history rh
        JOIN books b ON rh.book_id = b.id
        JOIN personas author ON b.persona_id = author.id
        LEFT JOIN genres g ON b.genre_id = g.id
        WHERE rh.persona_id = ${persona_id} 
          AND rh.is_bookmarked = TRUE
          AND rh.folder = ${folder}
          AND b.deleted_at IS NULL
        ORDER BY rh.last_read_at DESC;
      `;
    }

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
        author.display_name AS author_name,
        author.handle AS author_handle,
        g.name AS genre_name,
        (SELECT COUNT(c.id) FROM chapters c WHERE c.book_id = b.id AND c.deleted_at IS NULL AND c.status = 'published') AS total_chapters
      FROM reading_history rh
      JOIN books b ON rh.book_id = b.id
      JOIN personas author ON b.persona_id = author.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE rh.persona_id = ${persona_id} 
        AND rh.is_bookmarked = TRUE
        AND b.deleted_at IS NULL
      ORDER BY rh.last_read_at DESC;
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching bookshelf: ${error.message}`
    );
  }
}

// 5. GET RECENT READING HISTORY FOR A PERSONA
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
        g.name AS genre_name
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

// 6. GET SINGLE BOOK PROGRESS FOR A PERSONA
export async function getBookProgress(persona_id, book_id) {
  try {
    const result = await sql`
      SELECT *
      FROM reading_history
      WHERE persona_id = ${persona_id} AND book_id = ${book_id}
      LIMIT 1;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching book progress: ${error.message}`
    );
  }
}
