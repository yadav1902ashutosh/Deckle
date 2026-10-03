import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION
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
        status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
        views_count INTEGER DEFAULT 0,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_books_persona_id ON books(persona_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_active_books_created 
      ON books(created_at DESC) 
      WHERE deleted_at IS NULL;
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
        status,
        tags
      )
      VALUES (
        ${title},
        ${slug},
        ${description},
        ${cover_image || "https://via.placeholder.com/300x450"},
        ${persona_id},
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

// 3. GET ACTIVE BOOKS (Catalog feed - joins with personas!)
export async function findActiveBooks() {
  try {
    const result = await sql`
      SELECT 
        books.*,
        personas.display_name AS author_name,
        personas.handle AS author_handle,
        personas.avatar_url AS author_avatar
      FROM books
      JOIN personas ON books.persona_id = personas.id
      WHERE books.deleted_at IS NULL AND personas.deleted_at IS NULL
      ORDER BY books.created_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching books: ${error.message}`);
  }
}

// 4. FIND BOOK BY SLUG (Single book detail page)
export async function findBookBySlug(slug) {
  try {
    const result = await sql`
      SELECT 
        books.*,
        personas.display_name AS author_name,
        personas.handle AS author_handle,
        personas.avatar_url AS author_avatar,
        personas.bio AS author_bio
      FROM books
      JOIN personas ON books.persona_id = personas.id
      WHERE books.slug = ${slug} 
        AND books.deleted_at IS NULL 
        AND personas.deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching book by slug: ${error.message}`,
    );
  }
}

// 5. GET BOOKS BY PERSONA
export async function findBooksByPersona(persona_id) {
  try {
    const result = await sql`
      SELECT * FROM books
      WHERE persona_id = ${persona_id} AND deleted_at IS NULL
      ORDER BY created_at DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching persona books: ${error.message}`,
    );
  }
}

// 6. SOFT DELETE A BOOK
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
    throw new ApiError(
      500,
      `Database error soft-deleting book: ${error.message}`,
    );
  }
}

// 7. FIND BOOK BY ID
export async function findBookById(id) {
  try {
    const result = await sql`
      SELECT * FROM books 
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching book by id: ${error.message}`);
  }
}
