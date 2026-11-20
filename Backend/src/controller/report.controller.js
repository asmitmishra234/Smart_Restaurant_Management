import Invoice from "../models/invoice.model.js";
import Order from "../models/order.model.js";

import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET SALES REPORT
export const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        throw new ApiError(
            400,
            "Start date and end date are required"
        );
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
    ) {
        throw new ApiError(400, "Invalid date range");
    }

    const invoiceFilter = {
        paymentStatus: "PAID",
        paidAt: { $gte: start, $lte: end }
    };

    const orderFilter = {
        createdAt: { $gte: start, $lte: end }
    };

    const [
        revenueData,
        paymentBreakdown,
        totalOrders,
        topProducts
    ] = await Promise.all([
        Invoice.aggregate([
            { $match: invoiceFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalInvoices: { $sum: 1 }
                }
            }
        ]),

        Invoice.aggregate([
            { $match: invoiceFilter },
            {
                $group: {
                    _id: "$paymentMethod",
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]),

        Order.countDocuments(orderFilter),

        Invoice.aggregate([
            { $match: invoiceFilter },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    quantitySold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.itemTotal" }
                }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 10 }
        ])
    ]);

    const report = {
        period: {
            startDate,
            endDate
        },

        sales: {
            totalRevenue: revenueData[0]?.totalRevenue || 0,
            totalInvoices: revenueData[0]?.totalInvoices || 0,
            totalOrders
        },

        paymentBreakdown,

        topProducts
    };

    res.status(200).json(
        new ApiResponse(
            200,
            report,
            "Sales report fetched successfully"
        )
    );
});