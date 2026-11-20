import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Order from "../models/order.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import razorpay from "../config/rozarpay.js";
// CREATE PAYMENT
export const createPayment = asyncHandler(async (req, res) => {
    const { paymentMethod } = req.body;

    if (!["CASH", "ONLINE"].includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method");
    }
    if (paymentMethod !== "CASH") {
    throw new ApiError(
        400,
        "For online payment, use Razorpay checkout"
    );
}

    const invoice = await Invoice.findOne({
        tableSession: req.tableSession._id
    });

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    if (invoice.paymentStatus === "PAID") {
        throw new ApiError(400, "Invoice already paid");
    }

    const existingPayment = await Payment.findOne({
        invoice: invoice._id,
        status: "PENDING"
    });

    if (existingPayment) {
        throw new ApiError(400, "A pending payment already exists");
    }

    const payment = await Payment.create({
        invoice: invoice._id,
        tableSession: req.tableSession._id,
        amount: invoice.totalAmount,
        paymentMethod
    });

    req.app.get("io").to("admin-room").emit("cash-payment-requested", {
        paymentId: payment._id
    });

    res.status(201).json(
        new ApiResponse(
            201,
            payment,
            "Payment request created successfully"
        )
    );
});

// GET PENDING CASH PAYMENTS - ADMIN
export const getPendingCashPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({
        paymentMethod: "CASH",
        status: "PENDING"
    })
        .sort({ createdAt: 1 })
        .populate({
            path: "invoice",
            select: "invoiceNumber table totalAmount paymentStatus orders",
            populate: [
                { path: "table", select: "tableNumber" },
                { path: "orders", select: "orderNumber" }
            ]
        });

    const pendingPayments = payments.filter(
        payment => payment.invoice?.paymentStatus === "PENDING"
    );

    res.status(200).json(
        new ApiResponse(
            200,
            pendingPayments,
            "Pending cash payments fetched successfully"
        )
    );
});

// CONFIRM CASH PAYMENT - ADMIN
export const confirmCashPayment = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid payment ID");
    }

    const session = await mongoose.startSession();
    let result;

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findById(req.params.id).session(session);

            if (!payment) {
                throw new ApiError(404, "Payment not found");
            }

            if (payment.paymentMethod !== "CASH") {
                throw new ApiError(400, "This is not a cash payment");
            }

            if (payment.status !== "PENDING") {
                throw new ApiError(409, "Payment is no longer pending");
            }

            const invoice = await Invoice.findById(payment.invoice).session(session);

            if (!invoice) {
                throw new ApiError(404, "Invoice not found");
            }

            if (String(invoice.tableSession) !== String(payment.tableSession)) {
                throw new ApiError(409, "Payment does not match the invoice session");
            }

            if (invoice.paymentStatus !== "PENDING") {
                throw new ApiError(409, "Invoice is no longer pending payment");
            }

            const paidAt = new Date();
            const confirmedPayment = await Payment.findOneAndUpdate(
                {
                    _id: payment._id,
                    paymentMethod: "CASH",
                    status: "PENDING"
                },
                {
                    $set: { status: "COMPLETED", paidAt }
                },
                { new: true, session }
            );

            if (!confirmedPayment) {
                throw new ApiError(409, "Payment is no longer pending");
            }

            const paidInvoice = await Invoice.findOneAndUpdate(
                { _id: invoice._id, paymentStatus: "PENDING" },
                {
                    $set: {
                        paymentStatus: "PAID",
                        paymentMethod: "CASH",
                        paidAt
                    }
                },
                { new: true, session }
            );

            if (!paidInvoice) {
                throw new ApiError(409, "Invoice is no longer pending payment");
            }

            await Order.updateMany(
                { _id: { $in: paidInvoice.orders } },
                { $set: { paymentStatus: "PAID" } },
                { session }
            );

            result = { payment: confirmedPayment, invoice: paidInvoice };
        });
    } finally {
        await session.endSession();
    }

    const io = req.app.get("io");
    io.to(`table-session-${result.payment.tableSession}`).emit(
        "payment-status-updated",
        {
            paymentId: result.payment._id,
            status: result.payment.status,
            invoicePaymentStatus: result.invoice.paymentStatus
        }
    );
    io.to("admin-room").emit("cash-payment-confirmed", {
        paymentId: result.payment._id
    });

    res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Cash payment confirmed successfully"
        )
    );
});


// CREATE RAZORPAY ORDER
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({
        tableSession: req.tableSession._id
    });

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    if (invoice.paymentStatus === "PAID") {
        throw new ApiError(400, "Invoice already paid");
    }

    // Prevent duplicate pending payments
    const existingPayment = await Payment.findOne({
        invoice: invoice._id,
        paymentMethod: "ONLINE",
        status: "PENDING"
    });

    if (existingPayment) {
        throw new ApiError(
            400,
            "A pending online payment already exists"
        );
    }

    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(invoice.totalAmount * 100),
        currency: "INR",
        receipt: invoice.invoiceNumber
    });

    const payment = await Payment.create({
        invoice: invoice._id,
        tableSession: req.tableSession._id,
        amount: invoice.totalAmount,
        paymentMethod: "ONLINE",
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                paymentId: payment._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID
            },
            "Razorpay order created successfully"
        )
    );
});

// VERIFY RAZORPAY PAYMENT
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "All Razorpay payment details are required");
    }

    const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        tableSession: req.tableSession._id,
        paymentMethod: "ONLINE"
    });

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.status === "SUCCESS") {
        return res.status(200).json(
            new ApiResponse(200, payment, "Payment already verified")
        );
    }

    if (payment.status !== "PENDING") {
        throw new ApiError(400, "Payment is not pending");
    }

    // Generate expected signature
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    // Secure signature comparison
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    const isValid =
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
        throw new ApiError(400, "Invalid Razorpay payment signature");
    }

    const invoice = await Invoice.findById(payment.invoice);

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    if (invoice.paymentStatus !== "PENDING") {
        throw new ApiError(400, "Invoice is not pending payment");
    }

    // Verify payment status directly with Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
        razorpayPayment.order_id !== razorpay_order_id ||
        razorpayPayment.status !== "captured"
    ) {
        throw new ApiError(400, "Razorpay payment is not captured");
    }

    // Update payment
    payment.status = "SUCCESS";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.transactionId = razorpay_payment_id;
    payment.paidAt = new Date();

    // Update invoice
    invoice.paymentStatus = "PAID";
    invoice.paymentMethod = "ONLINE";
    invoice.paidAt = new Date();

    await Promise.all([
        payment.save(),
        invoice.save(),
        Order.updateMany(
            { _id: { $in: invoice.orders } },
            { $set: { paymentStatus: "PAID" } }
        )
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                payment,
                invoice
            },
            "Online payment verified successfully"
        )
    );
});

