import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

export default function KitchenLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface-950)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 glass-strong"
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Havsome" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cyan-brand)' }}>
              Kitchen Display
            </h1>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-surface-500)' }}>
              Live Orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-ghost btn-icon btn-sm"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon btn-sm"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-3 overflow-auto">
        <Outlet context={{ soundEnabled }} />
      </main>
    </div>
  );
}
