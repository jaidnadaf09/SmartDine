"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurantController_1 = require("../controllers/restaurantController");
const router = express_1.default.Router();
// @desc    Get current restaurant status
// @route   GET /api/restaurant/status
// @access  Public
router.get('/status', restaurantController_1.getRestaurantStatus);
exports.default = router;
