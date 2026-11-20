
import express from "express";

import {
    createTable,
    getAllTables,
    getSingleTable,
    updateTable,
    toggleTableStatus,
    deleteTable
} from "../controller/table.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All table management routes require Admin
router.use(protect, authorizeRoles("ADMIN"));

// Create table
router.post("/", createTable);

// Get all tables
router.get("/", getAllTables);

// Get single table
router.get("/:id", getSingleTable);

// Update table
router.put("/:id", updateTable);

// Activate / Deactivate table
router.patch("/:id/status", toggleTableStatus);

// Delete table
router.delete("/:id", deleteTable);

export default router;
