import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION
export async function createVolumesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS volumes (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        volume_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        cover_image TEXT DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        UNIQUE (book_id, volume_number)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_volumes_book_id ON volumes(book_id);
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing volumes table: ${error.message}`
    );
  }
}

// 2. CREATE A NEW VOLUME
export async function createVolume({
  book_id,
  volume_number,
  title,
  description,
  cover_image,
}) {
  try {
    // Check existing max volume number to enforce consecutive ordering
    const existing = await sql`
      SELECT COALESCE(MAX(volume_number), 0) AS max_vol
      FROM volumes
      WHERE book_id = ${book_id} AND deleted_at IS NULL;
    `;
    const maxVol = Number(existing[0]?.max_vol || 0);
    const targetVolNum =
      volume_number !== undefined && volume_number !== null && volume_number !== ""
        ? Number(volume_number)
        : maxVol + 1;

    if (targetVolNum !== maxVol + 1) {
      throw new ApiError(
        400,
        `Volume numbers must be consecutive. Current maximum is Volume ${maxVol}. The next volume must be Volume ${maxVol + 1}.`
      );
    }

    const result = await sql`
      INSERT INTO volumes (
        book_id,
        volume_number,
        title,
        description,
        cover_image
      )
      VALUES (
        ${book_id},
        ${targetVolNum},
        ${title},
        ${description || null},
        ${cover_image || null}
      )
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        `Volume number already exists for this book!`
      );
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Database error creating volume: ${error.message}`);
  }
}

// 3. GET ALL VOLUMES FOR A GIVEN BOOK
export async function findVolumesByBookId(book_id) {
  try {
    const result = await sql`
      SELECT 
        v.*,
        COUNT(c.id) AS chapters_count,
        COALESCE(SUM(c.words_count), 0) AS total_words
      FROM volumes v
      LEFT JOIN chapters c ON c.volume_id = v.id AND c.deleted_at IS NULL
      WHERE v.book_id = ${book_id} AND v.deleted_at IS NULL
      GROUP BY v.id
      ORDER BY v.volume_number ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error fetching book volumes: ${error.message}`
    );
  }
}

// 4. FIND VOLUME BY ID
export async function findVolumeById(id) {
  try {
    const result = await sql`
      SELECT * FROM volumes 
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error finding volume: ${error.message}`);
  }
}

// 5. SOFT DELETE A VOLUME
export async function softDeleteVolume(id) {
  try {
    const result = await sql`
      UPDATE volumes 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, title, deleted_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error soft-deleting volume: ${error.message}`
    );
  }
}
