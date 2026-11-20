
import express from "express";

import {
    scanTableQR
} from "../controller/tableSession.controller.js";

const router = express.Router();

// Customer scans QR code
router.post("/scan", scanTableQR);

export default router;
