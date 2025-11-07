import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Modal from '../components/Modal';

// --- Styles (Complete) ---
const styles = {
  page: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
  projectList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' },
  projectCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', textDecoration: 'none', color: 'inherit', display: 'block' },
  backButton: { textDecoration: 'none', color: '#007aff', fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  createButton: { padding: '10px 15px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  formTextarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' },
  formButton: { padding: '10px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

export default function ProjectPage() {
  const { teamId } = useParams(); 
  const navigate = useNavigate();
  
  // === THIS IS THE FIX ===
  // Removed the trailing '_' from the destructuring
  const { user, token } = useAuth();
  // ========================

  const { socket, isConnected } = useSocket();

  const [projects, setProjects] = useState([]); // Default to an empty array
  const [teamRole, setTeamRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const isAdmin = user && user.role === 'Admin';

  // useEffect to fetch projects (this will now run)
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(`http://localhost:3000/api/v1/teams/${teamId}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.message || 'Failed to fetch projects');
          });
        }
        return res.json();
      })
      .then(data => { 
        setProjects(data.projects || []); // Use data.projects, fallback to []
        setTeamRole(data.userRole); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error("Fetch error:", err);
        setError(err.message); 
        setLoading(false); 
      });
    } else if (!user) {
      // Only set loading to false if we're not waiting for the user object
      setLoading(false);
    }
  }, [token, teamId, user]); // Added 'user' as a dependency

  // useEffect for socket 'project_created'
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewProject = (newProject) => {
        if (newProject.team === teamId) {
          setProjects((prevProjects) => [newProject, ...prevProjects]);
        }
      };
      socket.on('project_created', handleNewProject);
      return () => { socket.off('project_created', handleNewProject); };
    }
  }, [socket, isConnected, teamId]);
  
  // handleCreateProject function (unchanged)
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/v1/teams/${teamId}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      // Socket listener will handle the UI update
      setNewProjectName('');
      setNewProjectDesc('');
      setShowCreateModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <> 
      <div style={styles.page}>
        <header style={styles.header}>
          <h2>Projects</h2>
          <div style={styles.headerActions}>
            {isAdmin && (
              <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
                + New Project
              </button>
            )}
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              &larr; Back
            </button>
          </div>
        </header>

        {loading && <p>Loading projects...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={styles.projectList}>
          {!loading && Array.isArray(projects) && projects.map((project) => (
            <Link to={`/projects/${project._id}`} key={project._id} style={styles.projectCard}>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
            </Link>
          ))}
          {!loading && Array.isArray(projects) && projects.length === 0 && (
            <p>This team has no projects yet.</p>
          )}
        </div>
      </div>

      <Modal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Create New Project"
      >
        <form style={styles.form} onSubmit={handleCreateProject}>
          <label htmlFor="proj-name">Project Name (Required)</label>
          <input 
            id="proj-name"
            style={styles.formInput} 
            type="text" 
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required 
          />
          <label htmlFor="proj-desc">Description (Optional)</label>
          <textarea
            id="proj-desc"
            style={styles.formTextarea}
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
          />
          <button type="submit" style={styles.formButton}>Create Project</button>
        </form>
      </Modal>
    </>
  );
}