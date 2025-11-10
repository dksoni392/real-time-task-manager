// client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/config.js'; // <-- 1. IMPORT YOUR CONFIG

// The URL for your backend API
// const API_URL = 'http://localhost:3000/api/v1';

// url for the deployment
const API_URL = '/api/v1';


// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the "Provider" (the component that will "hold" the data)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 3. Check localStorage on initial app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // 4. The Login Function
  const login = async (email, password) => {
    // This is the same fetch call from your LoginPage
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // --- This is the new, important part ---
    // 5. Set the state globally
    setUser(data);
    setToken(data.token);
    setIsAuthenticated(true);

    // 6. Save to localStorage to persist
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  // 7. The Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 8. Pass all this down to the app
  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 9. A handy custom hook to easily use the context
export function useAuth() {
  return useContext(AuthContext);
}