import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
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

    res.status(201).json(
        new ApiResponse(
            201,
            payment,
            "Payment request created successfully"
        )
    );
});

// CONFIRM CASH PAYMENT - ADMIN / WAITER
export const confirmCashPayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    if (payment.paymentMethod !== "CASH") {
        throw new ApiError(400, "This is not a cash payment");
    }

    if (payment.status !== "PENDING") {
        throw new ApiError(400, "Payment is not pending");
    }

    const invoice = await Invoice.findById(payment.invoice);

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    if (invoice.paymentStatus !== "PENDING") {
        throw new ApiError(400, "Invoice is not pending");
    }

    payment.status = "SUCCESS";
    payment.paidAt = new Date();

    invoice.paymentStatus = "PAID";
    invoice.paymentMethod = "CASH";
    invoice.paidAt = new Date();

    await Promise.all([
        payment.save(),
        invoice.save()
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            { payment, invoice },
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
        invoice.save()
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

