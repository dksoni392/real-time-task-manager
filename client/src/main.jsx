// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext'; // <-- 1. IMPORT
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // We removed StrictMode to help with socket connections
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider> {/* <-- 2. WRAP APP */}
          <App />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);