"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const team_dto_1 = require("../dtos/team.dto");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const teamMembership_model_1 = require("../../models/teamMembership.model");
// --- 1. IMPORT THE PROJECT ROUTER ---
const project_routes_1 = __importDefault(require("./project.routes"));
const router = (0, express_1.Router)();
// === All team routes are protected ===
router.use(auth_middleware_1.protect);
// GET /api/v1/teams
router.get('/', team_controller_1.getMyTeams);
// POST /api/v1/teams
router.post('/', (0, validation_middleware_1.validationMiddleware)(team_dto_1.CreateTeamDto), team_controller_1.createTeam);
// POST /api/v1/teams/:teamId/invite
router.post('/:teamId/invite', (0, rbac_middleware_1.checkTeamRole)([teamMembership_model_1.TeamRole.Admin]), (0, validation_middleware_1.validationMiddleware)(team_dto_1.InviteMemberDto), team_controller_1.inviteMember);
// --- 2. THIS IS THE CRITICAL LINE YOU ARE LIKELY MISSING ---
// This tells the team router to hand off any request
// that matches "/:teamId/projects" to the projectRoutes file.
router.use('/:teamId/projects', project_routes_1.default);
exports.default = router;
//# sourceMappingURL=team.routes.js.map