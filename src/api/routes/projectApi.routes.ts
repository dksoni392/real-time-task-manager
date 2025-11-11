import { Router } from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware';
import { checkProjectAccess } from '../middlewares/rbac.middleware';
import { TeamRole } from '../../models/teamMembership.model';
import { deleteProject } from '../controllers/project.controller'; // <-- 2. Import deleteProject

// --- 1. IMPORT THE create-task LOGIC AND VALIDATOR ---
import { getTasksByProject, createTask } from '../controllers/task.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateTaskDto } from '../dtos/task.dto';

const router = Router();
router.use(protect); // All routes in this file are protected
/**
 * @swagger
 * tags:
 *   - name: Projects & Tasks
 *     description: Project and task management
 */

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Projects & Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: A list of tasks for the project and the user's role.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not a member of the project's team)
 *       404:
 *         description: Project not found
 */
// --- 2. THIS IS YOUR EXISTING, WORKING ROUTE ---
router.get(
  '/:projectId/tasks',
  checkProjectAccess([TeamRole.Admin, TeamRole.Member]),
  getTasksByProject
);

/**
 * @swagger
 * /projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Projects & Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskDto'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// --- 3. THIS IS THE NEW ROUTE YOU ARE ADDING ---
// It handles the "Create Task" form submission
router.post(
  '/:projectId/tasks',
  checkProjectAccess([TeamRole.Admin, TeamRole.Member]), // Only team members can create
  validationMiddleware(CreateTaskDto), // Validates the form data
  createTask // Reuses your existing controller
);

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project (Admin Only)
 *     tags: [Projects & Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the project to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (User is not an Admin)
 *       404:
 *         description: Project not found
 */

router.delete('/:projectId', isAdmin, deleteProject);

export default router;