
import ApiError from "../utils/ApiErrors.js";

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Please login first"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(403, "You are not authorized to access this resource")
            );
        }

        next();
    };
};

export default authorizeRoles