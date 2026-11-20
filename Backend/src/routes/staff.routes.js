import express from "express";

import {
    createStaff,
    getAllStaff,
    updateStaff,
    toggleStaffStatus
} from "../controller/staff.controller.js";

import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

// All routes are ADMIN only
router.use(protect);
router.use(authorizeRoles("ADMIN"));

// Create staff
router.post("/", createStaff);

// Get all staff
router.get("/", getAllStaff);

// Update staff
router.put("/:id", updateStaff);

// Activate / Deactivate staff
router.patch("/:id/status", toggleStaffStatus);

export default router;