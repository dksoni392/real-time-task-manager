import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal'; // We'll use this next

// --- Styles (Combined from all steps) ---
const styles = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' },
  taskCard: (status) => ({
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    borderLeft: `5px solid ${status === 'Done' ? '#34c759' : (status === 'In Progress' ? '#007aff' : '#ccc')}`,
  }),
  taskDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 1rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  taskActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  button: (variant = 'primary') => ({
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: variant === 'primary' ? '#007aff' : '#f0f0f0',
    color: variant === 'primary' ? 'white' : '#333',
    cursor: 'pointer',
    fontSize: '0.9rem',
  }),
  deleteButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#ff3b30',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  backButton: {
    textDecoration: 'none',
    color: '#007aff',
    fontSize: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  createButton: {
    padding: '10px 15px',
    backgroundColor: '#007aff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

// --- TaskCard Component (This is the full, correct version) ---
function TaskCard({ task, user, userRole, onEdit, onDelete }) {
  const isAssignedToMe = user._id === task.assignee?._id;
  
  // Use the global 'Admin' role OR the contextual 'Team Admin' role
  const isAdmin = (user && user.role === 'Admin') || userRole === 'Admin';
  
  // A member can edit status if they are assigned
  const canEditStatus = isAdmin || (userRole === 'Member' && isAssignedToMe);
  
  // Only an Admin can fully edit
  const canEditTask = isAdmin;

  const handleChangeStatus = () => {
    alert(`(WIP) Change status for: ${task.title}`);
  };
  
  return (
    <div style={styles.taskCard(task.status)}>
      <h3>{task.title}</h3>
      <div style={styles.taskDetails}>
        <div>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
        </div>
        <div>
          <p><strong>Assignee:</strong> 
            {isAssignedToMe 
              ? <strong style={{color: '#007aff'}}> (Assigned to You)</strong> 
              : ` ${task.assignee ? task.assignee.name : 'Unassigned'}`
            }
          </p>
          <p><small>Reporter: {task.createdBy ? task.createdBy.name : 'Unknown'}</small></p>
        </div>
      </div>
      <p>{task.description || 'No description'}</p>
      
      <div style={styles.taskActions}>
        {canEditStatus && !isAdmin && (
          <button onClick={handleChangeStatus} style={styles.button('secondary')}>
            Change Status
          </button>
        )}
        
        {canEditTask && (
          <>
            <button onClick={() => onEdit(task)} style={styles.button('primary')}>
              Edit
            </button>
            <button onClick={() => onDelete(task)} style={styles.deleteButton}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
// === END OF TaskCard COMPONENT ===


// --- Main Page Component ---
export default function TaskPage() {
  const { projectId } = useParams();
  
  // === THIS IS THE FIX ===
  const { token, user } = useAuth(); // Removed the trailing '_'
  // ========================

  const { socket, isConnected } = useSocket();
  const navigate = useNavigate(); 

  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // For the edit modal

  const isAdmin = user && user.role === 'Admin';
  const isTeamAdmin = userRole === 'Admin';

  // Effect to fetch ALL page data (tasks + role)
  useEffect(() => {
    if (token && user) {
      setLoading(true);
      fetch(`http://localhost:3000/api/v1/projects/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { 
            throw new Error(err.message || 'Failed to fetch tasks') 
          });
        }
        return res.json();
      })
      .then(data => {
        setTasks(data.tasks || []);
        setUserRole(data.userRole);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    } else if (!token) {
      setLoading(false);
    }
  }, [token, projectId, user]);

  // Effect to listen for real-time socket events
  useEffect(() => {
    if (socket && isConnected) {
      const onTaskCreated = (newTask) => {
        if (newTask.project === projectId) {
          setTasks((prevTasks) => [newTask, ...prevTasks]);
        }
      };
      const onTaskUpdated = (updatedTask) => {
        if (updatedTask.project === projectId) {
          setTasks((prevTasks) => 
            prevTasks.map(task => 
              task._id === updatedTask._id ? updatedTask : task
            )
          );
        }
      };
      const onTaskDeleted = ({ taskId }) => {
        setTasks((prevTasks) => 
          prevTasks.filter(task => task._id !== taskId)
        );
      };

      socket.on('task_created', onTaskCreated);
      socket.on('task_updated', onTaskUpdated);
      socket.on('task_deleted', onTaskDeleted);

      return () => {
        socket.off('task_created', onTaskCreated);
        socket.off('task_updated', onTaskUpdated);
        socket.off('task_deleted', onTaskDeleted);
      };
    }
  }, [socket, isConnected, projectId]);

  // Function to handle DELETE
  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/v1/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete task');
      // Our 'task_deleted' socket listener will handle removing it from the UI.
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <> 
      <div style={styles.page}>
        <header style={styles.header}>
          <h2>Tasks</h2>
          <div style={styles.headerActions}>
            
            {/* Show button if user is Super Admin OR this team's Admin */}
            {(isAdmin || isTeamAdmin) && (
              <button onClick={() => setShowCreateTask(true)} style={styles.createButton}>
                + New Task
              </button>
            )}

            <button onClick={() => navigate(-1)} style={styles.backButton}>
              &larr; Back to Project
            </button>
          </div>
        </header>

        {loading && <p>Loading tasks...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={styles.taskList}>
          {!loading && user && userRole && Array.isArray(tasks) && tasks.map((task) => (
            <TaskCard 
              key={task._id} 
              task={task} 
              user={user} 
              userRole={userRole}
              onEdit={setEditingTask} // Pass the function
              onDelete={handleDeleteTask} // Pass the function
            />
          ))}
          {!loading && Array.isArray(tasks) && tasks.length === 0 && (
            <p>This project has no tasks yet.</p>
          )}
        </div>
      </div>
      
      <CreateTaskModal 
        show={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={projectId}
      />
      
      <EditTaskModal 
        show={!!editingTask} // Show if 'editingTask' is not null
        onClose={() => setEditingTask(null)}
        task={editingTask} // Pass the selected task's data
      />
    </>
  );
}