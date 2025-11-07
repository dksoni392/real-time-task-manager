# Real-Time Team Task Management System

A full-stack, real-time web application built with Node.js, Express, MongoDB, Socket.IO, and React. This system allows users to manage teams, projects, and tasks with live updates broadcast to all team members. It features a robust, two-tiered role-based access control (RBAC) system for "Super Admins" and "Members."

## 🚀 Live Demo

[**https://your-project-name.vercel.app**](https://your-project-name.vercel.app)

*(This link will work after you complete the Vercel deployment.)*

## ✨ Core Features

* **Real-Time Collaboration:** Uses Socket.IO to instantly broadcast changes (new projects, new tasks, task updates, new members) to all connected team members without a page refresh.
* **Dual Role-Based Access Control (RBAC):**
    * **Global Admin Role:** Created using a secret `MASTER_KEY`. Admins have platform-level powers, like creating new teams and inviting members.
    * **Team-Based Role:** Users can be an "Admin" or "Member" *within a specific team*, with different permissions for each (e.g., only Team Admins can edit/delete tasks).
* **Full-Stack Application:**
    * **Backend:** A secure, scalable RESTful API built with Node.js, Express, and TypeScript.
    * **Frontend:** A dynamic, multi-page Single Page Application (SPA) built with React and Vite.
* **Secure JWT Authentication:** All API routes and Socket.IO connections are protected using JSON Web Tokens.
* **Global Notification System:** A React-based "toast" notification system that alerts users to important events (like being added to a team or assigned a task) no matter what page they are on.
* **Monorepo Structure:** A clean, professional project structure with the backend API (`/src`) and frontend `client` (`/client`) in a single repository, configured to deploy as one project on Vercel.

## ✨ UI & User Flow

The frontend application provides two distinct experiences based on the user's global role.

### **Admin Flow** (`user.role === 'Admin'`)
Admins have full "Create, Read, Update, Delete" (CRUD) permissions across the entire platform.
* **Create Teams:** Sees a "+ New Team" button on the dashboard to create new teams.
* **Invite Members:** Sees an "+ Invite" button on every team card to invite new users via email.
* **Create Projects:** Sees a "+ New Project" button on the team page.
* **Create Tasks:** Sees a "+ New Task" button on the project page.
* **Full Edit/Delete:** Sees "Edit" and "Delete" buttons on all tasks, allowing them to modify any field (title, description, status, assignee, etc.).

### **Member Flow** (`user.role === 'Member'`)
Members have a restricted, "read-only" and "collaborate" view.
* **View-Only:** Can navigate and see all teams they are in, and all projects and tasks within those teams.
* **No Create Permissions:** The "New Team", "New Project", and "New Task" buttons are hidden.
* **Restricted Edit:** Members **cannot** edit or delete tasks, *unless* a task is **assigned to them**.
* **Task Interaction:** If a task is assigned to a Member, they see a "Change Status" button, allowing them to modify a task's status (e.g., from "In Progress" to "Review").

### **Real-Time Notifications (For All Users)**
* **Global Toasts:** A pop-up notification appears for *all* users when:
    * They are assigned a task.
    * They are added to a new team.
    * A new project is created in a team they are viewing.
* **Live UI Updates:** The UI instantly updates without a page refresh when:
    * A new task/project appears on the page.
    * A task's details (like status) are changed by another user.
    * A task is deleted.

## 🛠️ Tech Stack

| Backend | Frontend |
| :--- | :--- |
| Node.js | React |
| Express.js | Vite |
| TypeScript | React Router |
| MongoDB (with Mongoose) | Socket.IO Client |
| Socket.IO | React Context API |
| JSON Web Tokens (JWT) | Vanilla JavaScript (ES6+) |
| `bcryptjs` (Password Hashing) | HTML5 / CSS (inline styles) |
| `class-validator` (Validation) | |
| Vercel (Deployment) | |

## 🏁 Getting Started: Local Setup

This project uses a "monorepo" structure. You will need **two terminals** running at the same time to run the project locally.

### 1. Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/real-time-task-management-system.git](https://github.com/YOUR_USERNAME/real-time-task-management-system.git)
cd real-time-task-management-system
```
### 2. Set Up the Backend (Terminal 1)
- Install dependencies from the root folder:
```bash
npm install
```
- Create your .env file in the root of the project. Copy the contents of .env.example (below) and fill in your values.
```bash
# Your MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>

# Your secret for signing JWTs (generate a long, random string)
JWT_SECRET=your-super-strong-and-secret-key

# The secret key to create a new Super Admin
MASTER_KEY=your-secret-admin-master-key

# The URL of your local frontend client (for CORS)
CLIENT_URL=http://localhost:5173
```
- Set Up the Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev

//Your backend API will be running at http://localhost:3000 
// Your React frontend will open and run at http://localhost:5173
 ```
### To use the Admin features, you must create a Super Admin user.

- Make sure your backend server is running.

- Use Postman (or a similar tool) to send a POST request to http://localhost:3000/api/v1/auth/register.

- You must include your masterKey in the body.

## backend Api
#### POST /api/v1/auth/register Body (JSON):
```bash
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "yourpassword123",
  "masterKey": "your-secret-admin-master-key" // only for Admin
}

//You can now log in to the React UI (http://localhost:5173) as this user, and you will see the Admin-only buttons.
```
#### POST /api/v1/auth/login - Logs in a user and returns a JWT.

### Team
- GET /api/v1/teams - Gets all teams for the logged-in user (includes their role & member count).
- POST /api/v1/teams - (Admin Only) Creates a new team
- POST /api/v1/teams/:teamId/invite - (Admin Only) Invites a user to a team by email.

### Projects
- GET /api/v1/teams/:teamId/projects - Gets all projects for a specific team (includes user's role).
- POST /api/v1/teams/:teamId/projects - (Admin Only) Creates a new project in a team

### Tasks
- GET /api/v1/projects/:projectId/tasks - Gets all tasks for a project (includes user's role).
- POST /api/v1/projects/:projectId/tasks - (Admin/Team Admin) Creates a new task in a project.
- PATCH /api/v1/tasks/:taskId - Updates a task. (Admins can edit all fields; Members have restrictions).
- DELETE /api/v1/tasks/:taskId - (Admin Only) Deletes a task.