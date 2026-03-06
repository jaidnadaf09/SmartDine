import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay keys are missing in environment variables!");
} else {
    console.log(`Razorpay initialized with Key ID starting with: ${key_id.substring(0, 8)}...`);
}

const razorpay = new Razorpay({
    key_id,
    key_secret,
});

export default razorpay;
