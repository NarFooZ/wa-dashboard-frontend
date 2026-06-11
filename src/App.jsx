// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import Members from './pages/Members';
import Billing from './pages/Billing';
import Rules from './pages/Rules';
import Settings from './pages/Settings';

function Protected({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Cairo, sans-serif', fontSize: '14px', direction: 'rtl' },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/group" element={<Group />} />
                <Route path="/members" element={<Members />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Protected>
        } />
      </Routes>
    </>
  );
}
