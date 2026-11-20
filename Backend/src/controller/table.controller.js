
import crypto from "crypto";
import QRCode from "qrcode";

import Table from "../models/table.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getFrontendOrigin } from "../config/cors.js";

// CREATE TABLE
export const createTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber?.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
        throw new ApiError(400, "Valid table number and capacity are required");
    }

    const existingTable = await Table.findOne({
        tableNumber: tableNumber.trim(),
        isDeleted: false
    });

    if (existingTable) {
        throw new ApiError(409, "Table number already exists");
    }

    const qrToken = crypto.randomBytes(32).toString("hex");

    const table = await Table.create({
        tableNumber: tableNumber.trim(),
        capacity: Number(capacity),
        qrToken
    });

    const menuUrl = `${getFrontendOrigin()}/menu?table=${encodeURIComponent(qrToken)}`;

    const qrCode = await QRCode.toDataURL(menuUrl);

    res.status(201).json(
        new ApiResponse(
            201,
            {
                table,
                qrCode
            },
            "Table created successfully"
        )
    );
});

// GET ALL TABLES (ADMIN)
export const getAllTables = asyncHandler(async (req, res) => {
    const tables = await Table.find({
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, tables, "Tables fetched successfully")
    );
});

// GET SINGLE TABLE (ADMIN)
export const getSingleTable = asyncHandler(async (req, res) => {
    const table = await Table.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!table) {
        throw new ApiError(404, "Table not found");
    }

    res.status(200).json(
        new ApiResponse(200, table, "Table fetched successfully")
    );
});

// UPDATE TABLE
export const updateTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity } = req.body;

    const table = await Table.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!table) {
        throw new ApiError(404, "Table not found");
    }

    if (tableNumber !== undefined) {
        if (!tableNumber.trim()) {
            throw new ApiError(400, "Table number cannot be empty");
        }

        const duplicate = await Table.findOne({
            _id: { $ne: table._id },
            tableNumber: tableNumber.trim(),
            isDeleted: false
        });

        if (duplicate) {
            throw new ApiError(409, "Table number already exists");
        }

        table.tableNumber = tableNumber.trim();
    }

    if (capacity !== undefined) {
        if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
            throw new ApiError(400, "Invalid table capacity");
        }

        table.capacity = Number(capacity);
    }

    await table.save();

    res.status(200).json(
        new ApiResponse(200, table, "Table updated successfully")
    );
});

// TOGGLE TABLE STATUS
export const toggleTableStatus = asyncHandler(async (req, res) => {
    const table = await Table.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!table) {
        throw new ApiError(404, "Table not found");
    }

    table.isActive = !table.isActive;

    await table.save();

    res.status(200).json(
        new ApiResponse(200, table, "Table status updated")
    );
});

// DELETE TABLE
export const deleteTable = asyncHandler(async (req, res) => {
    const table = await Table.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!table) {
        throw new ApiError(404, "Table not found");
    }

    table.isDeleted = true;
    table.isActive = false;

    await table.save();

    res.status(200).json(
        new ApiResponse(200, null, "Table deleted successfully")
    );
});
