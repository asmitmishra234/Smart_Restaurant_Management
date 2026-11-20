
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
    {
        tableNumber: {
            type: String,
            required: [true, "Table number is required"],
            unique: true,
            trim: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        qrToken: {
            type: String,
            required: true,
            unique: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Table = mongoose.model("Table", tableSchema);

export default Table;
