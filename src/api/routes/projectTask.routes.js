"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const task_dto_1 = require("../dtos/task.dto");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const teamMembership_model_1 = require("../../models/teamMembership.model");
// **CRITICAL**: { mergeParams: true } to access :projectId
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_middleware_1.protect);
// Use the RBAC middleware for ALL routes in this file
// This ensures the user is a member of the project's team
router.use((0, rbac_middleware_1.checkProjectAccess)([teamMembership_model_1.TeamRole.Admin, teamMembership_model_1.TeamRole.Member]));
// POST /api/v1/projects/:projectId/tasks
router.post('/', (0, validation_middleware_1.validationMiddleware)(task_dto_1.CreateTaskDto), task_controller_1.createTask);
// GET /api/v1/projects/:projectId/tasks
router.get('/', task_controller_1.getTasksByProject);
exports.default = router;
//# sourceMappingURL=projectTask.routes.js.map