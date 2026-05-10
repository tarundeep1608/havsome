export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--color-surface-950)' }}>
      <img src="/logo.png" alt="Havsome" className="w-20 h-20 rounded-2xl" 
        style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      <div className="spinner" />
      <p className="text-sm" style={{ color: 'var(--color-surface-500)' }}>{message}</p>
    </div>
  );
}
