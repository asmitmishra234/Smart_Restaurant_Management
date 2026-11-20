import express from "express";

import {
    getSalesReport
} from "../controller/report.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/sales",
    protect,
    authorizeRoles("ADMIN"),
    getSalesReport
);

export default router;