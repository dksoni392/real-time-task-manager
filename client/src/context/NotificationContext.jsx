import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

// Custom hook to use the context
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { socket, isConnected } = useSocket();

  // This effect sets up all global event listeners
  useEffect(() => {
    if (socket && isConnected) {
      
      // --- Handler for new project ---
      const onProjectCreated = (project) => {
        const newNotification = {
          id: `proj_${project._id}_${Date.now()}`, // Unique ID
          message: `New project created: "${project.name}"`,
          type: 'info',
        };
        // Add new notifications to the top of the list
        setNotifications((prev) => [newNotification, ...prev]);
      };

      // --- Handler for when you are added to a team ---
      const onAddedToTeam = (team) => {
        const newNotification = {
          id: `team_${team._id}_${Date.now()}`,
          message: `You've been added to a new team: "${team.name}"`,
          type: 'success',
        };
        setNotifications((prev) => [newNotification, ...prev]);
      };
      
      // --- Handler for when someone joins your team ---
      const onMemberJoined = (member) => {
        const newNotification = {
          id: `member_${member._id}_${Date.now()}`,
          message: `${member.name} has joined your team.`,
          type: 'info',
        };
        setNotifications((prev) => [newNotification, ...prev]);
      };
      
      // --- Handler for when a task is assigned to you ---
      const onTaskAssigned = ({ title, projectName }) => {
        const newNotification = {
          id: `task_assign_${Date.now()}`,
          message: `You were assigned a new task: "${title}" in project "${projectName}"`,
          type: 'success', // Green toast!
        };
        setNotifications((prev) => [newNotification, ...prev]);
      };

      // --- Add all global listeners ---
      socket.on('project_created', onProjectCreated);
      socket.on('added_to_team', onAddedToTeam);
      socket.on('member_joined', onMemberJoined);
      socket.on('task_assigned_to_you', onTaskAssigned); // <-- This was from our last step

      // --- Cleanup on disconnect ---
      return () => {
        socket.off('project_created', onProjectCreated);
        socket.off('added_to_team', onAddedToTeam);
        socket.off('member_joined', onMemberJoined);
        socket.off('task_assigned_to_you', onTaskAssigned); // <-- This was from our last step
      };
    }
  }, [socket, isConnected]); // Re-run when socket connects

  // --- THIS IS THE FUNCTION THAT WAS MISSING OR MISPLACED ---
  // Function to let the user clear notifications
  const clearNotifications = () => setNotifications([]);

  // This is the "value" that all other components will consume
  const value = { notifications, clearNotifications };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}