"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const targetSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    collection: {
        type: Schema.Types.ObjectId,
        default: true,
        required: true,
    },
    updateTime: {
        type: Date,
        default: Date.now(),
    },
});
module.exports = mongoose_1.default.model('Target', targetSchema);
//# sourceMappingURL=Target.js.map