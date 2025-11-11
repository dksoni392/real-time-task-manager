import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';

const router = Router();

// @POST /api/v1/auth/register
// We chain the validation middleware *before* the controller


/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User registration and authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserDto'
 *     responses:
 *       201:
 *         description: User created successfully. Returns the new user object (without token).
 *       400:
 *         description: Bad Request (e.g., user already exists, validation failed).
 *       403:
 *         description: Forbidden (Invalid Master Key).
 *       500:
 *         description: Server Error.
 */
router.post(
  '/register',
  validationMiddleware(RegisterUserDto),
  registerUser
);

// @POST /api/v1/auth/login

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserDto'
 *     responses:
 *       200:
 *         description: Login successful. Returns the user object and a JWT token.
 *       401:
 *         description: Unauthorized (Invalid email or password).
 *       500:
 *         description: Server Error.
 */
router.post('/login', validationMiddleware(LoginUserDto), loginUser);

export default router;