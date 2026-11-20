import express from "express";

import {
    getDashboardStats
} from "../controller/dashboard.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/stats",
    protect,
    authorizeRoles("ADMIN"),
    getDashboardStats
);

export default router;