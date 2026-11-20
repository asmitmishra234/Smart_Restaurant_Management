import express from "express";

import {
    createFeedback,
    getAllFeedback,
    deleteFeedback
} from "../controller/feedback.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import verifyTableSession from "../middleware/tableSession.middleware.js";

const router = express.Router();

// Customer submits feedback
router.post(
    "/",
    verifyTableSession,
    createFeedback
);

// Admin views all feedback
router.get(
    "/",
    protect,
    authorizeRoles("ADMIN"),
    getAllFeedback
);

// Admin deletes feedback
router.delete(
    "/:id",
    protect,
    authorizeRoles("ADMIN"),
    deleteFeedback
);

export default router;