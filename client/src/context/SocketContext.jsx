// client/src/context/SocketContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// const SOCKET_URL = 'http://localhost:3000';

// To this:
const SOCKET_URL = '/';

const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // <-- 1. NEW STATE
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      // User is logged in
      const newSocket = io(SOCKET_URL, {
        query: { token }
      });

      setSocket(newSocket);
      console.log('Socket connecting...');

      // --- Define standard connection events ---
      newSocket.on('connect', () => {
        console.log('Socket Connected!', newSocket.id);
        setIsConnected(true); // <-- 2. UPDATE STATE ON EVENT
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket Disconnected:', reason);
        setIsConnected(false); // <-- 3. UPDATE STATE ON EVENT
      });

      return () => {
        // Cleanup on logout or component unmount
        console.log('Disconnecting socket...');
        newSocket.disconnect();
        setIsConnected(false); // 4. CLEANUP STATE
      };

    } else {
      // No token (user is logged out)
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false); // 5. CLEANUP STATE
      }
    }
  }, [token]); // Effect re-runs when token changes

  // 6. PROVIDE *BOTH* THE SOCKET AND THE STATUS
  const value = { socket, isConnected };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}