
import express from "express";

import {
    createOrder,
    getAllOrders,
    getMyOrders,
    updateOrderStatus
} from "../controller/order.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { verifyTableSession } from "../middleware/tableSession.middleware.js";

const router = express.Router();

// Customer: Place order
router.post("/", verifyTableSession, createOrder);

// Customer: View own session orders
router.get("/my-orders", verifyTableSession, getMyOrders);

// Admin, Kitchen and Waiter: View all orders
router.get(
    "/",
    protect,
    authorizeRoles("ADMIN", "KITCHEN", "WAITER"),
    getAllOrders
);

// Update order status based on staff role
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("ADMIN", "KITCHEN", "WAITER"),
    updateOrderStatus
);

export default router;
