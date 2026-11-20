import Feedback from "../models/feedback.model.js";
import Invoice from "../models/invoice.model.js";

import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE CUSTOMER FEEDBACK
export const createFeedback = asyncHandler(async (req, res) => {
    const { rating, review = "" } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    if (typeof review !== "string" || review.length > 1000) {
        throw new ApiError(400, "Invalid review");
    }

    const invoice = await Invoice.findOne({
        tableSession: req.tableSession._id,
        paymentStatus: "PAID"
    });

    if (!invoice) {
        throw new ApiError(
            400,
            "Please complete payment before submitting feedback"
        );
    }

    const existingFeedback = await Feedback.findOne({
        tableSession: req.tableSession._id
    });

    if (existingFeedback) {
        throw new ApiError(409, "Feedback already submitted");
    }

    const feedback = await Feedback.create({
        table: req.table._id,
        tableSession: req.tableSession._id,
        invoice: invoice._id,
        rating,
        review: review.trim()
    });

    res.status(201).json(
        new ApiResponse(
            201,
            feedback,
            "Feedback submitted successfully"
        )
    );
});

// GET ALL FEEDBACK (ADMIN)
export const getAllFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.find()
        .populate("table", "tableNumber")
        .populate("invoice", "invoiceNumber totalAmount")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(
            200,
            feedback,
            "Feedback fetched successfully"
        )
    );
});

// DELETE FEEDBACK (ADMIN)
export const deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Feedback deleted successfully")
    );
});