
import WaiterRequest from "../models/waiterRequest.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CUSTOMER CREATES WAITER REQUEST
export const createWaiterRequest = asyncHandler(async (req, res) => {
    const { requestType, message = "" } = req.body;

    const allowedTypes = [
        "WATER",
        "EXTRA_PLATES",
        "CUTLERY",
        "CLEANING",
        "OTHER"
    ];

    if (!allowedTypes.includes(requestType)) {
        throw new ApiError(400, "Invalid waiter request type");
    }

    if (
        typeof message !== "string" ||
        message.length > 300
    ) {
        throw new ApiError(400, "Invalid request message");
    }

    const waiterRequest = await WaiterRequest.create({
        table: req.table._id,
        tableSession: req.tableSession._id,
        requestType,
        message: message.trim()
    });

    // Notify Admin and Waiter
    const io = req.app.get("io");

    io.to("staff-room").emit("new-waiter-request", {
        requestId: waiterRequest._id,
        table: req.table.tableNumber,
        requestType,
        message: waiterRequest.message,
        status: waiterRequest.status
    });

    res.status(201).json(
        new ApiResponse(
            201,
            waiterRequest,
            "Waiter request sent successfully"
        )
    );
});

// GET ALL WAITER REQUESTS
export const getAllWaiterRequests = asyncHandler(async (req, res) => {
    const requests = await WaiterRequest.find()
        .populate("table", "tableNumber")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(
            200,
            requests,
            "Waiter requests fetched successfully"
        )
    );
});

// UPDATE WAITER REQUEST STATUS
export const updateWaiterRequestStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
        "ACKNOWLEDGED",
        "COMPLETED",
        "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid waiter request status");
    }

    const waiterRequest = await WaiterRequest.findById(req.params.id);

    if (!waiterRequest) {
        throw new ApiError(404, "Waiter request not found");
    }

    if (waiterRequest.status === "COMPLETED" ||
        waiterRequest.status === "CANCELLED") {
        throw new ApiError(400, "This request is already closed");
    }

    waiterRequest.status = status;

    if (status === "COMPLETED") {
        waiterRequest.completedAt = new Date();
    }

    await waiterRequest.save();

    // Notify customer
    const io = req.app.get("io");

    io.to(`table-session-${waiterRequest.tableSession}`).emit(
        "waiter-request-updated",
        {
            requestId: waiterRequest._id,
            status: waiterRequest.status,
            completedAt: waiterRequest.completedAt
        }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            waiterRequest,
            "Waiter request status updated successfully"
        )
    );
});
