"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const project_dto_1 = require("../dtos/project.dto");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const teamMembership_model_1 = require("../../models/teamMembership.model");
// --- 1. IMPORT THE NESTED TASK ROUTER ---
const projectTask_routes_1 = __importDefault(require("./projectTask.routes"));
// **CRITICAL**: { mergeParams: true } must be here
const router = (0, express_1.Router)({ mergeParams: true });
// All project routes are protected
router.use(auth_middleware_1.protect);
// GET /api/v1/teams/:teamId/projects
router.get('/', (0, rbac_middleware_1.checkTeamRole)([teamMembership_model_1.TeamRole.Admin, teamMembership_model_1.TeamRole.Member]), project_controller_1.getProjectsByTeam);
// POST /api/v1/teams/:teamId/projects
router.post('/', (0, rbac_middleware_1.checkTeamRole)([teamMembership_model_1.TeamRole.Admin]), (0, validation_middleware_1.validationMiddleware)(project_dto_1.CreateProjectDto), project_controller_1.createProject);
router.use('/:projectId/tasks', projectTask_routes_1.default);
exports.default = router;
//# sourceMappingURL=project.routes.js.map