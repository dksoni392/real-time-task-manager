import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name.
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password (min 8 characters).
 *         masterKey:
 *           type: string
 *           description: Optional secret key to register as an Admin.
 *       example:
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: password123
 *
 *     LoginUserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *         password:
 *           type: string
 *           format: password
 *           description: The user's password.
 *       example:
 *         email: admin@example.com
 *         password: password123
 */
export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  @IsOptional() // <-- It's optional
  masterKey?: string; 
}

// DTO for User Login
export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Password should not be empty' })
  password!: string;
}