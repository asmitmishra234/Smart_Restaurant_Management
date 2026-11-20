
import mongoose from "mongoose";
import crypto from "crypto";

const invoiceItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        itemTotal: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            unique: true,
            default: () => `INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
        },

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true
        },

        tableSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TableSession",
            required: true,
            unique: true
        },

        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true
            }
        ],

        items: {
            type: [invoiceItemSchema],
            required: true
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        gstRate: {
            type: Number,
            default: 12
        },

        gstAmount: {
            type: Number,
            required: true,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["CASH", "ONLINE"],
            default: null
        },

        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
            default: "PENDING"
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
