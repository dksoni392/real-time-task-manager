// client/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- 1. Import the hook
import { useNavigate } from 'react-router-dom'; // <-- 2. Import for redirect

// (Your 'styles' object can remain exactly the same)
const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  form: { display: 'flex', flexDirection: 'column', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', width: '300px' },
  input: { marginBottom: '1rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  button: { padding: '0.75rem', border: 'none', borderRadius: '4px', backgroundColor: '#007aff', color: 'white', fontSize: '1rem', cursor: 'pointer' },
  title: { textAlign: 'center', color: '#333', marginBottom: '1.5rem' }
};

function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);

  const { login } = useAuth(); // <-- 3. Get the login function from context
  const navigate = useNavigate(); // <-- 4. Get the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // 5. Call the global login function
      await login(email, password);

      // 6. Redirect to the dashboard on success!
      navigate('/teams');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Welcome Back</h2>
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;