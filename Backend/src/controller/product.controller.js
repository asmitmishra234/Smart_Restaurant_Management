
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE PRODUCT
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        category,
        price,
        image,
        foodType,
        preparationTime
    } = req.body;

    if (
        !name?.trim() ||
        !category ||
        price === undefined ||
        !foodType ||
        preparationTime === undefined
    ) {
        throw new ApiError(400, "Please provide all required fields");
    }

    const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
        isDeleted: false
    });

    if (!categoryExists) {
        throw new ApiError(400, "Invalid or inactive category");
    }

    const product = await Product.create({
        name,
        description,
        category,
        price,
        image,
        foodType,
        preparationTime
    });

    res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

// GET AVAILABLE PRODUCTS (CUSTOMER)
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
        isAvailable: true,
        isDeleted: false
    })
    .populate("category", "name")
    .sort({ createdAt: -1 });

    const activeProducts = products.filter(
        product => product.category?.isActive
    );

    res.status(200).json(
        new ApiResponse(200, activeProducts, "Products fetched successfully")
    );
});

// GET ALL PRODUCTS (ADMIN)
export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
        isDeleted: false
    })
    .populate("category", "name isActive")
    .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, products, "All products fetched successfully")
    );
});

// UPDATE PRODUCT
export const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        category,
        price,
        image,
        foodType,
        preparationTime
    } = req.body;

    const product = await Product.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (category !== undefined) {
        const categoryExists = await Category.findOne({
            _id: category,
            isActive: true,
            isDeleted: false
        });

        if (!categoryExists) {
            throw new ApiError(400, "Invalid or inactive category");
        }

        product.category = category;
    }

    if (name !== undefined) {
        if (!name.trim()) {
            throw new ApiError(400, "Product name cannot be empty");
        }
        product.name = name.trim();
    }

    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;

    if (price !== undefined) {
        if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            throw new ApiError(400, "Invalid product price");
        }
        product.price = Number(price);
    }

    if (foodType !== undefined) {
        if (!["VEG", "NON_VEG", "EGG"].includes(foodType)) {
            throw new ApiError(400, "Invalid food type");
        }
        product.foodType = foodType;
    }

    if (preparationTime !== undefined) {
        if (
            !Number.isInteger(Number(preparationTime)) ||
            Number(preparationTime) < 1
        ) {
            throw new ApiError(400, "Invalid preparation time");
        }
        product.preparationTime = Number(preparationTime);
    }

    await product.save();

    res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

// CHANGE PRODUCT AVAILABILITY
export const toggleProductAvailability = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.isAvailable = !product.isAvailable;

    await product.save();

    res.status(200).json(
        new ApiResponse(200, product, "Product availability updated")
    );
});

// SOFT DELETE PRODUCT
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.isDeleted = true;
    product.isAvailable = false;

    await product.save();

    res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    );
});
