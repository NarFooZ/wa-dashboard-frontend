// src/components/Layout.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Receipt, Settings,
  LogOut, MessageCircle, Zap, Menu, X, ShieldCheck, Archive
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'الرئيسية', superOnly: false },
  { to: '/group', icon: MessageCircle, label: 'المجموعة', superOnly: false },
  { to: '/members', icon: Users, label: 'الأعضاء', superOnly: false },
  { to: '/archived', icon: Archive, label: 'الأرشيف', superOnly: false },
  { to: '/billing', icon: Receipt, label: 'المحاسبة', superOnly: false },
  { to: '/rules', icon: Zap, label: 'قواعد الخصم', superOnly: false },
  { to: '/admins', icon: ShieldCheck, label: 'المشرفون', superOnly: true },
  { to: '/settings', icon: Settings, label: 'الإعدادات', superOnly: false },
];

export default function Layout({ children }) {
  const { username, role, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = navItems.filter(item => !item.superOnly || isSuperAdmin);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-wa-green flex items-center justify-center shadow-sm">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">لوحة واتساب</p>
            <p className="text-xs text-gray-400">إدارة ومحاسبة</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-gray-700">{username}</p>
            <p className="text-xs text-gray-400">{isSuperAdmin ? 'مدير رئيسي' : 'مشرف مساعد'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-l border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-xl flex flex-col">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-wa-green" />
            <span className="font-bold text-gray-800">لوحة واتساب</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
