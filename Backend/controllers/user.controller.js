import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUserRefreshToken,
  clearUserRefreshToken,
  findUserWithRefreshTokenById,
  findUserWithPasswordById,
  updateUserProfile,
  updateUserPassword,
  getUserSettings,
  updateUserSettings,
  getUserReadingVelocity,
  getUserGenreAffinity,
  getUserSessionsList,
  revokeSessionById,
  toggleUser2FA,
} from '../model/users.model.js';
import { createPersona, findPersonasByUserId } from '../model/personas.model.js';
import { getFallbackAvatar, getFallbackBanner } from '../utils/imageReference.js';

// 1. HELPER FUNCTION TO GENERATE TOKENS
async function generateAccessAndRefreshTokens(user_id, email, role) {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new ApiError(500, "JWT secrets are missing in .env!");
  }

  const access_token = jwt.sign(
    {
      id: user_id,
      email: email,
      role: role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );

  const refresh_token = jwt.sign(
    {
      id: user_id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );

  return { access_token, refresh_token };
}

// 2. REGISTER USER
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, full_name, gender, dob, avatar_url, banner_url } = req.body;

  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Username, email, and password are required!");
  }

  const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();

  const existingEmail = await findUserByEmail(email.toLowerCase().trim());
  if (existingEmail) {
    throw new ApiError(409, "User with this email already exists!");
  }
  const existingUsername = await findUserByUsername(cleanUsername);
  if (existingUsername) {
    throw new ApiError(409, "Username is already taken!");
  }

  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (error) {
    throw new ApiError(500, "Error hashing password credentials");
  }

  const resolvedFullName = full_name?.trim() || null;
  const resolvedDisplayName = full_name?.trim() || cleanUsername;
  const resolvedAvatar = avatar_url?.trim() || getFallbackAvatar(cleanUsername);
  const resolvedBanner = banner_url?.trim() || getFallbackBanner(cleanUsername);

  const newUser = await createUser({
    full_name: resolvedFullName,
    username: cleanUsername,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "reader",
    gender: gender || null,
    dob: dob || null,
    avatar_url: resolvedAvatar,
    banner_url: resolvedBanner,
  });

  const defaultPersona = await createPersona({
    user_id: newUser.id,
    display_name: resolvedDisplayName,
    handle: cleanUsername,
    bio: `Hello, I'm ${resolvedDisplayName}! Welcome to my reading space.`,
    avatar_url: resolvedAvatar,
    banner_url: resolvedBanner,
    is_default: true,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: newUser, defaultPersona },
        "User registered successfully with default persona!",
      ),
    );
});

// 3. LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password?.trim() || (!email?.trim() && !username?.trim())) {
    throw new ApiError(400, "Password and either email or username is required");
  }

  let user = null;
  if (email) {
    user = await findUserByEmail(email.toLowerCase().trim());
  } else if (username) {
    user = await findUserByUsername(username.toLowerCase().trim());
  }
  if (!user) {
    throw new ApiError(404, "No account found with those credentials!");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password credentials!");
  }

  const { access_token, refresh_token } = await generateAccessAndRefreshTokens(
    user.id,
    user.email,
    user.role
  );

  await updateUserRefreshToken(user.id, refresh_token);

  const personas = await findPersonasByUserId(user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  const { password: _, refresh_token: __, ...safeUser } = user;

  return res
    .status(200)
    .cookie("accessToken", access_token, cookieOptions)
    .cookie("refreshToken", refresh_token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          personas,
          accessToken: access_token,
          refreshToken: refresh_token,
        },
        "User logged in successfully!",
      ),
    );
});

// 4. LOGOUT USER
export const logoutUser = asyncHandler(async (req, res) => {
  await clearUserRefreshToken(req.user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

// 4b. REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.cookies?.refresh_token ||
    req.body?.refreshToken ||
    req.body?.refresh_token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await findUserWithRefreshTokenById(decoded.id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token: User no longer exists");
  }

  if (user.refresh_token !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is expired or has been invalidated");
  }

  const { access_token, refresh_token: new_refresh_token } =
    await generateAccessAndRefreshTokens(user.id, user.email, user.role);

  await updateUserRefreshToken(user.id, new_refresh_token);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", access_token, cookieOptions)
    .cookie("refreshToken", new_refresh_token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: access_token,
          refreshToken: new_refresh_token,
        },
        "Access token refreshed successfully!"
      )
    );
});

// 5. GET CURRENT USER
export const getCurrentUser = asyncHandler(async (req, res) => {
  const personas = await findPersonasByUserId(req.user.id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user, personas },
        "Current user profile fetched successfully!",
      ),
    );
});

// 6. UPDATE MASTER USER PROFILE
export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, avatar_url, banner_url, gender, dob } = req.body;

  const updatedUser = await updateUserProfile(req.user.id, {
    full_name: full_name !== undefined ? full_name : null,
    avatar_url: avatar_url !== undefined ? avatar_url : null,
    banner_url: banner_url !== undefined ? banner_url : null,
    gender: gender !== undefined ? gender : null,
    dob: dob !== undefined ? dob : null,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "Master profile updated successfully")
    );
});

// 7. CHANGE MASTER USER PASSWORD
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw new ApiError(400, "Current and new password are required");
  }

  if (newPassword.trim().length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await findUserWithPasswordById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await updateUserPassword(req.user.id, hashedPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// 8. REVOKE OTHER SESSIONS
export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const { access_token, refresh_token } = await generateAccessAndRefreshTokens(
    req.user.id,
    req.user.email,
    req.user.role
  );

  await updateUserRefreshToken(req.user.id, refresh_token);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", access_token, cookieOptions)
    .cookie("refreshToken", refresh_token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken: access_token, refreshToken: refresh_token },
        "All other active sessions revoked successfully"
      )
    );
});

// 9. GET USER SETTINGS
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getUserSettings(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, settings, "User settings fetched successfully"));
});

// 10. UPDATE USER SETTINGS
export const updateSettings = asyncHandler(async (req, res) => {
  const updated = await updateUserSettings(req.user.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, updated, "User settings updated successfully"));
});

// 11. GET READING VELOCITY (7-day daily activity)
export const getReadingVelocity = asyncHandler(async (req, res) => {
  const velocity = await getUserReadingVelocity(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, velocity, "Reading velocity fetched successfully"));
});

// 12. GET GENRE AFFINITY
export const getGenreAffinity = asyncHandler(async (req, res) => {
  const affinity = await getUserGenreAffinity(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, affinity, "Genre affinity fetched successfully"));
});

// 13. GET USER SESSIONS
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await getUserSessionsList(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, sessions, "User sessions fetched successfully"));
});

// 14. REVOKE A SINGLE SESSION
export const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await revokeSessionById(req.user.id, Number(id));
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session revoked successfully"));
});

// 15. TOGGLE 2FA
export const toggle2FA = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const result = await toggleUser2FA(req.user.id, enabled);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Two-factor authentication updated"));
});