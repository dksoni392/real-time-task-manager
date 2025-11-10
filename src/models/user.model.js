"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// 1. Define the UserRole enum
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "Admin";
    UserRole["Member"] = "Member";
})(UserRole || (exports.UserRole = UserRole = {}));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Hides the password from default queries
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.Member,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});
// Mongoose "pre-save" hook: Runs before a document is saved
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// === 3. THIS IS THE FIX ===
// We MUST use the 'function' keyword here to get the correct 'this' context.
// An arrow function () => {} would FAIL and cause your exact error.
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // 'this' refers to the specific user document
    // We must explicitly cast 'this' to get type safety
    const user = this;
    if (!user.password) {
        // This can happen if the query didn't .select('+password')
        return false;
    }
    return bcryptjs_1.default.compare(candidatePassword, user.password);
};
exports.User = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=user.model.js.map