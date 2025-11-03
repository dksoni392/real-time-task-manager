import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';

const router = Router();

// @POST /api/v1/auth/register
// We chain the validation middleware *before* the controller
router.post(
  '/register',
  validationMiddleware(RegisterUserDto),
  registerUser
);

// @POST /api/v1/auth/login
router.post('/login', validationMiddleware(LoginUserDto), loginUser);

export default router;