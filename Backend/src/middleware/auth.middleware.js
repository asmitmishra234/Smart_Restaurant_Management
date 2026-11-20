
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        throw new ApiError(401, "Please login first");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
        throw new ApiError(401, "User not found or inactive");
    }

    req.user = user;

    next();
});

export default protect