// client/src/components/NotificationDisplay.jsx

import { useNotifications } from '../context/NotificationContext';

// --- Styles for the toast container ---
const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    width: '300px',
  },
  toast: (type) => ({
    backgroundColor: type === 'success' ? '#34c759' : '#007aff',
    color: 'white',
    padding: '1rem',
    borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    marginBottom: '10px',
    fontSize: '0.9rem',
    opacity: 0.95,
  }),
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  clearButton: {
    background: 'none',
    border: '1px solid #fff6',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default function NotificationDisplay() {
  const { notifications, clearNotifications } = useNotifications();

  if (notifications.length === 0) {
    return null; // Don't render anything if no notifications
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <strong style={{color: '#333'}}>Notifications</strong>
        <button onClick={clearNotifications} style={styles.clearButton}>
          Clear All
        </button>
      </div>
      {/* We'll just show the top 3 most recent notifications */}
      {notifications.slice(0, 3).map((note) => (
        <div key={note.id} style={styles.toast(note.type)}>
          {note.message}
        </div>
      ))}
    </div>
  );
}