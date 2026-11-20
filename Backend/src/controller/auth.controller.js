
import User from "../models/user.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict"
    };
};

// STAFF LOGIN
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({
        email: email.toLowerCase()
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is inactive");
    }

    const token = generateToken(user._id);

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    res.cookie("token", token, {
        ...getCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(
        new ApiResponse(200, userData, "Login successful")
    );
});

// STAFF LOGOUT
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", getCookieOptions());

    res.status(200).json(
        new ApiResponse(200, null, "Logout successful")
    );
});

// GET CURRENT USER
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});
