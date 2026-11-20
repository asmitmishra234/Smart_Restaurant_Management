
import express from "express";

import {
    generateInvoice,
    getMyInvoice,
    getAllInvoices
} from "../controller/invoice.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { verifyTableSession } from "../middleware/tableSession.middleware.js";

const router = express.Router();

// CUSTOMER
router.post("/generate", verifyTableSession, generateInvoice);
router.get("/my-invoice", verifyTableSession, getMyInvoice);

// ADMIN
router.get(
    "/",
    protect,
    authorizeRoles("ADMIN"),
    getAllInvoices
);

export default router;
