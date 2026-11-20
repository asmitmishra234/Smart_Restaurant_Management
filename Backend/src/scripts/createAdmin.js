
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/user.model.js";

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Admin environment variables are required");
        }

        const existingAdmin = await User.findOne({
            role: "ADMIN"
        });

        if (existingAdmin) {
            console.log("Admin account already exists");
            return;
        }

        const admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "ADMIN"
        });

        console.log("Admin created successfully:", admin.email);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
