import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/ApiError.js';
import { asyncHandler} from '../utils/asyncHandler.js';
import { findUserById } from '../model/users.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) =>
{
    try {
        const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");

        if(!token)
        {
            throw new ApiError(401, "Unauthorized request: No access token provided");
        }

        const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await findUserById(decoded_token.id);

        if(!user)
        {
            throw new ApiError(401, "Invalid access token: User does not exist");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid or expired access token");
    }
})