
import crypto from "crypto";

import Table from "../models/table.model.js";
import TableSession from "../models/tableSession.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// VERIFY QR AND CREATE TABLE SESSION
export const scanTableQR = asyncHandler(async (req, res) => {
    const { qrToken } = req.body;

    if (!qrToken) {
        throw new ApiError(400, "QR token is required");
    }

    // Find active table
    const table = await Table.findOne({
        qrToken,
        isActive: true,
        isDeleted: false
    });

    if (!table) {
        throw new ApiError(404, "Invalid or inactive table QR code");
    }

    // Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Create new session
    const session = await TableSession.create({
        table: table._id,
        sessionToken
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                sessionToken: session.sessionToken,
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                sessionId: session._id
            },
            "Table verified and session created successfully"
        )
    );
});
