
import dotenv from "dotenv";
import Razorpay from "razorpay";

// Backend folder se .env load karo
dotenv.config({
    path: new URL("../../.env", import.meta.url)
});

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log("Razorpay Key Loaded:", Boolean(keyId));
console.log("Razorpay Secret Loaded:", Boolean(keySecret));

if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials missing. Check Backend/.env file");
}

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
});

export default razorpay;
