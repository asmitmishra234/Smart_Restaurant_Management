
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: 0
        },

        image: {
            type: String,
            default: ""
        },

        foodType: {
            type: String,
            enum: ["VEG", "NON_VEG", "EGG"],
            required: true
        },

        preparationTime: {
            type: Number,
            required: true,
            min: 1
        },

        isAvailable: {
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

const Product = mongoose.model("Product", productSchema);

export default Product;
