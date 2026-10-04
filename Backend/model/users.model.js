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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `;

    // Migration helper: ensure existing tables allow NULL for full_name
    await sql`
      ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
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
      SELECT id, full_name, username, email, role, gender, dob, avatar_url, banner_url, created_at
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

// 12. PROMOTE USER TO WRITER (SYSTEM-DEFINED ROLE PROMOTION)
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