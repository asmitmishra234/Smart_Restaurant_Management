
import express from "express";

import {
    createPayment,
    getPendingCashPayments,
    confirmCashPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "../controller/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { verifyTableSession } from "../middleware/tableSession.middleware.js";
import ApiError from "../utils/ApiErrors.js";

const router = express.Router();

const requireAdminCashConfirmationSession = (req, res, next) => {
    if (!req.cookies?.token) {
        return next(
            new ApiError(403, "Only admins can confirm cash payments")
        );
    }

    next();
};

// CUSTOMER: CREATE PAYMENT
router.post(
    "/",
    verifyTableSession,
    createPayment
);

// ADMIN: VIEW PENDING CASH PAYMENTS
router.get(
    "/pending-cash",
    protect,
    authorizeRoles("ADMIN"),
    getPendingCashPayments
);

// ADMIN: CONFIRM CASH PAYMENT
router.patch(
    "/:id/confirm-cash",
    requireAdminCashConfirmationSession,
    protect,
    authorizeRoles("ADMIN"),
    confirmCashPayment
);

router.post(
    "/razorpay/create-order",
    verifyTableSession,
    createRazorpayOrder
);

// VERIFY RAZORPAY PAYMENT
router.post(
    "/razorpay/verify",
    verifyTableSession,
    verifyRazorpayPayment
);

export default router;
