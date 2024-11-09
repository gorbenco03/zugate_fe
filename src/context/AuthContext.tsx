// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import corect pentru v4

interface AuthContextType {
  token: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
}

interface JwtPayload {
  user: {
    id: string;
    role: string;
  };
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        setRole(payload.user.role);
      } catch (error) {
        console.error('Eroare la decodarea token-ului:', error);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};