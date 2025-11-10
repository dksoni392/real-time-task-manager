"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskPriority = exports.TaskStatus = void 0;
const mongoose_1 = require("mongoose");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["ToDo"] = "To Do";
    TaskStatus["InProgress"] = "In Progress";
    TaskStatus["Review"] = "Review";
    TaskStatus["Done"] = "Done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["Low"] = "Low";
    TaskPriority["Medium"] = "Medium";
    TaskPriority["High"] = "High";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
const TaskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.ToDo,
        required: true,
    },
    priority: {
        type: String,
        enum: Object.values(TaskPriority),
        default: TaskPriority.Medium,
        required: true,
    },
    dueDate: {
        type: Date,
    },
    project: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    assignee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // A task might be unassigned
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
exports.Task = (0, mongoose_1.model)('Task', TaskSchema);
//# sourceMappingURL=task.model.js.map