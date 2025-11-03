import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer'; // You may need to install this

// This middleware is a "higher-order function"
// It takes the DTO type as an argument and returns a middleware function

export const validationMiddleware = <T extends object>(
  dtoClass: ClassConstructor<T>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Convert the plain req.body to a class instance
    const output = plainToInstance(dtoClass, req.body);

    // 2. Validate the class instance
    const errors = await validate(output, {
      skipMissingProperties: false, // Ensure all properties are present
      whitelist: true, // Strips properties not in the DTO
      forbidNonWhitelisted: true, // Throws error if extra properties are sent
    });

    if (errors.length > 0) {
      // 3. If errors, format and return them
      const errorMessages = errors.map((error) =>
        Object.values(error.constraints || {})
      );
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages.flat(),
      });
    } else {
      // 4. If no errors, replace req.body with the (sanitized) DTO instance
      req.body = output;
      next();
    }
  };
};