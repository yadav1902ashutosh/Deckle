import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. TABLE DEFINITION & MIGRATION
export async function createGenresTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT DEFAULT NULL,
        icon VARCHAR(50) DEFAULT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_genres_display_order ON genres(display_order);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);
    `;

    // Seed standard webnovel genres if empty
    await seedDefaultGenres();
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing genres table: ${error.message}`
    );
  }
}

// 2. SEED DEFAULT CURATED GENRES
export async function seedDefaultGenres() {
  try {
    const existing = await sql`SELECT COUNT(id) AS count FROM genres;`;
    if (parseInt(existing[0].count, 10) === 0) {
      console.log("Seeding default curated genres...");
      await sql`
        INSERT INTO genres (name, slug, description, icon, display_order)
        VALUES
          ('Progression Fantasy', 'progression-fantasy', 'Power scaling, cultivation of mastery, and training journeys.', 'Zap', 1),
          ('LitRPG & System', 'litrpg', 'Game mechanics, stat sheets, skill trees, and level-ups.', 'Layers', 2),
          ('Cultivation & Xianxia', 'cultivation', 'Daoist immortality, qi gathering, sects, and celestial tribulations.', 'Compass', 3),
          ('Sci-Fi & Cyberpunk', 'sci-fi', 'High tech, low life, space operas, AI singularity, and megacorps.', 'Cpu', 4),
          ('Dark Fantasy & Grimdark', 'dark-fantasy', 'Morally gray worlds, high stakes, eldritch horrors, and grim survival.', 'Moon', 5),
          ('Historical & Romance', 'romance', 'Emotional resonance, palace drama, slow-burn intrigue, and noble salons.', 'Heart', 6),
          ('Mystery & Thriller', 'mystery', 'Decoded puzzles, conspiracies, occult investigations, and suspense.', 'Search', 7),
          ('Slice of Life & Comedy', 'slice-of-life', 'Lighthearted daily antics, shopkeepers, crafting, and relaxed progression.', 'Coffee', 8)
        ON CONFLICT (slug) DO NOTHING;
      `;
    }
  } catch (err) {
    console.warn("Notice: Genre default seeding deferred or skipped:", err.message);
  }
}

// 3. FETCH ALL ACTIVE GENRES
export async function getAllGenres() {
  try {
    return await sql`
      SELECT id, name, slug, description, icon, display_order 
      FROM genres 
      WHERE is_active = TRUE 
      ORDER BY display_order ASC, name ASC;
    `;
  } catch (error) {
    throw new ApiError(500, `Error fetching genres: ${error.message}`);
  }
}

// 4. GET GENRE BY SLUG
export async function getGenreBySlug(slug) {
  try {
    const rows = await sql`
      SELECT id, name, slug, description, icon, display_order
      FROM genres
      WHERE slug = ${slug} AND is_active = TRUE
      LIMIT 1;
    `;
    return rows[0] || null;
  } catch (error) {
    throw new ApiError(500, `Error fetching genre '${slug}': ${error.message}`);
  }
}

// 5. CREATE GENRE (ADMIN)
export async function createGenre({ name, slug, description, icon, display_order = 0, is_active = true }) {
  try {
    const rows = await sql`
      INSERT INTO genres (name, slug, description, icon, display_order, is_active)
      VALUES (${name}, ${slug}, ${description || null}, ${icon || null}, ${display_order}, ${is_active})
      RETURNING *;
    `;
    return rows[0];
  } catch (error) {
    throw new ApiError(500, `Error creating genre: ${error.message}`);
  }
}
