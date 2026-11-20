
import express from "express";

import {
    createCategory,
    getCategories,
    getAllCategories,
    updateCategory,
    toggleCategoryStatus,
    deleteCategory
} from "../controller/category.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Customer: Get active categories
router.get("/", getCategories);

// Admin: Get all categories
router.get(
    "/admin/all",
    protect,
    authorizeRoles("ADMIN"),
    getAllCategories
);

// Admin: Create category
router.post(
    "/",
    protect,
    authorizeRoles("ADMIN"),
    createCategory
);

// Admin: Update category
router.put(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    updateCategory
);

// Admin: Change category status
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("ADMIN"),
    toggleCategoryStatus
);

// Admin: Delete category
router.delete(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    deleteCategory
);

export default router;
