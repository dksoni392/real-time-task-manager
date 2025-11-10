"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const teamMembership_model_1 = require("../../models/teamMembership.model");
// --- 1. IMPORT THE create-task LOGIC AND VALIDATOR ---
const task_controller_1 = require("../controllers/task.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const task_dto_1 = require("../dtos/task.dto");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All routes in this file are protected
// --- 2. THIS IS YOUR EXISTING, WORKING ROUTE ---
router.get('/:projectId/tasks', (0, rbac_middleware_1.checkProjectAccess)([teamMembership_model_1.TeamRole.Admin, teamMembership_model_1.TeamRole.Member]), task_controller_1.getTasksByProject);
// --- 3. THIS IS THE NEW ROUTE YOU ARE ADDING ---
// It handles the "Create Task" form submission
router.post('/:projectId/tasks', (0, rbac_middleware_1.checkProjectAccess)([teamMembership_model_1.TeamRole.Admin, teamMembership_model_1.TeamRole.Member]), // Only team members can create
(0, validation_middleware_1.validationMiddleware)(task_dto_1.CreateTaskDto), // Validates the form data
task_controller_1.createTask // Reuses your existing controller
);
exports.default = router;
//# sourceMappingURL=projectApi.routes.js.map