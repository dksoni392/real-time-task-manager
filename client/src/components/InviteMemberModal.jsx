// client/src/components/InviteMemberModal.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

// (Styles for the form)
const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  formInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  formSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: 'white' },
  formButton: { padding: '10px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  label: { fontSize: '0.9rem', color: '#555' }
};

export default function InviteMemberModal({ show, onClose, teamId }) {
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors

    try {
      // 1. Call our existing invite API
      const res = await fetch(`http://localhost:3000/api/v1/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to invite user');
      }
      
      // 2. Success! Our socket listeners will notify everyone.
      // We can give the Admin instant feedback.
      alert('Invite sent successfully!');
      onClose(); // Close the modal
      setEmail('');
      setRole('Member');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Invite New Member">
      <form style={styles.form} onSubmit={handleSubmit}>
        
        <div style={styles.formGroup}>
          <label htmlFor="user-email" style={styles.label}>User's Email</label>
          <input 
            id="user-email"
            style={styles.formInput} 
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label htmlFor="invite-role" style={styles.label}>Role</label>
          <select 
            id="invite-role"
            style={styles.formSelect}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        
        <button type="submit" style={styles.formButton}>
          Send Invite
        </button>
      </form>
    </Modal>
  );
}