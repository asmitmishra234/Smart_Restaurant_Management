
import express from "express";

import {
    createWaiterRequest,
    getAllWaiterRequests,
    updateWaiterRequestStatus
} from "../controller/waiterRequest.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { verifyTableSession } from "../middleware/tableSession.middleware.js";

const router = express.Router();

// Customer creates a waiter request
router.post(
    "/",
    verifyTableSession,
    createWaiterRequest
);

// Admin and Waiter view all requests
router.get(
    "/",
    protect,
    authorizeRoles("ADMIN", "WAITER"),
    getAllWaiterRequests
);

// Admin and Waiter update request status
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("ADMIN", "WAITER"),
    updateWaiterRequestStatus
);

export default router;
