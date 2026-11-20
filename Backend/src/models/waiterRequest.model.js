
import mongoose from "mongoose";

const waiterRequestSchema = new mongoose.Schema(
    {
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

        requestType: {
            type: String,
            enum: [
                "WATER",
                "EXTRA_PLATES",
                "CUTLERY",
                "CLEANING",
                "OTHER"
            ],
            required: true
        },

        message: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACKNOWLEDGED",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "PENDING"
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const WaiterRequest = mongoose.model(
    "WaiterRequest",
    waiterRequestSchema
);

export default WaiterRequest;
