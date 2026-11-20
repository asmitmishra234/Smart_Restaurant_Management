import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
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

        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        }
    },
    { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;