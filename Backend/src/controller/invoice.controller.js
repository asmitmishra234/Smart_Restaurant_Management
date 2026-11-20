
import Invoice from "../models/invoice.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GENERATE INVOICE

export const generateInvoice = asyncHandler(async (req, res) => {
    const tableSession = req.tableSession;

    const existingInvoice = await Invoice.findOne({
        tableSession: tableSession._id
    });

    if (existingInvoice) {
        return res.status(200).json(
            new ApiResponse(200, existingInvoice, "Invoice already generated")
        );
    }

    const orders = await Order.find({
        tableSession: tableSession._id
    }).sort({ createdAt: 1 });

    if (!orders.length) {
        throw new ApiError(404, "No orders found for billing");
    }

    // All orders must reach a final status
    const unfinishedOrders = orders.filter(order =>
        !["SERVED", "REJECTED", "CANCELLED"].includes(order.status)
    );

    if (unfinishedOrders.length > 0) {
        throw new ApiError(
            400,
            "Please wait until all active orders are served"
        );
    }

    // Only served orders are billable
    const servedOrders = orders.filter(
        order => order.status === "SERVED"
    );

    if (!servedOrders.length) {
        throw new ApiError(400, "No served orders available for billing");
    }

    let subtotal = 0;
    const invoiceItems = [];

    for (const order of servedOrders) {
        for (const item of order.items) {
            const itemTotal = Number(
                (item.price * item.quantity).toFixed(2)
            );

            subtotal += itemTotal;

            invoiceItems.push({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                itemTotal
            });
        }
    }

    subtotal = Number(subtotal.toFixed(2));

    const gstRate = 12;
    const gstAmount = Number(
        (subtotal * gstRate / 100).toFixed(2)
    );

    const totalAmount = Number(
        (subtotal + gstAmount).toFixed(2)
    );

    const invoice = await Invoice.create({
        table: tableSession.table,
        tableSession: tableSession._id,
        orders: servedOrders.map(order => order._id),
        items: invoiceItems,
        subtotal,
        gstRate,
        gstAmount,
        totalAmount
    });

    res.status(201).json(
        new ApiResponse(201, invoice, "Invoice generated successfully")
    );
});


// GET CUSTOMER INVOICE
export const getMyInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({
        tableSession: req.tableSession._id
    })
        .populate("table", "tableNumber")
        .populate("orders", "orderNumber status");

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    const latestPayment = await Payment.findOne({ invoice: invoice._id })
        .sort({ createdAt: -1 })
        .select("paymentMethod status createdAt paidAt");

    const invoiceWithPayment = invoice.toObject();
    invoiceWithPayment.payment = latestPayment;

    res.status(200).json(
        new ApiResponse(200, invoiceWithPayment, "Invoice fetched successfully")
    );
});

// GET ALL INVOICES - ADMIN
export const getAllInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find()
        .populate("table", "tableNumber")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(
            200,
            invoices,
            "Invoices fetched successfully"
        )
    );
});
