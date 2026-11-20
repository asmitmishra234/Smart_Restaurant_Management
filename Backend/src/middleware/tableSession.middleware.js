
import TableSession from "../models/tableSession.model.js";
import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyTableSession = asyncHandler(async (req, res, next) => {
    const sessionToken = req.headers["x-session-token"];

    if (!sessionToken) {
        throw new ApiError(401, "Table session token is required");
    }

    const session = await TableSession.findOne({
        sessionToken,
        status: "ACTIVE"
    }).populate("table");

    if (!session) {
        throw new ApiError(401, "Invalid or expired table session");
    }

    if (!session.table || !session.table.isActive || session.table.isDeleted) {
        throw new ApiError(403, "This restaurant table is inactive");
    }

    req.tableSession = session;
    req.table = session.table;

    next();
});

export default verifyTableSession