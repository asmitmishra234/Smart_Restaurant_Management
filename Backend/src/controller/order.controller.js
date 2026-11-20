
import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Invoice from "../models/invoice.model.js";
// CREATE CUSTOMER ORDER
export const createOrder = asyncHandler(async (req, res) => {
    const { items } = req.body;

    // Prevent new orders after invoice generation
    const existingInvoice = await Invoice.findOne({
        tableSession: req.tableSession._id
    });

    if (existingInvoice) {
        throw new ApiError(
            400,
            "Bill has already been generated. New orders are not allowed."
        );
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Please add products to your order");
    }

    if (items.length > 50) {
        throw new ApiError(400, "Too many different products in one order");
    }

    let subtotal = 0;
    let estimatedPreparationTime = 0;
    const orderItems = [];

    for (const item of items) {
        const { productId, quantity, specialInstructions = "" } = item;

        if (
            !productId ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 50
        ) {
            throw new ApiError(400, "Invalid product or quantity");
        }

        if (
            typeof specialInstructions !== "string" ||
            specialInstructions.length > 300
        ) {
            throw new ApiError(400, "Invalid special instructions");
        }

        const product = await Product.findOne({
            _id: productId,
            isAvailable: true,
            isDeleted: false
        }).populate("category", "isActive isDeleted");

        if (
            !product ||
            !product.category ||
            !product.category.isActive ||
            product.category.isDeleted
        ) {
            throw new ApiError(400, "One or more products are unavailable");
        }

        const itemTotal = product.price * quantity;

        subtotal += itemTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
            foodType: product.foodType,
            preparationTime: product.preparationTime,
            specialInstructions: specialInstructions.trim(),
            itemTotal
        });

        estimatedPreparationTime = Math.max(
            estimatedPreparationTime,
            product.preparationTime
        );
    }

    // Calculate current kitchen workload
    const preparingOrders = await Order.find({
        status: "PREPARING"
    }).select("estimatedPreparationTime acceptedAt");

    let kitchenWorkload = 0;

    for (const preparingOrder of preparingOrders) {
        const totalEstimatedTime =
            preparingOrder.estimatedPreparationTime || 0;

        const elapsedMinutes = preparingOrder.acceptedAt
            ? Math.floor(
                (Date.now() - new Date(preparingOrder.acceptedAt).getTime()) /
                60000
            )
            : 0;

        const remainingTime = Math.max(
            0,
            totalEstimatedTime - elapsedMinutes
        );

        kitchenWorkload = Math.max(
            kitchenWorkload,
            remainingTime
        );
    }

    // New order estimate
    estimatedPreparationTime += kitchenWorkload;

    const orderNumber = `ORD-${Date.now()}-${crypto.randomInt(1000, 10000)}`;

    const order = await Order.create({
        orderNumber,
        table: req.table._id,
        tableSession: req.tableSession._id,
        items: orderItems,
        subtotal,
        totalAmount: subtotal,
        estimatedPreparationTime
    });

    req.app.get("io").to("staff-room").emit("order-updated", {
        orderId: order._id,
        status: order.status
    });

    res.status(201).json(
        new ApiResponse(201, order, "Order placed successfully")
    );
});

// GET ALL ORDERS
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("table", "tableNumber")
        .populate("items.product", "name image")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    );
});

// GET MY TABLE SESSION ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        tableSession: req.tableSession._id
    })
        .populate("table", "tableNumber")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, orders, "Your orders fetched successfully")
    );
});

// UPDATE ORDER STATUS

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const allowedTransitions = {
        ADMIN: {
            PLACED: ["ACCEPTED", "REJECTED"],
            ACCEPTED: ["CANCELLED"]
        },
        KITCHEN: {
            ACCEPTED: ["PREPARING"],
            PREPARING: ["READY"]
        },
        WAITER: {
            READY: ["SERVED"]
        }
    };

    const allowedNextStatuses =
        allowedTransitions[req.user.role]?.[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
        throw new ApiError(
            400,
            `Role ${req.user.role} cannot change ${order.status} to ${status}`
        );
    }

    order.status = status;

    if (status === "ACCEPTED") {
        order.acceptedAt = new Date();
    }

    if (status === "PREPARING") {
        order.preparingAt = new Date();
    }

    if (status === "READY") {
        order.readyAt = new Date();
    }

    if (status === "SERVED") {
        order.servedAt = new Date();
    }

    await order.save();

    // Send live update to customers of this table session
    const io = req.app.get("io");

    io.to(`table-session-${order.tableSession}`).emit(
        "order-status-updated",
        {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            estimatedPreparationTime: order.estimatedPreparationTime
        }
    );

    const staffUpdate = {
        orderId: order._id,
        status: order.status
    };
    io.to("staff-room").emit("order-updated", staffUpdate);
    io.to("kitchen-room").emit("order-updated", staffUpdate);

    res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order status updated successfully"
        )
    );
});


