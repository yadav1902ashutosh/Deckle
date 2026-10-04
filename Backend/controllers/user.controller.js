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
  findUserWithPasswordById,
  updateUserProfile,
  updateUserPassword
} from '../model/users.model.js';
import { createPersona, findPersonasByUserId } from '../model/personas.model.js';
import { getFallbackAvatar, getFallbackBanner } from '../utils/imageReference.js';

// 1. HELPER FUNCTION TO GENERATE TOKENS
async function generateAccessAndRefreshTokens(user_id, email, role) {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new ApiError(500, "JWT secrets are missing in .env!");
  }

  // 1. Generate access token (15 mins)
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

  // 2. Generate refresh token (7 days)
  const refresh_token = jwt.sign(
    {
      id: user_id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );

  if (!access_token || !refresh_token) {
    throw new ApiError(500, "Something went wrong while creating access and refresh tokens");
  }

  return { access_token, refresh_token };
}

// 2. REGISTER USER (3-Field Registration: username, email, password)
export const registerUser = asyncHandler(async (req, res) => {
  // Security & Architecture: role is strictly SYSTEM-DEFINED ('reader' on creation), never client-defined.
  const { username, email, password, full_name, gender, dob, avatar_url, banner_url } = req.body;

  // Validation: Only username, email, and password are required
  if (
    !username?.trim() ||
    !email?.trim() ||
    !password?.trim()
  ) {
    throw new ApiError(
      400,
      "Username, email, and password are required!",
    );
  }

  // Format clean username (e.g. remove leading '@')
  const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();

  // Check unique constraints
  const existingEmail = await findUserByEmail(email.toLowerCase().trim());
  if (existingEmail) {
    throw new ApiError(409, "User with this email already exists!");
  }
  const existingUsername = await findUserByUsername(cleanUsername);
  if (existingUsername) {
    throw new ApiError(409, "Username is already taken!");
  }

  // Hash password
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

  // 1. Create the user account with system-defined 'reader' role
  const newUser = await createUser({
    full_name: resolvedFullName,
    username: cleanUsername,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: "reader", // System-defined default role
    gender: gender || null,
    dob: dob || null,
    avatar_url: resolvedAvatar,
    banner_url: resolvedBanner,
  });

  // 2. Automatically generate their initial Default Persona
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

// 3. LOGIN USER (Accepts Email OR Username)
export const loginUser = asyncHandler(async (req, res) => {

  const {email, username, password } = req.body;

  if(!password?.trim() || (!email?.trim() && !username?.trim()))
  {
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
  )

  await updateUserRefreshToken(user.id, refresh_token);

  const personas = await   findPersonasByUserId(user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  // Remove password and refresh_token so they are never exposed in the response
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
})


//4.LOGOUT USER
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
})


//5.  GET CURRENT USER
export const getCurrentUser = asyncHandler(async(req, res) => {
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