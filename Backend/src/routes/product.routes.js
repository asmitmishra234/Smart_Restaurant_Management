
import express from "express";

import {
    createProduct,
    getProducts,
    getAllProducts,
    updateProduct,
    toggleProductAvailability,
    deleteProduct
} from "../controller/product.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// Customer: Get available products
router.get("/", getProducts);

// Admin: Get all products
router.get(
    "/admin/all",
    protect,
    authorizeRoles("ADMIN"),
    getAllProducts
);

// Admin: Create product
router.post(
    "/",
    protect,
    authorizeRoles("ADMIN"),
    createProduct
);

// Admin: Update product
router.put(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    updateProduct
);

// Admin: Toggle availability
router.patch(
    "/:id/availability",
    protect,
    authorizeRoles("ADMIN"),
    toggleProductAvailability
);

// Admin: Delete product
router.delete(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    deleteProduct
);

export default router;
