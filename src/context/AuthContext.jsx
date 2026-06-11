// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('wa_token'));
  const [username, setUsername] = useState(localStorage.getItem('wa_user'));

  const login = async (user, pass) => {
    const res = await api.post('/auth/login', { username: user, password: pass });
    localStorage.setItem('wa_token', res.data.token);
    localStorage.setItem('wa_user', res.data.username);
    setToken(res.data.token);
    setUsername(res.data.username);
  };

  const logout = () => {
    localStorage.removeItem('wa_token');
    localStorage.removeItem('wa_user');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
