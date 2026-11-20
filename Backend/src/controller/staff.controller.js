import User from "../models/user.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE STAFF
export const createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (!["KITCHEN", "WAITER"].includes(role)) {
        throw new ApiError(400, "Invalid staff role");
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({
        email: email.toLowerCase().trim()
    });

    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    const staff = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        role
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role
            },
            "Staff created successfully"
        )
    );
});

// GET ALL STAFF
export const getAllStaff = asyncHandler(async (req, res) => {
    const staff = await User.find({
        role: { $in: ["KITCHEN", "WAITER"] }
    }).select("-password");

    res.status(200).json(
        new ApiResponse(200, staff, "Staff fetched successfully")
    );
});

// UPDATE STAFF
export const updateStaff = asyncHandler(async (req, res) => {
    const { name, phone, role } = req.body;

    const staff = await User.findOne({
        _id: req.params.id,
        role: { $in: ["KITCHEN", "WAITER"] }
    });

    if (!staff) {
        throw new ApiError(404, "Staff member not found");
    }

    if (name !== undefined) staff.name = name;
    if (phone !== undefined) staff.phone = phone;

    if (role !== undefined) {
        if (!["KITCHEN", "WAITER"].includes(role)) {
            throw new ApiError(400, "Invalid staff role");
        }

        staff.role = role;
    }

    await staff.save();

    res.status(200).json(
        new ApiResponse(200, staff, "Staff updated successfully")
    );
});

// CHANGE STAFF STATUS
export const toggleStaffStatus = asyncHandler(async (req, res) => {
    const staff = await User.findOne({
        _id: req.params.id,
        role: { $in: ["KITCHEN", "WAITER"] }
    });

    if (!staff) {
        throw new ApiError(404, "Staff member not found");
    }

    staff.isActive = !staff.isActive;

    await staff.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                id: staff._id,
                name: staff.name,
                role: staff.role,
                isActive: staff.isActive
            },
            "Staff status updated successfully"
        )
    );
});