"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = require("mongoose");
const ActivitySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    details: {
        type: String,
        trim: true,
    },
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true,
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        index: true,
    },
    task: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
        index: true,
    },
}, {
    timestamps: true,
});
exports.Activity = (0, mongoose_1.model)('Activity', ActivitySchema);
//# sourceMappingURL=activity.model.js.map