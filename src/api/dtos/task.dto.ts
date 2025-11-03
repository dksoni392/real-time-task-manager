import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsMongoId,
  MinLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../../models/task.model';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsMongoId({ message: 'Invalid assignee ID' })
  @IsOptional()
  assigneeId?: string;
}

// For updates, all fields are optional
export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsMongoId({ message: 'Invalid assignee ID' })
  @IsOptional()
  assigneeId?: string;
}