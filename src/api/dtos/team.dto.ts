import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { TeamRole } from '../../models/teamMembership.model'; // Import your enum

export class CreateTeamDto {
  @IsString()
  @MinLength(3, { message: 'Team name must be at least 3 characters long' })
  name!: string;

  @IsString()
  description?: string;
}

export class InviteMemberDto {
  @IsEmail({}, { message: 'Please provide a valid user email' })
  email!: string;

  @IsEnum(TeamRole, { message: 'Role must be either Admin or Member' })
  role!: TeamRole;
}