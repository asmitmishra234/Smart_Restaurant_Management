
import express from "express";

import {
    createPayment,
    confirmCashPayment,
    createRazorpayOrder,
    verifyRazorpayPayment
} from "../controller/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { verifyTableSession } from "../middleware/tableSession.middleware.js";

const router = express.Router();

// CUSTOMER: CREATE PAYMENT
router.post(
    "/",
    verifyTableSession,
    createPayment
);

// ADMIN / WAITER: CONFIRM CASH PAYMENT
router.patch(
    "/:id/confirm-cash",
    protect,
    authorizeRoles("ADMIN", "WAITER"),
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
