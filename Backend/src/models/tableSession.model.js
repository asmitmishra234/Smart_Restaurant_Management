
import mongoose from "mongoose";

const tableSessionSchema = new mongoose.Schema(
    {
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Table",
            required: true
        },

        sessionToken: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "CLOSED"],
            default: "ACTIVE"
        },

        startedAt: {
            type: Date,
            default: Date.now
        },

        endedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const TableSession = mongoose.model(
    "TableSession",
    tableSessionSchema
);

export default TableSession;
