"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const activity_model_1 = require("../models/activity.model");
// A simple service to log actions
const logActivity = async (userId, teamId, action, details, projectId, taskId) => {
    try {
        await activity_model_1.Activity.create({
            user: userId,
            team: teamId,
            action,
            details,
            project: projectId,
            task: taskId,
        });
    }
    catch (error) {
        console.error('Failed to log activity:', error);
        // We don't throw an error, as logging is a non-critical side-effect
    }
};
exports.logActivity = logActivity;
//# sourceMappingURL=activity.service.js.map