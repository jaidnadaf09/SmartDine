"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.protect, authMiddleware_1.adminOnly, inventoryController_1.getInventoryItems)
    .post(authMiddleware_1.protect, authMiddleware_1.adminOnly, inventoryController_1.createInventoryItem);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.adminOnly, inventoryController_1.updateInventoryItem);
exports.default = router;
