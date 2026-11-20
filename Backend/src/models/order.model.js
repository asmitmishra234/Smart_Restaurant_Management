
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        preparationTime: {
    type: Number,
    required: true
},

        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        foodType: {
            type: String,
            enum: ["VEG", "NON_VEG", "EGG"],
            required: true
        },

        specialInstructions: {
            type: String,
            default: ""
        },

        itemTotal: {
            type: Number,
            required: true
        }
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },

        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true
        },

        tableSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TableSession",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        subtotal: {
            type: Number,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "PLACED",
                "ACCEPTED",
                "REJECTED",
                "PREPARING",
                "READY",
                "SERVED",
                "CANCELLED"
            ],
            default: "PLACED"
        },

        estimatedPreparationTime: {
            type: Number,
            default: 0
        },

        acceptedAt: Date,
        readyAt: Date,
        servedAt: Date
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
