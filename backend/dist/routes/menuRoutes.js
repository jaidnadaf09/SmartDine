"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menuController_1 = require("../controllers/menuController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(menuController_1.getMenuItems)
    .post(authMiddleware_1.protect, authMiddleware_1.adminOnly, menuController_1.createMenuItem);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.adminOnly, menuController_1.updateMenuItem)
    .delete(authMiddleware_1.protect, authMiddleware_1.adminOnly, menuController_1.deleteMenuItem);
exports.default = router;
