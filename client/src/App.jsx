import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- Page Components ---
import LoginPage from './pages/LoginPage';
import TeamDashboard from './pages/TeamDashboard';
import ProjectPage from './pages/ProjectPage';
import TaskPage from './pages/TaskPage'; // <-- 1. IMPORT
// --- Global UI Components ---
import NotificationDisplay from './components/NotificationDisplay'; // <-- 1. IMPORTED

// --- Helper Component: Protected Routes ---
// This component checks if a user is logged in.
// If they are, it shows the page (the <Outlet />).
// If not, it redirects them to the /login page.
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

// --- Helper Component: Public Routes ---
// This component is for pages like Login/Register.
// If a user is already logged in, it redirects them away
// to the main dashboard.
function PublicRoute() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/teams" replace />;
  }
  
  return <LoginPage />;
}

// --- Main App Component ---
function App() {
  return (
    <> {/* <-- 2. ADDED A FRAGMENT to hold both components */}
      
      {/* 3. This component is now *always* on screen, outside the router */}
      <NotificationDisplay /> 
      
      {/* 4. The router controls the main page content */}
      <Routes>
        
        {/* --- Public Routes --- */}
        {/* /login is the only public-facing route */}
        <Route path="/login" element={<PublicRoute />} />

        {/* --- Protected Routes --- */}
        {/* We wrap all protected routes inside the ProtectedRoute element */}
        <Route path="/" element={<ProtectedRoute />}>
          
          {/* All routes inside here are now protected */}
          
          {/* Redirect / to /teams */}
          <Route path="/" element={<Navigate to="/teams" replace />} />
          
          {/* The "My Teams" Dashboard */}
          <Route path="/teams" element={<TeamDashboard />} />
          
          {/* The "Projects for a Team" Page */}
          <Route path="/teams/:teamId" element={<ProjectPage />} />
          
          {/* We will add this route in the next step */}
          <Route path="/projects/:projectId" element={<TaskPage />} /> {/* <-- 2. ADD NEW ROUTE */}

        </Route>
        
        {/* --- Fallback Route --- */}
        {/* Any other URL will redirect to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

export default App;