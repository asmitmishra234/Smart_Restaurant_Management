import TableSession from "../models/tableSession.model.js";
import Invoice from "../models/invoice.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// CLOSE TABLE SESSION
export const closeTableSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await TableSession.findById(sessionId);

    if (!session) {
        throw new ApiError(404, "Table session not found");
    }

    if (session.status === "CLOSED") {
        throw new ApiError(400, "Table session is already closed");
    }

    const invoice = await Invoice.findOne({
        tableSession: session._id
    });

    if (!invoice) {
        throw new ApiError(400, "Invoice not found for this session");
    }

    if (invoice.paymentStatus !== "PAID") {
        throw new ApiError(400, "Please complete payment before closing session");
    }

    session.status = "CLOSED";
    session.endedAt = new Date();

    await session.save();

    res.status(200).json(
        new ApiResponse(
            200,
            session,
            "Table session closed successfully"
        )
    );
});