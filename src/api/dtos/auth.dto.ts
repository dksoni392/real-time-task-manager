import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// DTO for User Registration
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