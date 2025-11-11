import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsMongoId,
  MinLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../../models/task.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTaskDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the new task.
 *         description:
 *           type: string
 *           description: An optional description for the task.
 *         status:
 *           type: string
 *           enum: [To Do, In Progress, Review, Done]
 *           default: "To Do"
 *           description: The current status of the task.
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           default: "Medium"
 *           description: The priority of the task.
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: An optional due date for the task.
 *         assigneeId:
 *           type: string
 *           format: ObjectId
 *           description: The User ID of the person assigned to this task.
 *
 *     UpdateTaskDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The new title of the task.
 *         description:
 *           type: string
 *           description: The new description for the task.
 *         status:
 *           type: string
 *           enum: [To Do, In Progress, Review, Done]
 *           description: The new status of the task.
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           description: The new priority of the task.
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: The new due date for the task.
 *         assigneeId:
 *           type: string
 *           format: ObjectId
 *           description: The new User ID for the assignee.
 */

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