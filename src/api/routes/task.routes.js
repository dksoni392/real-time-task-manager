"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const task_dto_1 = require("../dtos/task.dto");
// --- 1. IMPORT THE RBAC MIDDLEWARE AND ROLES ---
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const teamMembership_model_1 = require("../../models/teamMembership.model");
const router = (0, express_1.Router)();
// --- 2. APPLY THE 'protect' MIDDLEWARE TO ALL ROUTES ---
router.use(auth_middleware_1.protect);
// --- 3. DEFINE YOUR MIDDLEWARE CHAIN ---
// This creates a re-usable chain to check if the user is
// an Admin OR a Member, and if they have access to the task.
const canModifyTask = (0, rbac_middleware_1.checkTaskAccess)([teamMembership_model_1.TeamRole.Admin, teamMembership_model_1.TeamRole.Member]);
// --- 4. APPLY THE *FULL* CHAIN TO YOUR ROUTES ---
// PATCH /api/v1/tasks/:taskId
router.patch('/:taskId', canModifyTask, // <-- THIS IS THE CRITICAL LINE YOU ARE MISSING
(0, validation_middleware_1.validationMiddleware)(task_dto_1.UpdateTaskDto), task_controller_1.updateTask);
// DELETE /api/v1/tasks/:taskId
router.delete('/:taskId', canModifyTask, // <-- THIS IS THE CRITICAL LINE YOU ARE MISSING
task_controller_1.deleteTask);
exports.default = router;
//# sourceMappingURL=task.routes.js.map