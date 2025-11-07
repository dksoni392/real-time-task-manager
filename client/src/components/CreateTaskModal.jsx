// client/src/components/CreateTaskModal.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal'; // Reuse our new Modal

// --- Styles for our new form ---
const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  formInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  formTextarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', fontSize: '1rem' },
  formSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: 'white' },
  formButton: { padding: '10px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  label: { fontSize: '0.9rem', color: '#555' }
};

export default function CreateTaskModal({ show, onClose, projectId }) {
  const { token } = useAuth();

  // --- 1. State for ALL form fields ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default
  const [status, setStatus] = useState('To Do'); // Default
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. Call our NEW, clean API route
      const res = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          assigneeId: assigneeId || undefined, // Send 'undefined' if string is empty
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create task');
      }

      // 3. Our 'task_created' socket listener in TaskPage.jsx
      // will handle adding this to the UI automatically.

      // 4. Reset form and close modal
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setAssigneeId('');
      onClose();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Create New Task">
      <form style={styles.form} onSubmit={handleSubmit}>

        <div style={styles.formGroup}>
          <label htmlFor="task-title" style={styles.label}>Title (Required)</label>
          <input 
            id="task-title"
            style={styles.formInput} 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="task-desc" style={styles.label}>Description</label>
          <textarea
            id="task-desc"
            style={styles.formTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="task-status" style={styles.label}>Status</label>
          <select 
            id="task-status"
            style={styles.formSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="task-priority" style={styles.label}>Priority</label>
          <select 
            id="task-priority"
            style={styles.formSelect}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          {/* FIXME: This should be a dropdown of team members */}
          {/* We will build the 'GET /teams/:teamId/members' API for this next. */}
          <label htmlFor="task-assignee" style={styles.label}>Assignee ID (Optional)</label>
          <input 
            id="task-assignee"
            style={styles.formInput} 
            type="text" 
            placeholder="(WIP) Enter a User ID"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
        </div>

        <button type="submit" style={styles.formButton}>Create Task</button>
      </form>
    </Modal>
  );
}