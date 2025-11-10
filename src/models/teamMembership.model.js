"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMembership = exports.TeamRole = void 0;
const mongoose_1 = require("mongoose");
var TeamRole;
(function (TeamRole) {
    TeamRole["Admin"] = "Admin";
    TeamRole["Member"] = "Member";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
const TeamMembershipSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Establishes the link to the User model
        required: true,
    },
    team: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team', // Establishes the link to the Team model
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(TeamRole), // Use the enum values
        default: TeamRole.Member,
        required: true,
    },
}, {
    timestamps: true,
});
// Add a compound index to prevent a user from being on the same team twice
TeamMembershipSchema.index({ user: 1, team: 1 }, { unique: true });
exports.TeamMembership = (0, mongoose_1.model)('TeamMembership', TeamMembershipSchema);
//# sourceMappingURL=teamMembership.model.js.map