import sql from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";

// 1. FUNCTION TO CREATE THE USERS TABLE
export async function createUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) DEFAULT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'reader' CHECK (role IN ('developer', 'admin', 'writer', 'reader')),
        gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        dob DATE,
        refresh_token TEXT,
        avatar_url TEXT DEFAULT 'https://via.placeholder.com/150',
        banner_url TEXT DEFAULT 'https://via.placeholder.com/150',
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    // Migration helper: ensure existing tables allow NULL for full_name
    await sql`
      ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    `;

    // User settings table (Reader ergonomics, theme, font preferences)
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(50) DEFAULT 'parchment',
        font_family VARCHAR(50) DEFAULT 'Newsreader',
        font_size INTEGER DEFAULT 18,
        line_height NUMERIC(3, 2) DEFAULT 1.60,
        content_width VARCHAR(20) DEFAULT 'normal',
        bionic_reading BOOLEAN DEFAULT FALSE,
        sound_effects BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // User sessions table (For device tracking and session revocation)
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_name VARCHAR(100) DEFAULT 'Web Browser',
        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
        user_agent TEXT,
        is_current BOOLEAN DEFAULT FALSE,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error initializing users table: ${error.message}`
    );
  }
}

// 2. USER REGISTRATION: INSERT A NEW USER IN THE TABLE
export async function createUser({
  full_name,
  username,
  email,
  password,
  role,
  gender,
  dob,
  avatar_url,
  banner_url
}) {
  try {
    const result = await sql`
      INSERT INTO users (
        full_name,
        username,
        email,
        password,
        role,
        gender,
        dob,
        avatar_url,
        banner_url
      )
      VALUES (
        ${full_name},
        ${username},
        ${email},
        ${password},
        ${role || "reader"},
        ${gender || null},
        ${dob || null},
        ${avatar_url || "https://via.placeholder.com/150"},
        ${banner_url || "https://via.placeholder.com/150"}
      )
      RETURNING id, full_name, username, email, role, gender, dob, avatar_url, banner_url, created_at;
    `;

    // Seed default settings row
    if (result[0]?.id) {
      await sql`
        INSERT INTO user_settings (user_id) VALUES (${result[0].id})
        ON CONFLICT (user_id) DO NOTHING;
      `;
    }

    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error creating user: ${error.message}`);
  }
}

// 3. FIND USER BY EMAIL (FOR LOGIN)
export async function findUserByEmail(email) {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error searching user by email: ${error.message}`
    );
  }
}

// 4. FIND USER BY USERNAME (FOR LOGIN)
export async function findUserByUsername(username) {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE username = ${username} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error searching user by username: ${error.message}`
    );
  }
}

// 5. GET CURRENT USER OR FIND USER BY ID
export async function findUserById(id) {
  try {
    const result = await sql`
      SELECT id, full_name, username, email, role, gender, dob, avatar_url, banner_url, two_factor_enabled, created_at
      FROM users
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error searching user by id: ${error.message}`
    );
  }
}

// 6. SAVE/UPDATE REFRESH TOKEN IN DB
export async function updateUserRefreshToken(user_id, refresh_token) {
  try {
    const result = await sql`
      UPDATE users
      SET refresh_token = ${refresh_token}
      WHERE id = ${user_id}
      RETURNING id, username, email;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(
      500,
      `Database error updating refresh token: ${error.message}`
    );
  }
}

// 7. CLEAR REFRESH TOKEN ON LOGOUT
export async function clearUserRefreshToken(user_id) {
  try {
    await sql`
      UPDATE users
      SET refresh_token = NULL
      WHERE id = ${user_id};
    `;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error clearing refresh token: ${error.message}`
    );
  }
}

// 7b. FIND USER WITH REFRESH TOKEN (FOR TOKEN REFRESHING)
export async function findUserWithRefreshTokenById(id) {
  try {
    const result = await sql`
      SELECT id, full_name, username, email, role, refresh_token, deleted_at
      FROM users
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(
      500,
      `Database error retrieving user refresh token: ${error.message}`
    );
  }
}

// 8. SOFT DELETE USER
export async function softDeleteUser(user_id) {
  try {
    const result = await sql`
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP, refresh_token = NULL
      WHERE id = ${user_id}
      RETURNING id, username, deleted_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error soft-deleting user: ${error.message}`);
  }
}

// 9. FIND USER WITH PASSWORD BY ID
export async function findUserWithPasswordById(id) {
  try {
    const result = await sql`
      SELECT * FROM users
      WHERE id = ${id} AND deleted_at IS NULL;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error searching user: ${error.message}`);
  }
}

// 10. UPDATE USER PROFILE (MASTER ACCOUNT)
export async function updateUserProfile(id, { full_name, avatar_url, banner_url, gender, dob }) {
  try {
    const result = await sql`
      UPDATE users
      SET
        full_name = COALESCE(${full_name}, full_name),
        avatar_url = COALESCE(${avatar_url}, avatar_url),
        banner_url = COALESCE(${banner_url}, banner_url),
        gender = COALESCE(${gender}, gender),
        dob = COALESCE(${dob}, dob)
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, full_name, username, email, role, gender, dob, avatar_url, banner_url, created_at;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error updating user profile: ${error.message}`);
  }
}

// 11. UPDATE USER PASSWORD
export async function updateUserPassword(id, hashedPassword) {
  try {
    const result = await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id, username, email;
    `;
    return result[0] || null;
  } catch (error) {
    throw new ApiError(500, `Database error updating password: ${error.message}`);
  }
}

// 12. PROMOTE USER TO WRITER
export async function promoteUserToWriter(user_id) {
  try {
    const result = await sql`
      UPDATE users
      SET role = 'writer'
      WHERE id = ${user_id} AND role = 'reader' AND deleted_at IS NULL
      RETURNING id, username, role;
    `;
    return result[0] || null;
  } catch (error) {
    console.error("Database error promoting user role to writer:", error);
    return null;
  }
}

// 13. GET USER SETTINGS
export async function getUserSettings(user_id) {
  try {
    const result = await sql`
      SELECT * FROM user_settings WHERE user_id = ${user_id} LIMIT 1;
    `;
    if (result[0]) return result[0];

    // Auto-create default settings row if missing
    const created = await sql`
      INSERT INTO user_settings (user_id) VALUES (${user_id})
      ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return created[0];
  } catch (error) {
    throw new ApiError(500, `Database error fetching user settings: ${error.message}`);
  }
}

// 14. UPDATE USER SETTINGS
export async function updateUserSettings(user_id, updates = {}) {
  try {
    const {
      theme,
      font_family,
      font_size,
      line_height,
      content_width,
      bionic_reading,
      sound_effects,
      email_notifications,
    } = updates;

    const result = await sql`
      INSERT INTO user_settings (
        user_id,
        theme,
        font_family,
        font_size,
        line_height,
        content_width,
        bionic_reading,
        sound_effects,
        email_notifications
      )
      VALUES (
        ${user_id},
        ${theme || 'parchment'},
        ${font_family || 'Newsreader'},
        ${font_size || 18},
        ${line_height || 1.60},
        ${content_width || 'normal'},
        ${bionic_reading || false},
        ${sound_effects || false},
        ${email_notifications !== undefined ? email_notifications : true}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        theme = COALESCE(${theme}, user_settings.theme),
        font_family = COALESCE(${font_family}, user_settings.font_family),
        font_size = COALESCE(${font_size}, user_settings.font_size),
        line_height = COALESCE(${line_height}, user_settings.line_height),
        content_width = COALESCE(${content_width}, user_settings.content_width),
        bionic_reading = COALESCE(${bionic_reading}, user_settings.bionic_reading),
        sound_effects = COALESCE(${sound_effects}, user_settings.sound_effects),
        email_notifications = COALESCE(${email_notifications}, user_settings.email_notifications),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error updating user settings: ${error.message}`);
  }
}

// 15. GET 7-DAY READING VELOCITY
export async function getUserReadingVelocity(user_id) {
  try {
    const result = await sql`
      SELECT 
        TO_CHAR(d.day, 'Mon DD') AS day_label,
        d.day::date AS date,
        COALESCE(l.words_read, 0)::bigint AS words,
        COALESCE(l.minutes_read, 0)::int AS minutes
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN user_reading_logs l 
        ON l.user_id = ${user_id} AND l.read_date = d.day::date
      ORDER BY d.day ASC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching reading velocity: ${error.message}`);
  }
}

// 16. GET GENRE AFFINITY
export async function getUserGenreAffinity(user_id) {
  try {
    const result = await sql`
      SELECT 
        COALESCE(g.name, 'Uncategorized') AS genre,
        COUNT(rh.id)::int AS book_count,
        ROUND((COUNT(rh.id)::numeric / NULLIF((SELECT COUNT(*) FROM reading_history WHERE persona_id IN (SELECT id FROM personas WHERE user_id = ${user_id})), 0)) * 100, 1) AS percentage
      FROM reading_history rh
      JOIN books b ON rh.book_id = b.id
      LEFT JOIN genres g ON b.genre_id = g.id
      WHERE rh.persona_id IN (SELECT id FROM personas WHERE user_id = ${user_id})
      GROUP BY g.name
      ORDER BY book_count DESC
      LIMIT 5;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching genre affinity: ${error.message}`);
  }
}

// 17. GET USER SESSIONS
export async function getUserSessionsList(user_id) {
  try {
    const result = await sql`
      SELECT id, device_name, ip_address, user_agent, is_current, last_active, created_at
      FROM user_sessions
      WHERE user_id = ${user_id}
      ORDER BY last_active DESC;
    `;
    return result;
  } catch (error) {
    throw new ApiError(500, `Database error fetching user sessions: ${error.message}`);
  }
}

// 18. REVOKE A SINGLE SESSION
export async function revokeSessionById(user_id, session_id) {
  try {
    await sql`
      DELETE FROM user_sessions WHERE id = ${session_id} AND user_id = ${user_id};
    `;
    return true;
  } catch (error) {
    throw new ApiError(500, `Database error revoking session: ${error.message}`);
  }
}

// 19. TOGGLE 2FA
export async function toggleUser2FA(user_id, enabled) {
  try {
    const result = await sql`
      UPDATE users
      SET two_factor_enabled = ${Boolean(enabled)}
      WHERE id = ${user_id}
      RETURNING id, two_factor_enabled;
    `;
    return result[0];
  } catch (error) {
    throw new ApiError(500, `Database error updating 2FA: ${error.message}`);
  }
}