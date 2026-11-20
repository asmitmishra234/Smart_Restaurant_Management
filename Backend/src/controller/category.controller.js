
import Category from "../models/category.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE CATEGORY
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({
        name: name.trim(),
        isDeleted: false
    });

    if (existingCategory) {
        throw new ApiError(409, "Category already exists");
    }

    const category = await Category.create({
        name: name.trim(),
        description,
        image
    });

    res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

// GET ALL ACTIVE CATEGORIES (CUSTOMER)
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({
        isActive: true,
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

// GET ALL CATEGORIES (ADMIN)
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, categories, "All categories fetched successfully")
    );
});

// UPDATE CATEGORY
export const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;

    const category = await Category.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new ApiError(400, "Category name cannot be empty");
        }

        const duplicate = await Category.findOne({
            _id: { $ne: category._id },
            name: name.trim(),
            isDeleted: false
        });

        if (duplicate) {
            throw new ApiError(409, "Category name already exists");
        }

        category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

// ACTIVATE / DEACTIVATE CATEGORY
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    category.isActive = !category.isActive;

    await category.save();

    res.status(200).json(
        new ApiResponse(200, category, "Category status updated")
    );
});

// SOFT DELETE CATEGORY
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    category.isDeleted = true;
    category.isActive = false;

    await category.save();

    res.status(200).json(
        new ApiResponse(200, null, "Category deleted successfully")
    );
});
