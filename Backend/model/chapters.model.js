import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION
export async function createChapterTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        volume_id INTEGER REFERENCES volumes(id) ON DELETE SET NULL,
        chapter_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        words_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
        published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        UNIQUE (book_id, chapter_number)
      );
    `;

    // Ensure volume_id exists on existing tables (Migration helper)
    await sql`
      ALTER TABLE chapters ADD COLUMN IF NOT EXISTS volume_id INTEGER REFERENCES volumes(id) ON DELETE SET NULL;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON chapters(volume_id);
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing chapters table: ${error.message}`,
    );
  }
}

// 2. CREATE A NEW CHAPTER
export async function createChapter({
  book_id,
  volume_id = null,
  chapter_number,
  title,
  content,
  words_count,
  status = "draft",
}) {
  try {
    // If published immediately, timestamp it
    const publishedAt = status === "published" ? sql`CURRENT_TIMESTAMP` : null;

    const result = await sql`
      INSERT INTO chapters (
        book_id,
        volume_id,
        chapter_number,
        title,
        content,
        words_count,
        status,
        published_at
      )
      VALUES (
        ${book_id},
        ${volume_id},
        ${chapter_number},
        ${title},
        ${content},
        ${words_count || 0},
        ${status},
        ${publishedAt}
      )
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    if (error.code === "23505" || error.message.includes("unique constraint")) {
      throw new ApiError(
        409,
        `Chapter ${chapter_number} already exists for this book!`,
      );
    }
    throw new ApiError(
      500,
      `Database error creating chapter: ${error.message}`,
    );
  }
}

// 3. TABLE OF CONTENTS FOR READERS (Only fetches PUBLISHED chapters, excludes heavy content!)
export async function getTableOfContents(book_id) {
  try {
    const result = await sql`
      SELECT 
        chapters.id, 
        chapters.chapter_number, 
        chapters.title, 
        chapters.words_count, 
        chapters.published_at,
        chapters.volume_id,
        volumes.volume_number,
        volumes.title AS volume_title
      FROM chapters
      LEFT JOIN volumes ON chapters.volume_id = volumes.id AND volumes.deleted_at IS NULL
      WHERE chapters.book_id = ${book_id} 
        AND chapters.status = 'published'
        AND chapters.deleted_at IS NULL
      ORDER BY 
        COALESCE(volumes.volume_number, 0) ASC, 
        chapters.chapter_number ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching table of contents: ${error.message}`,
    );
  }
}

// 4. READ SINGLE CHAPTER (Readers only get published chapters)
export async function getChapterByNumber(book_id, chapter_number) {
  try {
    const result = await sql`
      SELECT 
        chapters.*,
        volumes.volume_number,
        volumes.title AS volume_title
      FROM chapters
      LEFT JOIN volumes ON chapters.volume_id = volumes.id AND volumes.deleted_at IS NULL
      WHERE chapters.book_id = ${book_id} 
        AND chapters.chapter_number = ${chapter_number} 
        AND chapters.status = 'published'
        AND chapters.deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching chapter: ${error.message}`,
    );
  }
}

// 5. AUTHOR VIEW: GET ALL CHAPTERS (Includes drafts for the author dashboard)
export async function getAllChaptersForAuthor(book_id) {
  try {
    const result = await sql`
      SELECT id, chapter_number, title, words_count, status, published_at, created_at
      FROM chapters
      WHERE book_id = ${book_id} AND deleted_at IS NULL
      ORDER BY chapter_number ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching author chapters: ${error.message}`,
    );
  }
}

// 6. SOFT DELETE CHAPTER
export async function softDeleteChapter(chapter_id, book_id) {
  try {
    const result = await sql`
      UPDATE chapters 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${chapter_id} AND book_id = ${book_id}
      RETURNING id, chapter_number, title, deleted_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error soft-deleting chapter: ${error.message}`
    );
  }
}

// 7. FIND CHAPTER BY ID
export async function findChapterById(id) {
  try {
    const result = await sql`
      SELECT * FROM chapters WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error finding chapter: ${error.message}`);
  }
}