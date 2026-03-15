"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tableController_1 = require("../controllers/tableController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(tableController_1.getTables)
    .post(authMiddleware_1.protect, authMiddleware_1.adminOnly, tableController_1.createTable);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.staffOnly, tableController_1.updateTable);
exports.default = router;
