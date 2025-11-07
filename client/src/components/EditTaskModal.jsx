// client/src/components/EditTaskModal.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

// (We can re-use the same styles from CreateTaskModal)
const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  formInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
  formTextarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', fontSize: '1rem' },
  formSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', background: 'white' },
  formButton: { padding: '10px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  label: { fontSize: '0.9rem', color: '#555' }
};

export default function EditTaskModal({ show, onClose, task }) {
  const { token } = useAuth();

  // --- 1. State for ALL form fields ---
  // We use useEffect to pre-fill the form when the 'task' prop changes
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'To Do');
      setAssigneeId(task.assignee?._id || ''); // Handle populated assignee
    }
  }, [task]); // This effect re-runs whenever you click 'Edit' on a new task

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
      // 2. Call our 'update' API route
      const res = await fetch(`http://localhost:3000/api/v1/tasks/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          assigneeId: assigneeId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update task');
      }

      // 3. Our 'task_updated' socket listener in TaskPage.jsx
      // will handle updating the UI automatically.

      onClose(); // Just close the modal on success

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Edit Task">
      <form style={styles.form} onSubmit={handleSubmit}>

        <div style={styles.formGroup}>
          <label htmlFor="edit-task-title" style={styles.label}>Title (Required)</label>
          <input 
            id="edit-task-title"
            style={styles.formInput} 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="edit-task-desc" style={styles.label}>Description</label>
          <textarea
            id="edit-task-desc"
            style={styles.formTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="edit-task-status" style={styles.label}>Status</label>
          <select 
            id="edit-task-status"
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
          <label htmlFor="edit-task-priority" style={styles.label}>Priority</label>
          <select 
            id="edit-task-priority"
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
          <label htmlFor="edit-task-assignee" style={styles.label}>Assignee ID (Optional)</label>
          <input 
            id="edit-task-assignee"
            style={styles.formInput} 
            type="text" 
            placeholder="(WIP) Enter a User ID"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
        </div>

        <button type="submit" style={styles.formButton}>Save Changes</button>
      </form>
    </Modal>
  );
}