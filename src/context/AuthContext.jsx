// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('wa_token'));
  const [username, setUsername] = useState(localStorage.getItem('wa_user'));
  const [role, setRole] = useState(localStorage.getItem('wa_role') || 'super_admin');

  const login = async (user, pass) => {
    const res = await api.post('/auth/login', { username: user, password: pass });
    localStorage.setItem('wa_token', res.data.token);
    localStorage.setItem('wa_user', res.data.username);
    localStorage.setItem('wa_role', res.data.role || 'super_admin');
    setToken(res.data.token);
    setUsername(res.data.username);
    setRole(res.data.role || 'super_admin');
  };

  const logout = () => {
    localStorage.removeItem('wa_token');
    localStorage.removeItem('wa_user');
    localStorage.removeItem('wa_role');
    setToken(null);
    setUsername(null);
    setRole('super_admin');
  };

  return (
    <AuthContext.Provider value={{
      token, username, role, login, logout,
      isLoggedIn: !!token,
      isSuperAdmin: role === 'super_admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
