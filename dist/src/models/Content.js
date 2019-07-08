"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const contentSchema = new mongoose_1.default.Schema({
    order: {
        type: Number,
        required: true,
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true,
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    desc: String,
    // addedBy: Schema.Types.ObjectId,
    // target: Schema.Types.ObjectId,
    updateTime: {
        type: Date,
        default: Date.now(),
    },
});
exports.Content = mongoose_1.default.model('Content', contentSchema);
//# sourceMappingURL=Content.js.map