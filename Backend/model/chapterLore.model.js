import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createChapterLoreTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chapter_lore (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
        term VARCHAR(100) NOT NULL,
        definition TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapter_lore_chapter_id ON chapter_lore(chapter_id);
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing chapter_lore table: ${error.message}`
    );
  }
}

// 2. GET ALL LORE ENTRIES FOR A CHAPTER
export async function getLoreByChapterId(chapter_id) {
  try {
    return await sql`
      SELECT id, chapter_id, term, definition, order_index, created_at
      FROM chapter_lore
      WHERE chapter_id = ${chapter_id}
      ORDER BY order_index ASC, id ASC;
    `;
  } catch (error) {
    throw new ApiError(500, `Database error fetching chapter lore: ${error.message}`);
  }
}

// 3. CREATE LORE ENTRY
export async function createChapterLore({ chapter_id, term, definition, order_index = 0 }) {
  try {
    const result = await sql`
      INSERT INTO chapter_lore (chapter_id, term, definition, order_index)
      VALUES (${chapter_id}, ${term}, ${definition}, ${order_index})
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error creating chapter lore: ${error.message}`);
  }
}

// 4. FIND LORE BY ID
export async function getChapterLoreById(id) {
  try {
    const result = await sql`
      SELECT * FROM chapter_lore WHERE id = ${id} LIMIT 1;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error finding chapter lore: ${error.message}`);
  }
}

// 5. DELETE LORE ENTRY
export async function deleteChapterLore(id) {
  try {
    const result = await sql`
      DELETE FROM chapter_lore
      WHERE id = ${id}
      RETURNING id, chapter_id, term;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error deleting chapter lore: ${error.message}`);
  }
}
