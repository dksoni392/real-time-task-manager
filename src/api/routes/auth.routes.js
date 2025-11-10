"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_dto_1 = require("../dtos/auth.dto");
const router = (0, express_1.Router)();
// @POST /api/v1/auth/register
// We chain the validation middleware *before* the controller
router.post('/register', (0, validation_middleware_1.validationMiddleware)(auth_dto_1.RegisterUserDto), auth_controller_1.registerUser);
// @POST /api/v1/auth/login
router.post('/login', (0, validation_middleware_1.validationMiddleware)(auth_dto_1.LoginUserDto), auth_controller_1.loginUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map