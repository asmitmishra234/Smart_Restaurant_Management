import express from "express";

import {
    closeTableSession
} from "../controller/sessionManagement.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

// Only ADMIN and WAITER can close a paid table session
router.patch(
    "/:sessionId/close",
    protect,
    authorizeRoles("ADMIN", "WAITER"),
    closeTableSession
);

export default router;