import { IsString, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTeamDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the new team.
 *           minLength: 3
 *         description:
 *           type: string
 *           description: An optional description for the team.
 *       example:
 *         name: "Alpha Team"
 *         description: "The primary development team."
 *
 *     InviteMemberDto:
 *       type: object
 *       required:
 *         - email
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user to invite.
 *         role:
 *           type: string
 *           enum: [Admin, Member]
 *           description: The role to assign to the new member.
 *       example:
 *         email: "member@example.com"
 *         role: "Member"
 */

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  description?: string;
}