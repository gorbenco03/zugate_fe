import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
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
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setRole(decoded.user.role);
        localStorage.setItem('token', token);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setTokenState(null);
        setRole(null);
      }
    } else {
      localStorage.removeItem('token');
      setRole(null);
    }
  }, [token]);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};