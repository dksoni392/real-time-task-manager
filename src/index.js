"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors")); // For allowing cross-origin requests
const db_1 = __importDefault(require("./config/db"));
const socketHandler_1 = require("./sockets/socketHandler");
// Import All Routes (Removed userRoutes)
const auth_routes_1 = __importDefault(require("./api/routes/auth.routes"));
const team_routes_1 = __importDefault(require("./api/routes/team.routes"));
const task_routes_1 = __importDefault(require("./api/routes/task.routes"));
const projectApi_routes_1 = __importDefault(require("./api/routes/projectApi.routes"));
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// === 1. DEFINE YOUR DYNAMIC CLIENT_URL ===
// This will use your production URL on Vercel
// or fall back to your Vite URL for local dev
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// === 2. CONFIGURE CORS FOR REST API ===
// This allows your React app to make 'fetch' requests
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
}));
// === 3. Create the HTTP server and Socket.IO server ===
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: CLIENT_URL, // Allow your React app to connect via WebSocket
        methods: ['GET', 'POST'],
    },
});
// === 4. Set up Socket.IO logic ===
(0, socketHandler_1.setupSocket)(io);
// Standard middleware
app.use(express_1.default.json());
// Make 'io' accessible to our controllers
app.set('socketio', io);
// === 5. API ROUTES ===
// All your API routes are now cleanly prefixed
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/teams', team_routes_1.default);
app.use('/api/v1/projects', projectApi_routes_1.default);
// The 'userRoutes' line has been removed.
// Simple root route
app.get('/', (req, res) => {
    res.send('Real-Time Task Manager API is running...');
});
// === 6. Start the server ===
httpServer.listen(port, () => {
    console.log(`🚀 Backend API & Socket server running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map