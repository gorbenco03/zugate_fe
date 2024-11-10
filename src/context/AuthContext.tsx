import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../types/auth';

interface AuthContextType {
  token: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        if (decoded.user && decoded.user.role) {
          return storedToken;
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    return null;
  });
  
  const [role, setRole] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        return decoded.user.role;
      } catch {
        return null;
      }
    }
    return null;
  });

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
      setRole(null);
    }
  }, [token]);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem('token');
      setTokenState(null);
      setRole(null);
    }
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