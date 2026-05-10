import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Receipt,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/manual-order', icon: PlusCircle, label: 'New Order' },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { path: '/admin/billing', icon: Receipt, label: 'Billing' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-950/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-surface-200 shadow-sm`}
      >
        {/* Logo & Brand */}
        <div className="p-6 flex items-center gap-4 border-b border-surface-200">
          <img src="/logo.png" alt="Havsome" className="w-12 h-12 rounded-xl shadow-sm" />
          <div>
            <h1 className="text-xl font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
              Havsome
            </h1>
            <p className="text-xs uppercase tracking-widest text-surface-500 font-semibold mt-0.5">
              Admin Panel
            </p>
          </div>
          <button
            className="ml-auto lg:hidden p-2 bg-surface-100 rounded-lg text-surface-500 hover:text-surface-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-5 border-t border-surface-200 bg-surface-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary-600 text-white shadow-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-surface-900 truncate">{user?.email || 'Admin'}</p>
              <p className="text-xs font-semibold text-surface-500 mt-0.5">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-surface-200 text-surface-700 font-bold text-sm hover:bg-danger hover:text-white hover:border-danger transition-colors shadow-sm"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center gap-3 px-5 py-4 sticky top-0 z-30 bg-white border-b border-surface-200 shadow-sm"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-surface-100 rounded-lg text-surface-600 hover:text-surface-900 transition-colors"
          >
            <Menu size={20} />
          </button>
          <img src="/logo.png" alt="Havsome" className="w-8 h-8 rounded-lg shadow-sm" />
          <h1 className="text-base font-bold text-surface-950" style={{ fontFamily: 'var(--font-display)' }}>
            Havsome Admin
          </h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-5 lg:p-8 overflow-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
