import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createPersonaTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS personas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(100) NOT NULL,
        handle VARCHAR(50) UNIQUE NOT NULL,
        bio TEXT,
        avatar_url TEXT DEFAULT 'https://via.placeholder.com/150',
        banner_url TEXT DEFAULT 'https://via.placeholder.com/400x150',
        is_default BOOLEAN DEFAULT FALSE,
        reading_preferences JSONB DEFAULT '{"theme": "parchment", "fontSize": 18, "fontFamily": "Merriweather", "favorite_genres": []}'::jsonb,
        streak_days INTEGER DEFAULT 0,
        total_words_read BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    // Migration helper: add columns to existing table if absent
    await sql`
      ALTER TABLE personas ADD COLUMN IF NOT EXISTS reading_preferences JSONB DEFAULT '{"theme": "parchment", "fontSize": 18, "fontFamily": "Merriweather", "favorite_genres": []}'::jsonb;
    `;
    await sql`
      ALTER TABLE personas ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
    `;
    await sql`
      ALTER TABLE personas ADD COLUMN IF NOT EXISTS total_words_read BIGINT DEFAULT 0;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_persona_per_user 
      ON personas (user_id) 
      WHERE is_default = TRUE;
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing personas table: ${error.message}`,
    );
  }
}

// 2. CREATE A NEW PERSONA
export async function createPersona({
  user_id,
  display_name,
  handle,
  bio,
  avatar_url,
  banner_url,
  is_default = false,
  reading_preferences,
}) {
  try {
    const defaultPreferences = {
      theme: "parchment",
      fontSize: 18,
      fontFamily: "Merriweather",
      favorite_genres: [],
    };

    const finalPreferences = reading_preferences
      ? JSON.stringify(reading_preferences)
      : JSON.stringify(defaultPreferences);

    const result = await sql`
      INSERT INTO personas (
        user_id,
        display_name,
        handle,
        bio,
        avatar_url,
        banner_url,
        is_default,
        reading_preferences
      )
      VALUES (
        ${user_id},
        ${display_name},
        ${handle.toLowerCase().trim()},
        ${bio || null},
        ${avatar_url || 'https://via.placeholder.com/150'},
        ${banner_url || 'https://via.placeholder.com/400x150'},
        ${is_default},
        ${finalPreferences}::jsonb
      )
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    if (error.code === '23505' || error.message.includes('unique constraint')) {
      throw new ApiError(409, `Persona handle "${handle}" is already taken!`);
    }
    throw new ApiError(500, `Database error creating persona: ${error.message}`);
  }
}

// 3. GET ALL PERSONAS OWNED BY A USER (For the "Switch Persona" menu)
export async function findPersonasByUserId(user_id) {
  try {
    const result = await sql`
      SELECT 
        id, 
        user_id, 
        display_name, 
        handle, 
        bio, 
        avatar_url, 
        banner_url, 
        is_default, 
        reading_preferences, 
        streak_days, 
        total_words_read, 
        created_at
      FROM personas
      WHERE user_id = ${user_id} AND deleted_at IS NULL
      ORDER BY is_default DESC, created_at ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching user personas: ${error.message}`);
  }
}

// 4. FIND PERSONA BY ID
export async function findPersonaById(id) {
  try {
    const result = await sql`
      SELECT 
        id, 
        user_id, 
        display_name, 
        handle, 
        bio, 
        avatar_url, 
        banner_url, 
        is_default, 
        reading_preferences, 
        streak_days, 
        total_words_read, 
        created_at
      FROM personas
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching persona by id: ${error.message}`);
  }
}

// 5. FIND PERSONA BY HANDLE (e.g. /@shadow_weaver)
export async function findPersonaByHandle(handle) {
  try {
    const result = await sql`
      SELECT 
        id, 
        user_id, 
        display_name, 
        handle, 
        bio, 
        avatar_url, 
        banner_url, 
        is_default, 
        reading_preferences, 
        streak_days, 
        total_words_read, 
        created_at
      FROM personas
      WHERE handle = ${handle.toLowerCase().trim()} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error fetching persona by handle: ${error.message}`);
  }
}

// 6. UPDATE PERSONA READING PREFERENCES (Persona is the driver)
export async function updatePersonaPreferences(persona_id, user_id, preferences) {
  try {
    const result = await sql`
      UPDATE personas
      SET reading_preferences = ${JSON.stringify(preferences)}::jsonb
      WHERE id = ${persona_id} AND user_id = ${user_id} AND deleted_at IS NULL
      RETURNING id, handle, reading_preferences;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error updating reading preferences: ${error.message}`);
  }
}

// 7. INCREMENT WORDS READ & STREAK (Persona is the driver)
export async function incrementPersonaReadingStats(persona_id, wordsCount = 0) {
  try {
    const result = await sql`
      UPDATE personas
      SET 
        total_words_read = total_words_read + ${wordsCount},
        streak_days = streak_days + 1
      WHERE id = ${persona_id} AND deleted_at IS NULL
      RETURNING id, streak_days, total_words_read;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error updating persona stats: ${error.message}`);
  }
}

// 8. SOFT DELETE PERSONA
export async function softDeletePersona(persona_id, user_id) {
  try {
    const result = await sql`
      UPDATE personas 
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${persona_id} AND user_id = ${user_id}
      RETURNING id, handle, deleted_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error soft-deleting persona: ${error.message}`);
  }
}