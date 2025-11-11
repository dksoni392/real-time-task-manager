import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import InviteMemberModal from '../components/InviteMemberModal';
import { API_BASE_URL } from '../config/config.js'; // Import your config

// --- Styles (Complete) ---
const styles = {
  dashboard: { padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid #ddd',
  },
  headerActions: {
    display: 'flex',
    gap: '1.5rem', // Increased gap
    alignItems: 'center',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
  },
  statusLight: (isConnected) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: isConnected ? '#34c759' : '#ff3b30',
  }),
  logoutButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#eee',
    cursor: 'pointer',
  },
  teamList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  teamCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  teamCardLink: { textDecoration: 'none', color: 'inherit' },
  teamCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f0f0f0',
  },
  infoButton: { fontSize: '0.9rem', color: '#555' },
  inviteButton: {
    padding: '8px 12px',
    backgroundColor: '#34c759',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  // --- 1. ADDED STYLES FOR DELETE AND BUTTONS ---
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#ff3b30',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  adminButtonsContainer: {
    display: 'flex',
    gap: '0.5rem',
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
  // --- Form Styles (for the modal) ---
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.9rem', color: '#555' },
  formInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  formTextarea: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '80px',
    fontSize: '1rem',
  },
  formButton: {
    padding: '10px',
    backgroundColor: '#007aff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
};

export default function TeamDashboard() {
  const { user, logout, token } = useAuth(); // Corrected typo
  const { socket, isConnected } = useSocket();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [inviteTeamId, setInviteTeamId] = useState(null);

  const isAdmin = user && user.role === 'Admin';

  // Effect to fetch teams
  useEffect(() => {
    if (token) {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/api/v1/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch teams');
          return res.json();
        })
        .then((data) => {
          setMemberships(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false); // No token, so not loading
    }
  }, [token]);

  // Effect to listen for real-time socket events
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewTeam = (newTeam) => {
        alert(`You've been added to a new team: ${newTeam.name}. Refreshing list...`);
        window.location.reload();
      };
      
      const handleMemberJoined = (payload) => {
         setMemberships(currentMemberships => 
           currentMemberships.map(mem => 
             mem.team._id === payload.teamId 
               ? { ...mem, memberCount: mem.memberCount + 1 } 
               : mem
           )
         );
      };

      const handleTeamDeleted = ({ teamId }) => {
        setMemberships((prev) => 
          prev.filter(mem => mem.team._id !== teamId)
        );
      };

      socket.on('added_to_team', handleNewTeam);
      socket.on('member_joined', handleMemberJoined);
      socket.on('team_deleted', handleTeamDeleted);
      
      return () => {
        socket.off('added_to_team', handleNewTeam);
        socket.off('member_joined', handleMemberJoined);
        socket.off('team_deleted', handleTeamDeleted); // <-- 2. THIS WAS THE MISSING LINE
      };
    }
  }, [socket, isConnected]);
  
  // Handle creating a new team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      // --- 3. THIS WAS THE MISSING URL FIX ---
      const res = await fetch(`${API_BASE_URL}/api/v1/teams`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDesc,
        }),
      });
      if (!res.ok) throw new Error('Failed to create team');
      const newTeam = await res.json();
      setMemberships((prev) => [...prev, { team: newTeam, role: 'Admin', memberCount: 1 }]);
      setNewTeamName('');
      setNewTeamDesc('');
      setShowCreateTeam(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 4. ADDED 'handleDeleteTeam' FUNCTION ---
  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to delete "${team.name}"? This will delete all its projects and tasks.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/teams/${team._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.message || 'Failed to delete team');
      }
      // The socket listener 'team_deleted' will handle the UI update
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div style={styles.dashboard}>
        <header style={styles.header}>
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <div style={styles.headerActions}>
            {isAdmin && (
              <button
                onClick={() => setShowCreateTeam(true)}
                style={styles.createButton}
              >
                + New Team
              </button>
            )}
            <div style={styles.status}>
              <span style={styles.statusLight(isConnected)}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </header>

        <h2>My Teams</h2>

        {loading && <p>Loading your teams...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={styles.teamList}>
          {!loading &&
            memberships.map((mem) => (
              <div key={mem.team._id} style={styles.teamCard}>
                <Link to={`/teams/${mem.team._id}`} style={styles.teamCardLink}>
                  <h3>{mem.team.name}</h3>
                  <p>{mem.team.description || 'No description'}</p>
                </Link>
                
                <div style={styles.teamCardFooter}>
                  <span style={styles.infoButton}>
                    {mem.memberCount} {mem.memberCount > 1 ? 'Members' : 'Member'}
                  </span>
                  
                  {/* --- 5. UPDATED JSX FOR ADMIN BUTTONS --- */}
                  {isAdmin && (
                    <div style={styles.adminButtonsContainer}>
                      <button 
                        onClick={() => setInviteTeamId(mem.team._id)} 
                        style={styles.inviteButton}
                      >
                        + Invite
                      </button>
                      <button 
                        onClick={() => handleDeleteTeam(mem.team)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
          {!loading && memberships.length === 0 && (
            <p>You are not a part of any teams yet.</p>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal 
        show={showCreateTeam} 
        onClose={() => setShowCreateTeam(false)} 
        title="Create New Team"
      >
        <form style={styles.form} onSubmit={handleCreateTeam}>
          <div style={styles.formGroup}>
            <label htmlFor="team-name" style={styles.label}>Team Name (Required)</label>
            <input
              id="team-name"
              style={styles.formInput}
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="team-desc" style={styles.label}>Description (Optional)</label>
            <textarea
              id="team-desc"
              style={styles.formTextarea}
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
            />
          </div>
          <button type="submit" style={styles.formButton}>
            Create Team
          </button>
        </form>
      </Modal>
      
      <InviteMemberModal
        show={!!inviteTeamId}
        onClose={() => setInviteTeamId(null)}
        teamId={inviteTeamId}
      />
    </>
  );
}