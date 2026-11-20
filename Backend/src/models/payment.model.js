
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true
        },

        tableSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TableSession",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["CASH", "ONLINE"],
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "SUCCESS", "FAILED"],
            default: "PENDING"
        },

        transactionId: {
            type: String,
            default: null
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
