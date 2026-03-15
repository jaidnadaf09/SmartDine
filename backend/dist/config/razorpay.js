"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay keys are missing in environment variables!");
}
else {
    console.log(`Razorpay initialized with Key ID starting with: ${key_id.substring(0, 8)}...`);
}
const razorpay = new razorpay_1.default({
    key_id,
    key_secret,
});
exports.default = razorpay;
