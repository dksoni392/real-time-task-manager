"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team', // Link to the Team model
        required: true,
        index: true, // Good to index foreign keys for faster lookups
    },
}, {
    timestamps: true,
});
exports.Project = (0, mongoose_1.model)('Project', ProjectSchema);
//# sourceMappingURL=project.model.js.map