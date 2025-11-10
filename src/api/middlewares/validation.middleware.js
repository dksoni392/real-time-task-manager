"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// This middleware is a "higher-order function"
// It takes the DTO type as an argument and returns a middleware function
const validationMiddleware = (dtoClass) => {
    return async (req, res, next) => {
        // 1. Convert the plain req.body to a class instance
        const output = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        // 2. Validate the class instance
        const errors = await (0, class_validator_1.validate)(output, {
            skipMissingProperties: false, // Ensure all properties are present
            whitelist: true, // Strips properties not in the DTO
            forbidNonWhitelisted: true, // Throws error if extra properties are sent
        });
        if (errors.length > 0) {
            // 3. If errors, format and return them
            const errorMessages = errors.map((error) => Object.values(error.constraints || {}));
            return res.status(400).json({
                message: 'Validation failed',
                errors: errorMessages.flat(),
            });
        }
        else {
            // 4. If no errors, replace req.body with the (sanitized) DTO instance
            req.body = output;
            next();
        }
    };
};
exports.validationMiddleware = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map