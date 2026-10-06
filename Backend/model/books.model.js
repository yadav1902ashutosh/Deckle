import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createBooksTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        cover_image TEXT DEFAULT 'https://via.placeholder.com/300x450',
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
        views_count INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    // Migration helper: add genre_id to existing table if absent
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL;
    `;

    // Migration helpers for V2 columns:
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.00;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS total_words BIGINT DEFAULT 0;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT NULL;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS announcement_title VARCHAR(255) DEFAULT NULL;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS announcement_content TEXT DEFAULT NULL;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS announcement_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    `;
    await sql`
      ALTER TABLE books ADD COLUMN IF NOT EXISTS power_stones_count INTEGER DEFAULT 0;
    `;

    // Power stone votes tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS power_stone_votes (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_books_persona_id ON books(persona_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_books_genre_id ON books(genre_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_active_books_created 
      ON books(created_at DESC) 
      WHERE deleted_at IS NULL;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_books_is_featured
      ON books(is_featured)
      WHERE is_featured = TRUE AND deleted_at IS NULL;
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing books table: ${error.message}`,
    );
  }
}

// 2. CREATE A NEW BOOK
export async function createBook({
  title,
  slug,
  description,
  cover_image,
  persona_id,
  genre_id,
  status,
  tags,
}) {
  try {
    const result = await sql`
      INSERT INTO books (
        title,
        slug,
        description,
        cover_image,
        persona_id,
        genre_id,
        status,
        tags
      )
      VALUES (
        ${title},
        ${slug},
        ${description},
        ${cover_image || "https://via.placeholder.com/300x450"},
        ${persona_id},
        ${genre_id || null},
        ${status || "ongoing"},
        ${tags || []}
      )
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    if (error.code === "23505" || error.message.includes("unique constraint")) {
      throw new ApiError(409, `A book with the slug "${slug}" already exists!`);
    }
    throw new ApiError(500, `Database error creating book: ${error.message}`);
  }
}

// 3. GET ACTIVE BOOKS WITH FILTERS & PAGINATION
export async function findActiveBooksPaginated({
  genre = null,
  status = null,
  sort = "popular",
  min_words = null,
  max_words = null,
  page = 1,
  limit = 20,
} = {}) {
  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build raw dynamic query parts using Postgres conditions
    const result = await sql`
      WITH filtered_books AS (
        SELECT 
          b.*,
          COALESCE(b.rating, 5.00) AS rating_val,
          COALESCE(b.ratings_count, 0) AS ratings_cnt,
          COALESCE(b.views_count, 0) AS views_cnt,
          COALESCE(b.total_words, 0) AS words_cnt,
          COALESCE(b.power_stones_count, 0) AS stones_cnt,
          p.display_name AS author_name,
          p.handle AS author_handle,
          p.avatar_url AS author_avatar,
          g.name AS genre_name,
          g.slug AS genre_slug,
          g.icon AS genre_icon,
          (
            SELECT json_build_object(
              'chapter_number', c.chapter_number,
              'title', c.title,
              'published_at', c.published_at
            )
            FROM chapters c
            WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
            ORDER BY c.chapter_number DESC
            LIMIT 1
          ) AS latest_chapter,
          (
            SELECT COUNT(c.id)::int
            FROM chapters c
            WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
          ) AS total_chapters
        FROM books b
        JOIN personas p ON b.persona_id = p.id
        LEFT JOIN genres g ON b.genre_id = g.id
        WHERE b.deleted_at IS NULL 
          AND p.deleted_at IS NULL
          AND (${genre}::text IS NULL OR g.slug = ${genre} OR ${genre} = ANY(b.tags))
          AND (${status}::text IS NULL OR b.status = ${status})
          AND (${min_words}::bigint IS NULL OR b.total_words >= ${min_words}::bigint)
          AND (${max_words}::bigint IS NULL OR b.total_words <= ${max_words}::bigint)
      ),
      counted AS (
        SELECT COUNT(*)::int AS total FROM filtered_books
      )
      SELECT 
        fb.*,
        c.total AS total_count
      FROM filtered_books fb
      CROSS JOIN counted c
      ORDER BY 
        CASE WHEN ${sort} = 'updated' THEN fb.updated_at END DESC,
        CASE WHEN ${sort} = 'rating' THEN fb.rating_val END DESC,
        CASE WHEN ${sort} = 'scale' THEN fb.words_cnt END DESC,
        CASE WHEN ${sort} = 'newest' THEN fb.created_at END DESC,
        fb.views_cnt DESC, fb.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset};
    `;

    const totalNovels = result[0]?.total_count || 0;
    const totalPages = Math.ceil(totalNovels / limitNum) || 1;
    const startRange = totalNovels === 0 ? 0 : offset + 1;
    const endRange = Math.min(offset + limitNum, totalNovels);

    const books = result.map((row) => {
      const { total_count, ...bookData } = row;
      return bookData;
    });

    return {
      books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalNovels,
        displayRange: `${startRange} - ${endRange}`,
      },
    };
  } catch (error) {
    throw new ApiError(500, `Database error fetching paginated books: ${error.message}`);
  }
}

// 4. FIND ACTIVE BOOKS (Legacy helper returning full active list)
export async function findActiveBooks() {
  try {
    const result = await sql`
      SELECT 
        books.*,
        personas.display_name AS author_name,
        personas.handle AS author_handle,
        personas.avatar_url AS author_avatar,
        genres.name AS genre_name,
        genres.slug AS genre_slug,
        genres.icon AS genre_icon,
        (
          SELECT json_build_object(
            'chapter_number', c.chapter_number,
            'title', c.title,
            'published_at', c.published_at
          )
          FROM chapters c
          WHERE c.book_id = books.id AND c.status = 'published' AND c.deleted_at IS NULL
          ORDER BY c.chapter_number DESC
          LIMIT 1
        ) AS latest_chapter
      FROM books
      JOIN personas ON books.persona_id = personas.id
      LEFT JOIN genres ON books.genre_id = genres.id
      WHERE books.deleted_at IS NULL AND personas.deleted_at IS NULL
      ORDER BY books.created_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching books: ${error.message}`);
  }
}

// 5. FIND FEATURED BOOKS (Editorial hero spotlights)
export async function findFeaturedBooks(limit = 20) {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    // Return books flagged is_featured, falling back to top viewed & rated books
    const result = await sql`
      SELECT 
        b.*,
        p.display_name AS author_name,
        p.handle AS author_handle,
        p.avatar_url AS author_avatar,
        g.name AS genre_name,
        g.slug AS genre_slug,
        g.icon AS genre_icon,
        (
          SELECT json_build_object(
            'chapter_number', c.chapter_number,
            'title', c.title,
            'published_at', c.published_at
          )
          FROM chapters c
          WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
          ORDER BY c.chapter_number DESC
          LIMIT 1
        ) AS latest_chapter
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.deleted_at IS NULL AND p.deleted_at IS NULL
      ORDER BY b.is_featured DESC, b.views_count DESC, b.rating DESC, b.created_at DESC
      LIMIT ${limitNum};
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching featured books: ${error.message}`);
  }
}

// 6. FIND RANKINGS (Daily / Weekly / All-time leaderboards)
export async function findRankings({ timeframe = "all_time", limit = 10 } = {}) {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    // Order by composite of views, power stones, and rating
    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.cover_image,
        b.status,
        b.description,
        b.tags,
        COALESCE(b.rating, 5.00) AS rating,
        COALESCE(b.ratings_count, 0) AS ratings_count,
        COALESCE(b.views_count, 0) AS views_count,
        COALESCE(b.total_words, 0) AS total_words,
        COALESCE(b.power_stones_count, 0) AS power_stones_count,
        b.created_at,
        p.display_name AS author_name,
        p.handle AS author_handle,
        p.avatar_url AS author_avatar,
        g.name AS genre_name,
        g.slug AS genre_slug,
        (
          SELECT json_build_object(
            'chapter_number', c.chapter_number,
            'title', c.title,
            'published_at', c.published_at
          )
          FROM chapters c
          WHERE c.book_id = b.id AND c.status = 'published' AND c.deleted_at IS NULL
          ORDER BY c.chapter_number DESC
          LIMIT 1
        ) AS latest_chapter
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.deleted_at IS NULL AND p.deleted_at IS NULL
      ORDER BY (COALESCE(b.views_count, 0) * 2 + COALESCE(b.power_stones_count, 0) * 5) DESC, b.created_at DESC
      LIMIT ${limitNum};
    `;

    return result.map((b, idx) => ({
      ...b,
      rank: idx + 1,
      movement: idx === 0 ? "double_up" : idx < 3 ? "up" : "same",
    }));
  } catch (error) {
    throw new ApiError(500, `Database error fetching rankings: ${error.message}`);
  }
}

// 7. GET TRENDING TAGS / MOTIFS
export async function findTrendingTags() {
  try {
    const result = await sql`
      SELECT unnest(tags) AS tag, COUNT(*) AS count
      FROM books
      WHERE deleted_at IS NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 12;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching trending tags: ${error.message}`);
  }
}

// 8. GET GENRES WITH NOVEL COUNTS
export async function findGenresWithCounts() {
  try {
    const result = await sql`
      SELECT 
        g.id,
        g.name,
        g.slug,
        g.icon,
        COUNT(b.id)::int AS novel_count
      FROM genres g
      LEFT JOIN books b ON b.genre_id = g.id AND b.deleted_at IS NULL
      WHERE g.deleted_at IS NULL
      GROUP BY g.id, g.name, g.slug, g.icon
      ORDER BY novel_count DESC, g.name ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching genres: ${error.message}`);
  }
}

// 9. FIND BOOK BY SLUG (Single book detail with metrics & latest chapter)
export async function findBookBySlug(slug, currentUserId = null) {
  try {
    const result = await sql`
      SELECT 
        books.*,
        personas.display_name AS author_name,
        personas.handle AS author_handle,
        personas.avatar_url AS author_avatar,
        personas.bio AS author_bio,
        genres.name AS genre_name,
        genres.slug AS genre_slug,
        genres.icon AS genre_icon,
        (
          SELECT json_build_object(
            'chapter_number', c.chapter_number,
            'title', c.title,
            'published_at', c.published_at
          )
          FROM chapters c
          WHERE c.book_id = books.id 
            AND (
              c.status = 'published'
              OR (c.status = 'scheduled' AND c.scheduled_at <= CURRENT_TIMESTAMP)
              OR (personas.user_id = ${currentUserId || null})
            )
            AND c.deleted_at IS NULL
          ORDER BY c.chapter_number DESC
          LIMIT 1
        ) AS latest_chapter,
        (
          SELECT COUNT(c.id)::int
          FROM chapters c
          WHERE c.book_id = books.id 
            AND (
              c.status = 'published'
              OR (c.status = 'scheduled' AND c.scheduled_at <= CURRENT_TIMESTAMP)
              OR (personas.user_id = ${currentUserId || null})
            )
            AND c.deleted_at IS NULL
        ) AS total_chapters
      FROM books
      JOIN personas ON books.persona_id = personas.id
      LEFT JOIN genres ON books.genre_id = genres.id
      WHERE (LOWER(books.slug) = LOWER(${slug}) OR books.id::text = ${slug}) 
        AND books.deleted_at IS NULL 
        AND personas.deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching book by slug: ${error.message}`);
  }
}

// 10. GET BOOK RECOMMENDATIONS
export async function findBookRecommendations(slug) {
  try {
    const current = await sql`
      SELECT id, genre_id, tags, persona_id FROM books WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!current[0]) return [];

    const { id, genre_id, tags, persona_id } = current[0];

    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.cover_image,
        b.status,
        b.description,
        b.tags,
        COALESCE(b.rating, 5.00) AS rating,
        COALESCE(b.views_count, 0) AS views_count,
        COALESCE(b.total_words, 0) AS total_words,
        p.display_name AS author_name,
        p.handle AS author_handle,
        p.avatar_url AS author_avatar,
        g.name AS genre_name
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.id != ${id} 
        AND b.deleted_at IS NULL 
        AND p.deleted_at IS NULL
        AND (
          b.genre_id = ${genre_id} 
          OR b.persona_id = ${persona_id}
          OR b.tags && ${tags || []}::text[]
        )
      ORDER BY b.views_count DESC
      LIMIT 6;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching recommendations: ${error.message}`);
  }
}

// 11. CAST POWER STONE VOTE
export async function castPowerStoneVote(slug, userId) {
  try {
    const bookRes = await sql`
      SELECT id FROM books WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1;
    `;
    if (!bookRes[0]) {
      throw new ApiError(404, "Novel not found");
    }
    const bookId = bookRes[0].id;

    // Check if user voted in the last 24h
    const recent = await sql`
      SELECT id FROM power_stone_votes 
      WHERE book_id = ${bookId} AND user_id = ${userId}
        AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1;
    `;

    if (recent.length > 0) {
      throw new ApiError(429, "You have already voted for this novel today!");
    }

    await sql`
      INSERT INTO power_stone_votes (book_id, user_id) VALUES (${bookId}, ${userId});
    `;

    const updated = await sql`
      UPDATE books
      SET power_stones_count = COALESCE(power_stones_count, 0) + 1
      WHERE id = ${bookId}
      RETURNING power_stones_count;
    `;

    return updated[0]?.power_stones_count || 1;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Database error casting power stone: ${error.message}`);
  }
}

// 12. SEARCH BOOKS (For search / command palette)
export async function searchBooks(query) {
  try {
    const q = `%${query.toLowerCase().trim()}%`;
    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.cover_image,
        b.status,
        p.display_name AS author_name,
        p.handle AS author_handle,
        p.avatar_url AS author_avatar,
        g.name AS genre_name
      FROM books b
      JOIN personas p ON b.persona_id = p.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE b.deleted_at IS NULL AND p.deleted_at IS NULL
        AND (
          LOWER(b.title) LIKE ${q} 
          OR LOWER(p.display_name) LIKE ${q}
          OR LOWER(b.description) LIKE ${q}
        )
      ORDER BY b.views_count DESC
      LIMIT 10;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error searching books: ${error.message}`);
  }
}

// 13. GET BOOKS BY PERSONA
export async function findBooksByPersona(persona_id) {
  try {
    const result = await sql`
      SELECT 
        books.*,
        genres.name AS genre_name,
        genres.slug AS genre_slug
      FROM books
      LEFT JOIN genres ON books.genre_id = genres.id
      WHERE books.persona_id = ${persona_id} AND books.deleted_at IS NULL
      ORDER BY books.created_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching persona books: ${error.message}`);
  }
}

// 14. SOFT DELETE A BOOK
export async function softDeleteBook(book_id, persona_id) {
  try {
    const result = await sql`
      UPDATE books
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${book_id} AND persona_id = ${persona_id}
      RETURNING id, title, deleted_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error soft-deleting book: ${error.message}`);
  }
}

// 15. FIND BOOK BY ID
export async function findBookById(id) {
  try {
    const result = await sql`
      SELECT 
        books.*,
        genres.name AS genre_name,
        genres.slug AS genre_slug
      FROM books 
      LEFT JOIN genres ON books.genre_id = genres.id
      WHERE books.id = ${id} AND books.deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching book by id: ${error.message}`);
  }
}
