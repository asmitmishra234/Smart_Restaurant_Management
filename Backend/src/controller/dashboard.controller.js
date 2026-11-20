import Order from "../models/order.model.js";
import Invoice from "../models/invoice.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Table from "../models/table.model.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ADMIN DASHBOARD
export const getDashboardStats = asyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
        totalOrders,
        todayOrders,
        pendingOrders,
        preparingOrders,
        completedOrders,
        totalRevenue,
        todayRevenue,
        totalProducts,
        activeStaff,
        totalTables
    ] = await Promise.all([
        Order.countDocuments(),

        Order.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }),

        Order.countDocuments({ status: "PLACED" }),

        Order.countDocuments({ status: "PREPARING" }),

        Order.countDocuments({ status: "SERVED" }),

        Invoice.aggregate([
            { $match: { paymentStatus: "PAID" } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" }
                }
            }
        ]),

        Invoice.aggregate([
            {
                $match: {
                    paymentStatus: "PAID",
                    paidAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$totalAmount" }
                }
            }
        ]),

        Product.countDocuments({ isDeleted: false }),

        User.countDocuments({
            role: { $in: ["KITCHEN", "WAITER"] },
            isActive: true
        }),

        Table.countDocuments({ isDeleted: false })
    ]);

    const dashboard = {
        orders: {
            total: totalOrders,
            today: todayOrders,
            pending: pendingOrders,
            preparing: preparingOrders,
            completed: completedOrders
        },

        revenue: {
            total: totalRevenue[0]?.revenue || 0,
            today: todayRevenue[0]?.revenue || 0
        },

        products: {
            total: totalProducts
        },

        staff: {
            active: activeStaff
        },

        tables: {
            total: totalTables
        }
    };

    res.status(200).json(
        new ApiResponse(
            200,
            dashboard,
            "Dashboard statistics fetched successfully"
        )
    );
});