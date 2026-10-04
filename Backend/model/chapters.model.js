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

    // Ensure volume_id & scheduled_at exist on existing tables (Migration helper)
    await sql`
      ALTER TABLE chapters ADD COLUMN IF NOT EXISTS volume_id INTEGER REFERENCES volumes(id) ON DELETE SET NULL;
    `;
    await sql`
      ALTER TABLE chapters ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON chapters(volume_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chapters_published_feed
      ON chapters(published_at DESC)
      WHERE status = 'published' AND deleted_at IS NULL;
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing chapters table: ${error.message}`,
    );
  }
}

// 2. CREATE A NEW CHAPTER (With Consecutive Chapter and Volume Sequencing + Scheduling)
export async function createChapter({
  book_id,
  volume_id = null,
  chapter_number,
  title,
  content,
  words_count,
  status = "draft",
  scheduled_at = null,
}) {
  try {
    // A. Check highest chapter number in the novel for consecutive validation
    const maxChRes = await sql`
      SELECT MAX(chapter_number) as max_num FROM chapters WHERE book_id = ${book_id} AND deleted_at IS NULL;
    `;
    const currentMax = maxChRes[0]?.max_num !== null ? Number(maxChRes[0].max_num) : 0;
    const nextExpected = currentMax + 1;
    const targetChNum =
      chapter_number !== undefined && chapter_number !== null
        ? Number(chapter_number)
        : nextExpected;

    if (targetChNum <= 0) {
      throw new ApiError(400, "Chapter number must be a positive integer (1, 2, 3...)");
    }

    // Chapters must be strictly consecutive (cannot skip from 2 to 10)
    if (targetChNum > nextExpected) {
      throw new ApiError(
        400,
        `Chapters must be consecutive! The next chapter must be Chapter ${nextExpected}.`
      );
    }

    // B. Validate Volume consecutive chapter numbering
    if (volume_id) {
      const volRes = await sql`
        SELECT * FROM volumes WHERE id = ${volume_id} AND book_id = ${book_id} AND deleted_at IS NULL;
      `;
      if (!volRes[0]) {
        throw new ApiError(404, "Specified volume not found for this book.");
      }
      const currentVol = volRes[0];

      // If volume is > 1, verify its chapters are strictly greater than previous volumes
      if (currentVol.volume_number > 1) {
        const prevVolMaxRes = await sql`
          SELECT MAX(c.chapter_number) as max_prev
          FROM chapters c
          JOIN volumes v ON c.volume_id = v.id
          WHERE c.book_id = ${book_id} AND v.volume_number < ${currentVol.volume_number} AND c.deleted_at IS NULL;
        `;
        const prevMax =
          prevVolMaxRes[0]?.max_prev !== null ? Number(prevVolMaxRes[0].max_prev) : 0;
        if (prevMax > 0 && targetChNum <= prevMax) {
          throw new ApiError(
            400,
            `Chapters in Volume ${currentVol.volume_number} must be consecutive after Volume ${currentVol.volume_number - 1} (after Chapter ${prevMax}).`
          );
        }
      }

      // Check subsequent volumes if any already exist
      const nextVolMinRes = await sql`
        SELECT MIN(c.chapter_number) as min_next
        FROM chapters c
        JOIN volumes v ON c.volume_id = v.id
        WHERE c.book_id = ${book_id} AND v.volume_number > ${currentVol.volume_number} AND c.deleted_at IS NULL;
      `;
      const nextMin =
        nextVolMinRes[0]?.min_next !== null ? Number(nextVolMinRes[0].min_next) : null;
      if (nextMin !== null && targetChNum >= nextMin) {
        throw new ApiError(
          400,
          `Chapter number ${targetChNum} cannot exceed the starting chapter (${nextMin}) of subsequent volumes.`
        );
      }
    }

    // C. Resolve publishing & scheduling timestamps
    let finalStatus = status || "draft";
    let publishedAt = null;
    let scheduledDate = scheduled_at ? new Date(scheduled_at) : null;

    if (finalStatus === "published") {
      publishedAt = sql`CURRENT_TIMESTAMP`;
      scheduledDate = null;
    } else if (finalStatus === "scheduled") {
      if (!scheduledDate || isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, "A valid scheduled_at timestamp is required for scheduled publication.");
      }
      if (scheduledDate <= new Date()) {
        // Scheduled in past or right now -> auto-publish immediately
        finalStatus = "published";
        publishedAt = sql`CURRENT_TIMESTAMP`;
        scheduledDate = null;
      }
    }

    const calculatedWords = words_count || (content ? content.trim().split(/\s+/).filter(Boolean).length : 0);

    const result = await sql`
      INSERT INTO chapters (
        book_id,
        volume_id,
        chapter_number,
        title,
        content,
        words_count,
        status,
        scheduled_at,
        published_at
      )
      VALUES (
        ${book_id},
        ${volume_id ? Number(volume_id) : null},
        ${targetChNum},
        ${title},
        ${content},
        ${calculatedWords},
        ${finalStatus},
        ${scheduledDate ? scheduledDate.toISOString() : null},
        ${publishedAt}
      )
      RETURNING *;
    `;

    // Update book total_words & updated_at if published
    if (finalStatus === "published" && calculatedWords > 0) {
      await sql`
        UPDATE books
        SET total_words = COALESCE(total_words, 0) + ${calculatedWords},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${book_id};
      `;
    }

    return result[0];
  } catch (error) {
    if (error.code === "23505" || error.message.includes("unique constraint")) {
      throw new ApiError(
        409,
        `Chapter ${chapter_number} already exists for this book!`,
      );
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      `Database error creating chapter: ${error.message}`,
    );
  }
}

// 3. TABLE OF CONTENTS FOR READERS
export async function getTableOfContents(book_id, user_id = null) {
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
      JOIN books b ON chapters.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN volumes ON chapters.volume_id = volumes.id AND volumes.deleted_at IS NULL
      WHERE chapters.book_id = ${book_id} 
        AND (
          (chapters.status = 'published') 
          OR (chapters.status = 'scheduled' AND chapters.scheduled_at <= CURRENT_TIMESTAMP)
          OR (p.user_id = ${user_id || null})
        )
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

// 4. READ SINGLE CHAPTER (Extended with paragraphs[], navigation, estimated time, lore)
export async function getChapterByNumber(book_id, chapter_number, user_id = null) {
  try {
    const result = await sql`
      SELECT 
        chapters.*,
        volumes.volume_number,
        volumes.title AS volume_title,
        b.title AS book_title,
        b.slug AS book_slug,
        p.display_name AS author_name,
        p.handle AS author_handle
      FROM chapters
      JOIN books b ON chapters.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN volumes ON chapters.volume_id = volumes.id AND volumes.deleted_at IS NULL
      WHERE chapters.book_id = ${book_id} 
        AND chapters.chapter_number = ${chapter_number} 
        AND (
          (chapters.status = 'published') 
          OR (chapters.status = 'scheduled' AND chapters.scheduled_at <= CURRENT_TIMESTAMP)
          OR (p.user_id = ${user_id || null})
        )
        AND chapters.deleted_at IS NULL;
    `;

    if (!result[0]) return null;

    const chapter = result[0];

    // Find Previous Chapter
    const prev = await sql`
      SELECT chapters.chapter_number, chapters.title FROM chapters
      JOIN books b ON chapters.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      WHERE chapters.book_id = ${book_id} AND chapters.chapter_number < ${chapter_number}
        AND (
          (chapters.status = 'published') 
          OR (chapters.status = 'scheduled' AND chapters.scheduled_at <= CURRENT_TIMESTAMP)
          OR (p.user_id = ${user_id || null})
        )
        AND chapters.deleted_at IS NULL
      ORDER BY chapters.chapter_number DESC LIMIT 1;
    `;

    // Find Next Chapter
    const next = await sql`
      SELECT chapters.chapter_number, chapters.title FROM chapters
      JOIN books b ON chapters.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      WHERE chapters.book_id = ${book_id} AND chapters.chapter_number > ${chapter_number}
        AND (
          (chapters.status = 'published') 
          OR (chapters.status = 'scheduled' AND chapters.scheduled_at <= CURRENT_TIMESTAMP)
          OR (p.user_id = ${user_id || null})
        )
        AND chapters.deleted_at IS NULL
      ORDER BY chapters.chapter_number ASC LIMIT 1;
    `;

    // Split content into clean paragraph blocks
    const rawParagraphs = (chapter.content || "")
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Fetch lore tags attached to this chapter
    const loreList = await sql`
      SELECT term, definition
      FROM chapter_lore
      WHERE chapter_id = ${chapter.id}
      ORDER BY order_index ASC, term ASC;
    `;

    // Estimated reading minutes (standard 220 words per minute)
    const estimatedMinutes = Math.max(1, Math.ceil((chapter.words_count || 1) / 220));

    return {
      ...chapter,
      paragraphs: rawParagraphs.length > 0 ? rawParagraphs : [chapter.content],
      estimated_reading_minutes: estimatedMinutes,
      navigation: {
        prev: prev[0] || null,
        next: next[0] || null,
      },
      lore_context: loreList,
    };
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching chapter: ${error.message}`,
    );
  }
}

// 5. LIVE PULSE: 4 MOST RECENTLY PUBLISHED CHAPTERS
export async function findLivePulseChapters() {
  try {
    const result = await sql`
      SELECT 
        c.id,
        c.chapter_number,
        c.title AS chapter_title,
        c.published_at,
        b.id AS book_id,
        b.title AS book_title,
        b.slug AS book_slug,
        b.cover_image,
        p.display_name AS author_name,
        p.handle AS author_handle
      FROM chapters c
      JOIN books b ON c.book_id = b.id
      JOIN personas p ON b.persona_id = p.id
      WHERE ((c.status = 'published') OR (c.status = 'scheduled' AND c.scheduled_at <= CURRENT_TIMESTAMP))
        AND c.deleted_at IS NULL
        AND b.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY c.published_at DESC
      LIMIT 4;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching live pulse chapters: ${error.message}`);
  }
}

// 6. OFFLINE BATCH CHAPTERS (Lightweight payload for IndexedDB)
export async function findOfflineBatchChapters(book_id, start_chapter = 1, limit = 50) {
  try {
    const startNum = parseInt(start_chapter, 10) || 1;
    const limitNum = Math.min(100, parseInt(limit, 10) || 50);

    const result = await sql`
      SELECT 
        id,
        book_id,
        chapter_number,
        title,
        content,
        words_count,
        published_at
      FROM chapters
      WHERE book_id = ${book_id}
        AND chapter_number >= ${startNum}
        AND ((status = 'published') OR (status = 'scheduled' AND scheduled_at <= CURRENT_TIMESTAMP))
        AND deleted_at IS NULL
      ORDER BY chapter_number ASC
      LIMIT ${limitNum};
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching offline batch chapters: ${error.message}`);
  }
}

// 7. AUTHOR VIEW: GET ALL CHAPTERS (Includes drafts & scheduled for author studio)
export async function getAllChaptersForAuthor(book_id) {
  try {
    const result = await sql`
      SELECT 
        c.id, 
        c.book_id,
        c.volume_id, 
        c.chapter_number, 
        c.title, 
        c.content,
        c.words_count, 
        c.status, 
        c.scheduled_at,
        c.published_at, 
        c.created_at, 
        c.updated_at,
        v.volume_number,
        v.title AS volume_title
      FROM chapters c
      LEFT JOIN volumes v ON c.volume_id = v.id AND v.deleted_at IS NULL
      WHERE c.book_id = ${book_id} AND c.deleted_at IS NULL
      ORDER BY c.chapter_number ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching author chapters: ${error.message}`,
    );
  }
}

// 8. UPDATE CHAPTER
export async function updateChapterById(
  chapter_id,
  book_id,
  { title, content, status, volume_id, scheduled_at, chapter_number }
) {
  try {
    const existing = await sql`
      SELECT * FROM chapters WHERE id = ${chapter_id} AND book_id = ${book_id} AND deleted_at IS NULL;
    `;
    if (!existing[0]) {
      return null;
    }
    const current = existing[0];

    let targetChNum =
      chapter_number !== undefined && chapter_number !== null
        ? Number(chapter_number)
        : current.chapter_number;
    let targetVolId =
      volume_id !== undefined
        ? volume_id
          ? Number(volume_id)
          : null
        : current.volume_id;
    let finalStatus = status || current.status;
    let scheduledDate =
      scheduled_at !== undefined
        ? scheduled_at
          ? new Date(scheduled_at)
          : null
        : current.scheduled_at
        ? new Date(current.scheduled_at)
        : null;
    let publishedAt = current.published_at;

    if (finalStatus === "published") {
      publishedAt = publishedAt || sql`CURRENT_TIMESTAMP`;
      scheduledDate = null;
    } else if (finalStatus === "scheduled") {
      if (!scheduledDate || isNaN(scheduledDate.getTime())) {
        throw new ApiError(
          400,
          "A valid scheduled_at timestamp is required for scheduled publication."
        );
      }
      if (scheduledDate <= new Date()) {
        finalStatus = "published";
        publishedAt = sql`CURRENT_TIMESTAMP`;
        scheduledDate = null;
      }
    } else if (finalStatus === "draft") {
      scheduledDate = null;
    }

    const newContent = content !== undefined ? content : current.content;
    const words_count = newContent
      ? newContent.trim().split(/\s+/).filter(Boolean).length
      : current.words_count;
    const newTitle = title !== undefined ? title.trim() : current.title;

    const result = await sql`
      UPDATE chapters
      SET 
        title = ${newTitle},
        content = ${newContent},
        words_count = ${words_count},
        status = ${finalStatus},
        volume_id = ${targetVolId},
        chapter_number = ${targetChNum},
        scheduled_at = ${scheduledDate ? scheduledDate.toISOString() : null},
        published_at = ${publishedAt},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${chapter_id} AND book_id = ${book_id} AND deleted_at IS NULL
      RETURNING *;
    `;

    // Update book total_words & updated_at if published status changed or content changed
    if (finalStatus === "published") {
      await sql`
        UPDATE books
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ${book_id};
      `;
    }

    return result[0] || null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Database error updating chapter: ${error.message}`);
  }
}

// 9. SOFT DELETE CHAPTER
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

// 10. FIND CHAPTER BY ID
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